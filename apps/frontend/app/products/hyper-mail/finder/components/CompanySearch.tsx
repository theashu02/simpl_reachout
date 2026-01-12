"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { memo, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { getEdenClient } from "@/lib/ApiService/edenClient";
import CustomSkeleton from "./CustomSkeleton";
import dynamic from "next/dynamic";
import type { CompanyResult } from "./CompanyTable";

const CompanyTable = dynamic(() => import("./CompanyTable"), {
  loading: () => <CustomSkeleton />,
});

const verifyCompanyDomain = async (companyName: string): Promise<CompanyResult> => {
  const client = getEdenClient();
  const response = await client.api.protected.domain.verify.post({
    companyName,
  });

  if (response.error) {
    const errorValue = response.error.value as { error?: string } | undefined;
    throw new Error(errorValue?.error || "Failed to verify domain");
  }

  return response.data as CompanyResult;
};

const CompanySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<CompanyResult[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: verifyCompanyDomain,
    onSuccess: (data) => {
      setResults((prev) => {
        const filtered = prev.filter((item) => item.company_name.toLowerCase() !== data.company_name.toLowerCase());
        return [data, ...filtered];
      });
      setSearchQuery("");
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

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Domain Search</h2>
        </div>

        <Button variant="outline" className="gap-2 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
          Upload a list of domains to search
        </Button>
      </div>

      {/* Big Search Input */}
      <div className="relative">
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

      {/* Results Table */}
      <div className="space-y-4">
        <CompanyTable data={results.length > 0 ? results : undefined} />
      </div>
    </>
  );
};

export default memo(CompanySearch);
