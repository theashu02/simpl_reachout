import { Elysia, t } from "elysia";
import type { AuthenticatedUser } from "../../middleware/VerifyUser";
import { verifyCompanyDomain } from "./verifier";

const MAX_BULK_COMPANIES = 10;
const sanitizeCompanyName = (value: string) => value.trim();
type AuthContext = { userId?: string; user?: AuthenticatedUser };

const app = new Elysia({ prefix: "/domain" });

export const domainScraperRoutes = app
  .post("/verify",
    async (ctx) => {
      const { body, set } = ctx;
      const { userId, user } = ctx as typeof ctx & AuthContext;

      if (!userId) {
        set.status = 401;
        return { error: "Unauthorized request" };
      }

      const companyName = sanitizeCompanyName(body.companyName);

      if (companyName.length < 2) {
        set.status = 400;
        return {
          error: "Company name too short",
          company_name: companyName,
          exists: false,
          domain: null,
          confidence: 0,
        };
      }

      return verifyCompanyDomain(companyName, { userId, user });
    },
    {
      body: t.Object({
        companyName: t.String({ minLength: 2 }),
      }),
    }
  )

  .post("/verify-bulk",
    async (ctx) => {
      const { body, set } = ctx;
      const { userId, user } = ctx as typeof ctx & AuthContext;

      if (!userId) {
        set.status = 401;
        return {
          error: "Unauthorized request",
          results: [],
          count: 0,
          verified: 0,
          skipped: 0,
        };
      }

      const uniqueCompanies = [...new Set(body.companies.map(sanitizeCompanyName).filter(Boolean))];

      if (uniqueCompanies.length === 0) {
        set.status = 400;
        return {
          error: "No companies provided",
          results: [],
          count: 0,
          verified: 0,
          skipped: 0,
        };
      }

      const companiesToProcess = uniqueCompanies.slice(0, MAX_BULK_COMPANIES);
      const results = await Promise.all(companiesToProcess.map((company) => verifyCompanyDomain(company, { userId, user })));

      return {
        results,
        count: results.length,
        verified: results.filter((r) => r.verified).length,
        skipped: Math.max(uniqueCompanies.length - companiesToProcess.length, 0),
      };
    },
    {
      body: t.Object({
        companies: t.Array(t.String({ minLength: 2 })),
      }),
    }
  )

  .get("/health", () => ({
    status: "ok",
    service: "domain-scraper",
  }));
