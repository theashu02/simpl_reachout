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
