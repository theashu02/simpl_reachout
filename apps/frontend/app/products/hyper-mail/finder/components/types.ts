import { getEdenClient } from "@/lib/ApiService/edenClient";
import { useEffect, useState } from "react";

export type SortOrder = "asc" | "desc";

export type CompanyResult = {
  company_name: string;
  exists?: boolean;
  domain: string | null;
  url?: string | null;
  confidence?: number;
  title?: string;
  description?: string;
  verified: boolean;
  source?: string;
  linkedin_url: string | null;
  logo_url: string | null;
};

export interface VirtualizedCompanyTableProps {
  data: CompanyResult[];
  hasMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  total?: number;
  sortOrder?: SortOrder;
  onSortToggle?: () => void;
}

export const PAGE_SIZE = 10;
export type CompaniesPage = { companies: CompanyResult[]; hasMore: boolean; total: number; page: number };

export const normalizeCompanyResult = (company: Partial<CompanyResult> & { companyName?: string; logoUrl?: string | null; linkedinUrl?: string | null }): CompanyResult => {
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

// Debounce hook for search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export const verifyCompanyDomain = async (companyName: string): Promise<CompanyResult> => {
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