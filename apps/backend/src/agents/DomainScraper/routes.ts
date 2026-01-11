import { Elysia, t } from "elysia";
import { verifyCompanyDomain, DomainResult } from "./verifier";

export const domainScraperRoutes = new Elysia({ prefix: "/api/domain" })
  .post(
    "/verify",
    async ({ body }) => {
      const { companyName } = body;

      if (!companyName || companyName.length < 2) {
        return {
          error: "Company name too short",
          company_name: companyName,
          exists: false,
          domain: null,
          confidence: 0,
        };
      }

      const result = await verifyCompanyDomain(companyName);
      return result;
    },
    {
      body: t.Object({
        companyName: t.String({ minLength: 2 }),
      }),
    }
  )

  // Bulk verify multiple companies
  .post(
    "/verify-bulk",
    async ({ body }) => {
      const { companies } = body;
      const results: DomainResult[] = [];

      // Process up to 10 companies
      for (const company of companies.slice(0, 10)) {
        const result = await verifyCompanyDomain(company);
        results.push(result);
        
        // Small delay between requests
        await new Promise((r) => setTimeout(r, 100));
      }

      return {
        results,
        count: results.length,
        verified: results.filter((r) => r.verified).length,
      };
    },
    {
      body: t.Object({
        companies: t.Array(t.String()),
      }),
    }
  )

  // Health check
  .get("/health", () => ({
    status: "ok",
    service: "domain-scraper",
  }));
