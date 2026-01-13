import { SERPER_API_KEY } from "../../utils/config";
import { UserCompanyDetails, type ICompanyDetail } from "../../db/models/companyDeatils/userCompanyDetailsModel";
import type { AuthenticatedUser } from "../../middleware/VerifyUser";
import { DomainResult, DomainSource, SerperResponse, SKIP_DOMAINS } from "./types";

const SERPER_SEARCH_URL = "https://google.serper.dev/search";
const SERPER_IMAGES_URL = "https://google.serper.dev/images";
const SEARCH_RESULT_LIMIT = 5;
const REQUEST_TIMEOUT_MS = 10_000;

type PersistContext = { userId?: string; user?: AuthenticatedUser };

if (!SERPER_API_KEY) {
  throw new Error("--- ❌ SERPER_API_KEY not set ---");
} else {
  console.log("--- ✅ SERPER_API_KEY is present ---");
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
  linkedin_url: null,
  logo_url: null,
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

const maybePersistCompanyDetail = async (result: DomainResult, ctx?: PersistContext) => {
  const userId = ctx?.user?.id;
  const email = ctx?.user?.email;

  if (!userId || !email || !result.domain) {
    return;
  }

  const companyPayload: ICompanyDetail = {
    company_name: result.company_name,
    exists: result.exists,
    domain: result.domain.toLowerCase(),
    url: result.url,
    confidence: result.confidence,
    title: result.title,
    description: result.description,
    verified: result.verified,
    source: result.source,
    linkedin_url: result.linkedin_url ?? undefined,
    logo_url: result.logo_url ?? undefined,
  };

  try {
    const updated = await UserCompanyDetails.findOneAndUpdate(
      { userId, "companies.domain": companyPayload.domain },
      {
        $set: {
          email,
          "companies.$.company_name": companyPayload.company_name,
          "companies.$.exists": companyPayload.exists,
          "companies.$.domain": companyPayload.domain,
          "companies.$.url": companyPayload.url,
          "companies.$.confidence": companyPayload.confidence,
          "companies.$.title": companyPayload.title,
          "companies.$.description": companyPayload.description,
          "companies.$.verified": companyPayload.verified,
          "companies.$.source": companyPayload.source,
          "companies.$.linkedin_url": companyPayload.linkedin_url,
          "companies.$.logo_url": companyPayload.logo_url,
        },
      },
      { new: true }
    );

    // If no existing company was updated, add it to the array (or create new user doc)
    if (!updated) {
      await UserCompanyDetails.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: { userId },
          $set: { email },
          $push: { companies: companyPayload },
        },
        { upsert: true, new: true }
      );
    }

    console.log(`--- ✅ Company saved for user ${userId}: ${companyPayload.domain} ---`);
  } catch (error) {
    console.error(`[DomainScraper] Failed to persist company detail for domain ${companyPayload.domain}:`, error);
  }
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

const fetchLinkedInUrl = async (companyName: string): Promise<string | null> => {
  try {
    const query = `${companyName} site:linkedin.com/company`;
    const data = await fetchSerperResults(query);

    const linkedinResult = data.organic?.find((result) => result.link.includes("linkedin.com/company/"));

    return linkedinResult?.link || null;
  } catch (error) {
    console.error(`Error fetching LinkedIn URL for ${companyName}:`, error);
    return null;
  }
};

const fetchLogoUrl = async (companyName: string): Promise<string | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(SERPER_IMAGES_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: `${companyName} company logo URL`, num: 3 }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.images && data.images.length > 0) {
      return data.images[0].imageUrl || null;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching logo for ${companyName}:`, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export async function verifyCompanyDomain(companyName: string, ctx?: PersistContext): Promise<DomainResult> {
  const normalizedCompany = normalizeCompanyName(companyName);

  if (!SERPER_API_KEY) {
    console.warn("SERPER_API_KEY not set; skipping domain verification");
    return buildEmptyResult(normalizedCompany || companyName, "SERPER_API_KEY not configured");
  }

  if (normalizedCompany.length < 2) {
    return buildEmptyResult(normalizedCompany || companyName, "Company name too short");
  }

  try {
    const [data, linkedin_url, logo_url] = await Promise.all([fetchSerperResults(`"${normalizedCompany}" official website`), fetchLinkedInUrl(normalizedCompany), fetchLogoUrl(normalizedCompany)]);

    const kg = data.knowledgeGraph;
    if (kg?.title) {
      const domain = kg.website ? extractDomain(kg.website) : null;
      const finalLogoUrl = kg.imageUrl || logo_url;

      const result: DomainResult = {
        company_name: kg.title,
        exists: true,
        domain,
        url: kg.website,
        confidence: 95,
        title: kg.title,
        description: kg.description || "",
        verified: Boolean(domain),
        source: "knowledge_graph",
        linkedin_url,
        logo_url: finalLogoUrl,
      };

      await maybePersistCompanyDetail(result, ctx);
      return result;
    }

    const organic = data.organic ?? [];
    const validResults = organic.map((result) => ({ ...result, domain: extractDomain(result.link) })).filter((result) => result.domain && !isDomainSkipped(result.domain));

    if (validResults.length === 0) {
      const first = organic[0];
      return first
        ? {
            company_name: first.title,
            exists: true,
            domain: null,
            confidence: 40,
            title: first.title,
            description: first.snippet,
            url: first.link,
            verified: false,
            source: "organic",
            linkedin_url,
            logo_url,
          }
        : buildEmptyResult(normalizedCompany, "No search results");
    }

    const best = validResults[0];
    const confidence = calculateConfidence(normalizedCompany, best.domain, best.title, "organic");

    const result: DomainResult = {
      company_name: best.title,
      exists: true,
      domain: best.domain,
      url: best.link,
      confidence,
      title: best.title,
      description: best.snippet,
      verified: confidence >= 80,
      source: "organic",
      linkedin_url,
      logo_url,
    };

    await maybePersistCompanyDetail(result, ctx);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error verifying domain for ${normalizedCompany || companyName}:`, message);
    return buildEmptyResult(normalizedCompany || companyName, message);
  }
}
