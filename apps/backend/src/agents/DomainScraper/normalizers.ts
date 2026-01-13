import { DomainResult, DomainSource, SKIP_DOMAINS } from "./types";

export const buildEmptyResult = (companyName: string, description = "", source: DomainSource = "none"): DomainResult => ({
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

export const normalizeCompanyName = (name: string): string => name.trim();

export const extractDomain = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

export const isDomainSkipped = (domain: string): boolean => {
  const lower = domain.toLowerCase();
  return SKIP_DOMAINS.some((skip) => lower.includes(skip));
};

export const calculateConfidence = (companyName: string, domain: string | null, title: string, source: DomainSource): number => {
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
