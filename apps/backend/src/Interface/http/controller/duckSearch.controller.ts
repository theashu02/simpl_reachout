import { SearchService } from "../../../config/duckSearchService";

type SearchContext = {
  body?: { q?: string; message?: string };
  query: Record<string, string | undefined>;
  set: {
    status?: number | string;
  };
};

export const SearchController = {
  searchWeb: async ({ body, query, set }: SearchContext) => {
    const q = body?.q || body?.message || query.q;

    if (!q) {
      set.status = 400;
      return {
        success: false,
        error: "Missing search term. Provide 'q' in the JSON body.",
      };
    }

    try {
      const results = await SearchService.performSearch(q);

      return {
        success: true,
        count: results.length,
        data: results,
      };
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: "Internal Server Error during search",
      };
    }
  },
};