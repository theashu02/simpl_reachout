"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X } from "lucide-react";
import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { useMutation, useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { getEdenClient } from "@/lib/ApiService/edenClient";
import { getUserCompaniesPaginated, type SortOrder } from "../actions";
import CustomSkeleton from "./CustomSkeleton";
import dynamic from "next/dynamic";
import type { CompanyResult } from "./VirtualizedCompanyTable";

const VirtualizedCompanyTable = dynamic(() => import("./VirtualizedCompanyTable"), { loading: () => <CustomSkeleton /> });

const PAGE_SIZE = 10;
type CompaniesPage = { companies: CompanyResult[]; hasMore: boolean; total: number; page: number };

const normalizeCompanyResult = (company: Partial<CompanyResult> & { companyName?: string; logoUrl?: string | null; linkedinUrl?: string | null }): CompanyResult => {
  const name = (company.company_name ?? company.companyName ?? "Unknown company").trim() || "Unknown company";
  const domain = (company.domain ?? null) as string | null;

  return {
    company_name: name,
    exists: company.exists ?? Boolean(domain),
    domain,
    url: company.url ?? null,
    confidence: typeof company.confidence === "number" ? company.confidence : undefined,
    title: company.title ?? name,
    description: company.description ?? "",
    verified: Boolean(company.verified),
    source: company.source ?? "unknown",
    linkedin_url: company.linkedin_url ?? company.linkedinUrl ?? null,
    logo_url: company.logo_url ?? company.logoUrl ?? null,
  };
};

// Verify company via Elysia backend (for Serper API search)
const verifyCompanyDomain = async (companyName: string): Promise<CompanyResult> => {
  const client = getEdenClient();
  const response = await client.api.protected.domain.verify.post({
    companyName,
  });

  if (response.error) {
    const errorValue = response.error.value as { error?: string } | undefined;
    throw new Error(errorValue?.error || "Failed to verify domain");
  }

  return normalizeCompanyResult(response.data as CompanyResult);
};

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const CompanySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const queryClient = useQueryClient();

  // Debounce table filter to avoid too many requests
  const debouncedFilter = useDebounce(tableFilter, 300);

  // Fetch paginated companies from DB via server action
  const {
    data,
    isLoading: isLoadingCompanies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<CompaniesPage, Error, InfiniteData<CompaniesPage>, [string, SortOrder, string], number>({
    queryKey: ["userCompaniesPaginated", sortOrder, debouncedFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;
      const result = await getUserCompaniesPaginated(page, PAGE_SIZE, sortOrder, debouncedFilter || undefined);
      if (result.error) {
        console.error("Failed to load companies:", result.error);
        return { companies: [], hasMore: false, total: 0, page };
      }
      return {
        companies: (result.data || []).map((company) => normalizeCompanyResult(company)),
        hasMore: result.hasMore,
        total: result.total,
        page,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const allCompanies = useMemo(() => {
    return data?.pages.flatMap((page) => page.companies) ?? [];
  }, [data]);

  const total = data?.pages[0]?.total ?? 0;

  // Verify company mutation
  const { mutate, isPending } = useMutation({
    mutationFn: verifyCompanyDomain,
    onSuccess: (company) => {
      const normalized = normalizeCompanyResult(company);
      const normalizedDomain = normalized.domain?.toLowerCase();

      // Optimistically update the cache - add new company and remove any duplicates
      queryClient.setQueryData<InfiniteData<CompaniesPage>>(["userCompaniesPaginated", sortOrder, debouncedFilter], (existing) => {
        if (!existing) {
          return {
            pageParams: [1],
            pages: [{ companies: [normalized], hasMore: false, total: 1, page: 1 }],
          };
        }

        // Remove duplicates across ALL pages first
        const prunedPages = existing.pages.map((page) => ({
          ...page,
          companies: normalizedDomain ? page.companies.filter((c) => c.domain?.toLowerCase() !== normalizedDomain) : page.companies,
        }));

        // Add the new company to the first page
        const firstPage = prunedPages[0];
        const totalCompanies = prunedPages.reduce((sum, p) => sum + p.companies.length, 0) + 1;

        return {
          ...existing,
          pages: [
            {
              ...firstPage,
              companies: [normalized, ...(firstPage?.companies ?? [])],
              total: totalCompanies,
            },
            ...prunedPages.slice(1),
          ],
        };
      });

      // Clear search and refetch after a short delay to sync with server
      setSearchQuery("");
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["userCompaniesPaginated", sortOrder, debouncedFilter],
        });
      }, 500);
    },
    onError: (error) => {
      console.error("Domain verification error:", error);
    },
  });

  const handleSearch = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 2) {
      mutate(trimmed);
    }
  }, [searchQuery, mutate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSortToggle = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const handleClearFilter = useCallback(() => {
    setTableFilter("");
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Domain Search</h2>
        </div>

        <Button variant="outline" className="gap-2 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
          Upload a list of domains to search
        </Button>
      </div>

      {/* Add new company search */}
      <div className="relative shrink-0">
        <Input
          placeholder="Enter a domain or company name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className="h-14 pl-4 pr-14 text-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
        />
        <Button variant="ghost" onClick={handleSearch} disabled={isPending || searchQuery.trim().length < 2} className="absolute right-0 top-0 h-full w-14 p-0 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </Button>
      </div>

      {/* Table filter */}
      <div className="relative max-w-sm shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter companies..." value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} className="pl-9 pr-8 h-9 text-sm" />
        {tableFilter && (
          <button onClick={handleClearFilter} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table - takes remaining space */}
      <div className="flex-1 min-h-0">
        {isLoadingCompanies ? <CustomSkeleton /> : <VirtualizedCompanyTable data={allCompanies} hasMore={hasNextPage ?? false} isFetchingNextPage={isFetchingNextPage} fetchNextPage={handleFetchNextPage} total={total} sortOrder={sortOrder} onSortToggle={handleSortToggle} />}
      </div>
    </div>
  );
};

export default memo(CompanySearch);
