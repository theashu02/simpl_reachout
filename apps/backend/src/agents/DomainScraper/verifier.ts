import { SERPER_API_KEY } from "../../utils/config";

export interface DomainResult {
  company_name: string;
  exists: boolean;
  domain: string | null;
  confidence: number;
  title: string;
  description: string;
  url?: string;
  verified: boolean;
  source: "knowledge_graph" | "organic" | "none";
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SerperKnowledgeGraph {
  title?: string;
  type?: string;
  website?: string;
  description?: string;
}

interface SerperResponse {
  organic?: SerperResult[];
  knowledgeGraph?: SerperKnowledgeGraph;
}

// Domains to skip (social media, job sites, etc.)
const SKIP_DOMAINS = [
  "linkedin.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "youtube.com",
  "glassdoor.com",
  "indeed.com",
  "wikipedia.org",
  "crunchbase.com",
  "zoominfo.com",
  "bloomberg.com",
];

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  companyName: string,
  domain: string | null,
  title: string,
  source: "knowledge_graph" | "organic"
): number {
  if (source === "knowledge_graph") {
    return 95;
  }

  const companyLower = companyName.toLowerCase();
  const titleLower = title.toLowerCase();
  const domainLower = domain?.toLowerCase() || "";

  // Title contains company name
  if (titleLower.includes(companyLower)) {
    return 85;
  }

  // Domain contains first word of company name
  const firstWord = companyLower.split(" ")[0];
  if (domainLower.includes(firstWord)) {
    return 75;
  }

  return 60;
}

/**
 * Verify company domain using Serper API (Google Search)
 */
export async function verifyCompanyDomain(companyName: string): Promise<DomainResult> {
  if (!SERPER_API_KEY) {
    console.warn("⚠️ SERPER_API_KEY not set");
    return {
      company_name: companyName,
      exists: false,
      domain: null,
      confidence: 0,
      title: "",
      description: "",
      verified: false,
      source: "none",
    };
  }

  try {
    console.log(`🔍 Verifying domain for: ${companyName}`);

    const query = `"${companyName}" official website`;
    
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data: SerperResponse = await response.json();

    // 1. Check Knowledge Graph first (most reliable)
    if (data.knowledgeGraph?.title) {
      const kg = data.knowledgeGraph;
      const domain = kg.website ? extractDomain(kg.website) : null;

      console.log(`✅ Knowledge Graph: ${companyName} → ${domain || "no domain"}`);

      return {
        company_name: kg.title!,
        exists: true,
        domain,
        url: kg.website,
        confidence: 95,
        title: kg.title!,
        description: kg.description || "",
        verified: true,
        source: "knowledge_graph",
      };
    }

    // 2. Use organic results
    if (!data.organic || data.organic.length === 0) {
      return {
        company_name: companyName,
        exists: false,
        domain: null,
        confidence: 0,
        title: "",
        description: "",
        verified: false,
        source: "none",
      };
    }

    // Filter valid results
    const validResults = data.organic.filter((r) => {
      const domain = extractDomain(r.link);
      return domain && !SKIP_DOMAINS.some((skip) => domain.includes(skip));
    });

    if (validResults.length === 0) {
      // Company mentioned but no official site
      const first = data.organic[0];
      return {
        company_name: companyName,
        exists: true,
        domain: null,
        confidence: 40,
        title: first.title,
        description: first.snippet,
        url: first.link,
        verified: false,
        source: "organic",
      };
    }

    const first = validResults[0];
    const domain = extractDomain(first.link);
    const confidence = calculateConfidence(companyName, domain, first.title, "organic");

    console.log(`✅ Organic: ${companyName} → ${domain} (${confidence}%)`);

    return {
      company_name: companyName,
      exists: true,
      domain,
      url: first.link,
      confidence,
      title: first.title,
      description: first.snippet,
      verified: confidence >= 75,
      source: "organic",
    };

  } catch (error: any) {
    console.error(`❌ Error verifying ${companyName}:`, error.message);
    return {
      company_name: companyName,
      exists: false,
      domain: null,
      confidence: 0,
      title: "",
      description: error.message,
      verified: false,
      source: "none",
    };
  }
}
