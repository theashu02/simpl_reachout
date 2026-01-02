// import { search, SafeSearchType } from "duck-duck-scrape";

// export const SearchService = {
  
// async performSearch(query: string) {
//     try {
//       const response = await search(query, { safeSearch: SafeSearchType.MODERATE });
//       if (!response.results?.length) return [];
//       return response.results.slice(0, 5).map((result) => ({
//         title: result.title,
//         url: result.url,
//         snippet: result.description.replace(/<[^>]*>?/gm, ""),
//       }));
//     } catch (err: any) {
//       const msg = String(err?.message || err);
//       const blocked = msg.includes("anomaly") || msg.includes("too quickly");
//       if (blocked) {
//         throw new Error("DuckDuckGo temporarily blocked the request; please retry later.");
//       }
//       throw err;
//     }
//   }
// };
// apps/backend/src/config/duckSearchService.ts
export class SearchService {
  static async performSearch(query: string) {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const results = data.RelatedTopics || [];
      
      return results.slice(0, 5).map((item: any) => ({
        title: item.Text || item.FirstURL,
        url: item.FirstURL,
        snippet: item.Text
      }));
    } catch (error) {
      console.error("Search failed:", error);
      throw error;
    }
  }
}