export interface LinkedInEnrichInput {
  linkedinUrl: string;
}

export interface LinkedInBulkEnrichInput {
  linkedinUrls: string[];
}

export interface EmployeeCountRange {
  start: number;
  end: number | null;
}

export interface LinkedInAddress {
  country: string | null;
  city: string | null;
  geographicArea: string | null;
  postalCode: string | null;
  line1: string | null;
  line2: string | null;
  description: string | null;
}

export interface CallToAction {
  displayText: string;
  type: string;
  url: string;
}

export interface FoundedOn {
  month: number | null;
  year: number | null;
  day: number | null;
}

export interface SimilarOrganization {
  name: string;
  followerCount: number;
  url: string;
  logoResolutionResult: string | null;
  croppedCoverImage: string | null;
  industryV2Taxonomy: string | null;
  industry: string | null;
  originalCoverImage: string | null;
  companyId: number;
  employeeCountRange: EmployeeCountRange | null;
  headquarter: LinkedInAddress | null;
  universalName: string;
}

export interface LinkedInCompanyRaw {
  url: string;
  companyName: string;
  websiteUrl: string | null;
  industry: string | null;
  employeeCount: number | null;
  followerCount: number | null;
  universalName: string | null;
  tagline: string | null;
  description: string | null;
  companyId: number | null;
  hashtag: string | null;
  industryV2Taxonomy: string | null;
  callToAction: CallToAction | null;
  employeeCountRange: EmployeeCountRange | null;
  headquarter: LinkedInAddress | null;
  foundedOn: FoundedOn | null;
  logoResolutionResult: string | null;
  originalCoverImage: string | null;
  croppedCoverImage: string | null;
  specialities: string[] | null;
  crunchbaseFundingData: unknown | null;
  similarOrganizations: SimilarOrganization[] | null;
}

export interface EnrichedCompanyData {
  linkedinUrl: string;
  companyId: number | null;
  universalName: string | null;

  companyName: string;
  tagline: string | null;
  description: string | null;
  websiteUrl: string | null;

  industry: string | null;
  industryV2Taxonomy: string | null;

  employeeCount: number | null;
  employeeCountRange: EmployeeCountRange | null;
  followerCount: number | null;

  logoUrl: string | null;
  coverImageUrl: string | null;

  headquarter: LinkedInAddress | null;
  foundedYear: number | null;
  specialities: string[] | null;
  callToAction: CallToAction | null;
  similarOrganizations: SimilarOrganizationSummary[] | null;
}

export interface SimilarOrganizationSummary {
  name: string;
  linkedinUrl: string;
  logoUrl: string | null;
  industry: string | null;
  employeeRange: string | null;
}

export interface EnrichResult {
  success: boolean;
  data: EnrichedCompanyData | null;
  error: string | null;
  linkedinUrl: string;
}

export interface BulkEnrichResult {
  results: EnrichResult[];
  count: number;
  successful: number;
  failed: number;
}
