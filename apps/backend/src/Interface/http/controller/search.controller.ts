import { streamLLMResponse } from "../../../config/llm";
import { scrapeUrl } from "../../../config/scraper";
import { performSearch } from "../../../config/search";

export const handleSearchStream = (query: string) => {
  return new Response(
    new ReadableStream({
      async start(controller) {
        // Helper to send SSE events
        const encoder = new TextEncoder();
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // 1. Notify: Searching
          sendEvent({ type: "status", message: "Searching the web..." });
          const links = await performSearch(query);

          if (links.length === 0) {
            sendEvent({ type: "error", message: "No results found." });
            controller.close();
            return;
          }

          sendEvent({ type: "sources", data: links });

          // 2. Notify: Reading
          sendEvent({ type: "status", message: `Reading ${links.length} pages...` });

          // Scrape sequentially to avoid hammering sites and reduce timeouts
          const results: any[] = [];
          for (let index = 0; index < links.length; index++) {
            const link = links[index];
            sendEvent({ type: "scrape", status: "started", index, url: link.link, title: link.title });
            const result = await scrapeUrl(link.link);
            sendEvent({ type: "scrape", status: result ? "done" : "failed", index, url: link.link, title: link.title });
            results.push(result);
          }
          const validContent = results.filter((r) => r !== null);

          // 3. Build Context
          let context = validContent.map((doc, i) => `[Source ${i + 1}]: ${doc.title}\n${doc.content}`).join("\n\n");

          if (!context) {
            sendEvent({ type: "error", message: "Unable to read any sources." });
            controller.close();
            return;
          }

          const prompt = `
            User Query: ${query}
            
            Based strictly on the following context, answer the user's question. 
            Cite sources using [Source X].
            
            Context:
            ${context}
          `;

          // 4. Stream LLM
          sendEvent({ type: "status", message: "Thinking..." });

          await streamLLMResponse(prompt, (chunk) => {
            sendEvent({ type: "token", message: chunk });
          });

          sendEvent({ type: "done" });
          controller.close();
        } catch (error) {
          sendEvent({ type: "error", message: "Internal Server Error" });
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
};
