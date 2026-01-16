// ============================================================================
// LinkedIn Company Enrichment Types
// ============================================================================

/**
 * Input for single LinkedIn company enrichment
 */
export interface LinkedInEnrichInput {
  linkedinUrl: string;
}

/**
 * Input for bulk LinkedIn company enrichment
 */
export interface LinkedInBulkEnrichInput {
  linkedinUrls: string[];
}

/**
 * Employee count range from LinkedIn
 */
export interface EmployeeCountRange {
  start: number;
  end: number | null;
}

/**
 * Headquarter/Location address details
 */
export interface LinkedInAddress {
  country: string | null;
  city: string | null;
  geographicArea: string | null;
  postalCode: string | null;
  line1: string | null;
  line2: string | null;
  description: string | null;
}

/**
 * Call to action button on LinkedIn page
 */
export interface CallToAction {
  displayText: string;
  type: string;
  url: string;
}

/**
 * Company founding date
 */
export interface FoundedOn {
  month: number | null;
  year: number | null;
  day: number | null;
}

/**
 * Similar organization/company data
 */
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

/**
 * Raw LinkedIn company data returned by Apify actor
 */
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

/**
 * Normalized company data for API response
 */
export interface EnrichedCompanyData {
  // Core identifiers
  linkedinUrl: string;
  companyId: number | null;
  universalName: string | null;

  // Basic info
  companyName: string;
  tagline: string | null;
  description: string | null;
  websiteUrl: string | null;

  // Industry
  industry: string | null;
  industryV2Taxonomy: string | null;

  // Size metrics
  employeeCount: number | null;
  employeeCountRange: EmployeeCountRange | null;
  followerCount: number | null;

  // Branding
  logoUrl: string | null;
  coverImageUrl: string | null;

  // Location
  headquarter: LinkedInAddress | null;

  // Additional info
  foundedYear: number | null;
  specialities: string[] | null;
  callToAction: CallToAction | null;

  // Related companies (condensed)
  similarOrganizations: SimilarOrganizationSummary[] | null;
}

/**
 * Condensed similar organization for response
 */
export interface SimilarOrganizationSummary {
  name: string;
  linkedinUrl: string;
  logoUrl: string | null;
  industry: string | null;
  employeeRange: string | null;
}

/**
 * Single enrichment API response
 */
export interface EnrichResult {
  success: boolean;
  data: EnrichedCompanyData | null;
  error: string | null;
  linkedinUrl: string;
}

/**
 * Bulk enrichment API response
 */
export interface BulkEnrichResult {
  results: EnrichResult[];
  count: number;
  successful: number;
  failed: number;
}
