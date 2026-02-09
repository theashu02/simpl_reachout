import { Elysia, t } from "elysia";
import { enrichLinkedInCompany, enrichLinkedInCompanyBulk } from "./enricher";

const MAX_BULK_URLS = 20;

const linkedInUrlSchema = t.String({
  pattern: "^https?://(www\\.)?linkedin\\.com/company/[\\w-]+/?$",
  error: "Invalid LinkedIn company URL format",
});

const app = new Elysia({ prefix: "/company" });

export const companyEnrichRoutes = app
  .post(
    "/enrich",
    async ({ body, set }) => {
      const result = await enrichLinkedInCompany(body.linkedinUrl);

      if (!result.success) {
        set.status = result.error?.includes("not configured") ? 503 : 400;
      }

      return result;
    },
    {
      body: t.Object({
        linkedinUrl: linkedInUrlSchema,
      }),
      detail: {
        summary: "Enrich single LinkedIn company",
        description: "Fetches detailed company information from a LinkedIn company page URL",
        tags: ["Company Enrichment"],
      },
    }
  )

  .post(
    "/enrich-bulk",
    async ({ body, set }) => {
      const { linkedinUrls } = body;

      if (linkedinUrls.length === 0) {
        set.status = 400;
        return {
          results: [],
          count: 0,
          successful: 0,
          failed: 0,
          error: "No URLs provided",
        };
      }

      if (linkedinUrls.length > MAX_BULK_URLS) {
        set.status = 400;
        return {
          results: [],
          count: 0,
          successful: 0,
          failed: 0,
          error: `Maximum ${MAX_BULK_URLS} URLs allowed per request`,
        };
      }

      const result = await enrichLinkedInCompanyBulk(linkedinUrls);

      if (result.successful === 0 && result.failed > 0) {
        set.status = result.results[0]?.error?.includes("not configured") ? 503 : 400;
      }

      return result;
    },
    {
      body: t.Object({
        linkedinUrls: t.Array(t.String(), { minItems: 1, maxItems: MAX_BULK_URLS }),
      }),
      detail: {
        summary: "Bulk enrich LinkedIn companies",
        description: `Fetches detailed company information for multiple LinkedIn company URLs (max ${MAX_BULK_URLS})`,
        tags: ["Company Enrichment"],
      },
    }
  )

  .get("/health", () => ({
    status: "ok",
    service: "company-enrich",
  }));
