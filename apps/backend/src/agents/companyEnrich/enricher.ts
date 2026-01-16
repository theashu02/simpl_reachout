import { ApifyClient } from "apify-client";
import { APIFY_API_TOKEN } from "../../utils/config";
import type { LinkedInCompanyRaw, EnrichedCompanyData, EnrichResult, BulkEnrichResult, SimilarOrganizationSummary, EmployeeCountRange } from "./types";

// ============================================================================
// Constants
// ============================================================================

const LINKEDIN_COMPANY_ACTOR_ID = "AjfNXEI9qTA2IdaAX";
const MAX_BULK_URLS = 20;
const ACTOR_TIMEOUT_SECS = 120;

// ============================================================================
// Apify Client Initialization
// ============================================================================

if (!APIFY_API_TOKEN) {
  console.warn("--- ⚠️ APIFY_API_TOKEN not set; LinkedIn enrichment will be unavailable ---");
} else {
  console.log("--- ✅ APIFY_API_TOKEN is present ---");
}

const getApifyClient = (): ApifyClient | null => {
  if (!APIFY_API_TOKEN) {
    return null;
  }
  return new ApifyClient({ token: APIFY_API_TOKEN });
};

// ============================================================================
// Data Transformation Helpers
// ============================================================================

/**
 * Format employee count range to readable string
 */
const formatEmployeeRange = (range: EmployeeCountRange | null): string | null => {
  if (!range) return null;
  if (range.end === null) {
    return `${range.start}+`;
  }
  return `${range.start}-${range.end}`;
};

/**
 * Validate and normalize LinkedIn company URL
 */
const normalizeLinkedInUrl = (url: string): string | null => {
  const trimmed = url.trim();

  // Check if it's a valid LinkedIn company URL
  const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/company\/[\w-]+\/?$/i;
  if (!linkedinPattern.test(trimmed)) {
    return null;
  }

  // Ensure consistent format
  let normalized = trimmed.toLowerCase();
  if (!normalized.endsWith("/")) {
    normalized += "/";
  }
  if (!normalized.startsWith("https://")) {
    normalized = normalized.replace(/^http:\/\//, "https://");
  }
  if (!normalized.includes("www.")) {
    normalized = normalized.replace("https://linkedin", "https://www.linkedin");
  }

  return normalized;
};

/**
 * Transform raw Apify data to normalized EnrichedCompanyData
 */
const transformCompanyData = (raw: LinkedInCompanyRaw): EnrichedCompanyData => {
  // Transform similar organizations to condensed format
  const similarOrgs: SimilarOrganizationSummary[] | null =
    raw.similarOrganizations?.map((org) => ({
      name: org.name,
      linkedinUrl: org.url,
      logoUrl: org.logoResolutionResult,
      industry: org.industry ?? org.industryV2Taxonomy,
      employeeRange: formatEmployeeRange(org.employeeCountRange),
    })) ?? null;

  return {
    // Core identifiers
    linkedinUrl: raw.url,
    companyId: raw.companyId,
    universalName: raw.universalName,

    // Basic info
    companyName: raw.companyName,
    tagline: raw.tagline,
    description: raw.description,
    websiteUrl: raw.websiteUrl,

    // Industry
    industry: raw.industry,
    industryV2Taxonomy: raw.industryV2Taxonomy,

    // Size metrics
    employeeCount: raw.employeeCount,
    employeeCountRange: raw.employeeCountRange,
    followerCount: raw.followerCount,

    // Branding
    logoUrl: raw.logoResolutionResult,
    coverImageUrl: raw.croppedCoverImage ?? raw.originalCoverImage,

    // Location
    headquarter: raw.headquarter,

    // Additional info
    foundedYear: raw.foundedOn?.year ?? null,
    specialities: raw.specialities,
    callToAction: raw.callToAction,

    // Related companies
    similarOrganizations: similarOrgs,
  };
};

// ============================================================================
// Enrichment Functions
// ============================================================================

/**
 * Enrich a single LinkedIn company URL
 */
export async function enrichLinkedInCompany(linkedinUrl: string): Promise<EnrichResult> {
  const normalizedUrl = normalizeLinkedInUrl(linkedinUrl);

  if (!normalizedUrl) {
    return {
      success: false,
      data: null,
      error: "Invalid LinkedIn company URL format",
      linkedinUrl,
    };
  }

  const client = getApifyClient();
  if (!client) {
    return {
      success: false,
      data: null,
      error: "APIFY_API_TOKEN not configured",
      linkedinUrl: normalizedUrl,
    };
  }

  try {
    console.log(`--- 🔍 Enriching LinkedIn company: ${normalizedUrl} ---`);

    const run = await client.actor(LINKEDIN_COMPANY_ACTOR_ID).call({ profileUrls: [normalizedUrl] }, { timeout: ACTOR_TIMEOUT_SECS });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      return {
        success: false,
        data: null,
        error: "No data returned from LinkedIn scraper",
        linkedinUrl: normalizedUrl,
      };
    }

    const rawData = items[0] as unknown as LinkedInCompanyRaw;
    const enrichedData = transformCompanyData(rawData);

    console.log(`--- ✅ Successfully enriched: ${enrichedData.companyName} ---`);

    return {
      success: true,
      data: enrichedData,
      error: null,
      linkedinUrl: normalizedUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during enrichment";
    console.error(`--- ❌ Error enriching ${normalizedUrl}:`, message);

    return {
      success: false,
      data: null,
      error: message,
      linkedinUrl: normalizedUrl,
    };
  }
}

/**
 * Enrich multiple LinkedIn company URLs in a single actor run
 */
export async function enrichLinkedInCompanyBulk(linkedinUrls: string[]): Promise<BulkEnrichResult> {
  // Validate and normalize URLs
  const urlMap = new Map<string, string>(); // normalized -> original
  const invalidUrls: string[] = [];

  for (const url of linkedinUrls) {
    const normalized = normalizeLinkedInUrl(url);
    if (normalized) {
      urlMap.set(normalized, url);
    } else {
      invalidUrls.push(url);
    }
  }

  const validUrls = [...urlMap.keys()].slice(0, MAX_BULK_URLS);
  const results: EnrichResult[] = [];

  // Add results for invalid URLs
  for (const url of invalidUrls) {
    results.push({
      success: false,
      data: null,
      error: "Invalid LinkedIn company URL format",
      linkedinUrl: url,
    });
  }

  // Check if we have any valid URLs to process
  if (validUrls.length === 0) {
    return {
      results,
      count: results.length,
      successful: 0,
      failed: results.length,
    };
  }

  const client = getApifyClient();
  if (!client) {
    for (const url of validUrls) {
      results.push({
        success: false,
        data: null,
        error: "APIFY_API_TOKEN not configured",
        linkedinUrl: url,
      });
    }
    return {
      results,
      count: results.length,
      successful: 0,
      failed: results.length,
    };
  }

  try {
    console.log(`--- 🔍 Bulk enriching ${validUrls.length} LinkedIn companies ---`);

    const run = await client.actor(LINKEDIN_COMPANY_ACTOR_ID).call(
      { profileUrls: validUrls },
      { timeout: ACTOR_TIMEOUT_SECS * 2 } // Double timeout for bulk
    );

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Create a map of URL -> raw data for matching
    const dataMap = new Map<string, LinkedInCompanyRaw>();
    for (const item of items) {
      const rawData = item as unknown as LinkedInCompanyRaw;
      if (rawData.url) {
        dataMap.set(rawData.url.toLowerCase(), rawData);
      }
    }

    // Process each valid URL
    for (const url of validUrls) {
      const rawData = dataMap.get(url.toLowerCase());

      if (rawData) {
        const enrichedData = transformCompanyData(rawData);
        results.push({
          success: true,
          data: enrichedData,
          error: null,
          linkedinUrl: url,
        });
        console.log(`--- ✅ Enriched: ${enrichedData.companyName} ---`);
      } else {
        results.push({
          success: false,
          data: null,
          error: "No data returned for this URL",
          linkedinUrl: url,
        });
      }
    }

    const successful = results.filter((r) => r.success).length;
    console.log(`--- 📊 Bulk enrichment complete: ${successful}/${results.length} successful ---`);

    return {
      results,
      count: results.length,
      successful,
      failed: results.length - successful,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during bulk enrichment";
    console.error(`--- ❌ Bulk enrichment error:`, message);

    // Mark all remaining URLs as failed
    for (const url of validUrls) {
      if (!results.some((r) => r.linkedinUrl === url)) {
        results.push({
          success: false,
          data: null,
          error: message,
          linkedinUrl: url,
        });
      }
    }

    return {
      results,
      count: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }
}
