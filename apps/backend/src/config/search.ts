import { SERPER_API_KEY } from "../utils/config";

export const performSearch = async (query: string, num = 4) => {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": SERPER_API_KEY || "",
    },
    body: JSON.stringify({ q: query, num }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  // Return organic results strictly
  return (data.organic || []).map((r: any) => ({
    title: r.title,
    link: r.link,
    snippet: r.snippet,
  }));
};
