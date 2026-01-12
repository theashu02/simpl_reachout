import { SERPER_API_KEY } from "../../utils/config";
import { DomainResult, DomainSource, SerperResponse, SKIP_DOMAINS } from "./types";

const SERPER_SEARCH_URL = "https://google.serper.dev/search";
const SEARCH_RESULT_LIMIT = 5;
const REQUEST_TIMEOUT_MS = 10_000;

if(!SERPER_API_KEY){
  throw new Error("--- SERPER_API_KEY not set ---");
} else {
  console.log("--- SERPER_API_KEY is present ---");
}

const buildEmptyResult = (companyName: string, description = "", source: DomainSource = "none"): DomainResult => ({
  company_name: companyName,
  exists: false,
  domain: null,
  confidence: 0,
  title: "",
  description,
  verified: false,
  source,
});

const normalizeCompanyName = (name: string): string => name.trim();

const extractDomain = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const isDomainSkipped = (domain: string): boolean => {
  const lower = domain.toLowerCase();
  return SKIP_DOMAINS.some((skip) => lower.includes(skip));
};

const calculateConfidence = (companyName: string, domain: string | null, title: string, source: DomainSource): number => {
  if (source === "knowledge_graph") {
    return 95;
  }

  const companyLower = companyName.toLowerCase();
  const titleLower = title.toLowerCase();
  const domainLower = domain?.toLowerCase() || "";
  let score = 60;

  if (titleLower.includes(companyLower)) {
    score += 20;
  }

  const firstWord = companyLower.split(/\s+/)[0];
  if (firstWord && domainLower.includes(firstWord)) {
    score += 10;
  }

  const condensedCompany = companyLower.replace(/\s+/g, "");
  if (condensedCompany && domainLower.includes(condensedCompany)) {
    score += 5;
  }

  return Math.min(score, 95);
};

const fetchSerperResults = async (query: string): Promise<SerperResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(SERPER_SEARCH_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: SEARCH_RESULT_LIMIT }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Serper API error: ${response.status}${errorText ? ` - ${errorText}` : ""}`);
    }

    return (await response.json()) as SerperResponse;
  } finally {
    clearTimeout(timeout);
  }
};

export async function verifyCompanyDomain(companyName: string): Promise<DomainResult> {
  const normalizedCompany = normalizeCompanyName(companyName);

  if (!SERPER_API_KEY) {
    console.warn("SERPER_API_KEY not set; skipping domain verification");
    return buildEmptyResult(normalizedCompany || companyName, "SERPER_API_KEY not configured");
  }

  if (normalizedCompany.length < 2) {
    return buildEmptyResult(normalizedCompany || companyName, "Company name too short");
  }

  try {
    const query = `"${normalizedCompany}" official website`;
    const data = await fetchSerperResults(query);

    // Prefer Knowledge Graph because it is the highest quality signal.
    const kg = data.knowledgeGraph;
    if (kg?.title) {
      const domain = kg.website ? extractDomain(kg.website) : null;

      return {
        company_name: kg.title,
        exists: true,
        domain,
        url: kg.website,
        confidence: 95,
        title: kg.title,
        description: kg.description || "",
        verified: Boolean(domain),
        source: "knowledge_graph",
      };
    }

    const organic = data.organic ?? [];
    const validResults = organic.map((result) => ({ ...result, domain: extractDomain(result.link) })).filter((result) => result.domain && !isDomainSkipped(result.domain));

    if (validResults.length === 0) {
      const first = organic[0];
      return first
        ? {
            company_name: normalizedCompany,
            exists: true,
            domain: null,
            confidence: 40,
            title: first.title,
            description: first.snippet,
            url: first.link,
            verified: false,
            source: "organic",
          }
        : buildEmptyResult(normalizedCompany, "No search results");
    }

    const best = validResults[0];
    const confidence = calculateConfidence(normalizedCompany, best.domain, best.title, "organic");

    return {
      company_name: normalizedCompany,
      exists: true,
      domain: best.domain,
      url: best.link,
      confidence,
      title: best.title,
      description: best.snippet,
      verified: confidence >= 80,
      source: "organic",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error verifying domain for ${normalizedCompany || companyName}:`, message);
    return buildEmptyResult(normalizedCompany || companyName, message);
  }
}
