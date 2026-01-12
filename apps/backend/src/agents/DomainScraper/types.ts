export type DomainSource = "knowledge_graph" | "organic" | "none";

export interface DomainResult {
  company_name: string;
  exists: boolean;
  domain: string | null;
  confidence: number;
  title: string;
  description: string;
  url?: string;
  verified: boolean;
  source: DomainSource;
}

export interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerperKnowledgeGraph {
  title?: string;
  type?: string;
  website?: string;
  description?: string;
}

export interface SerperResponse {
  organic?: SerperResult[];
  knowledgeGraph?: SerperKnowledgeGraph;
}

export const SKIP_DOMAINS: readonly string[] = Object.freeze([
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
]);
