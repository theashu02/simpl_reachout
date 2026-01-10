// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Bot, Globe2, Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { ChatMessage } from "../components/ChatMessage";
// import { LLMInput } from "../components/LLMInput";

// type Message = {
//   id: string;
//   role: "assistant" | "user";
//   content: string;
//   timestamp: number;
// };

// type StatusEvent = {
//   id: string;
//   message: string;
//   detail?: string;
// };

// type SourceLink = {
//   title?: string;
//   link?: string;
//   url?: string;
//   snippet?: string;
// };

// const createId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

// const INITIAL_MESSAGE: Message = {
//   id: "welcome",
//   role: "assistant",
//   content: "Hi! I'm your Hyper Mail copilot. Ask me to summarize threads, draft responses, or search across your inbox.",
//   timestamp: 0,
// };

// const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000").replace(/\/$/, "");

// export default function Index() {
//   const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([]);
//   const [sources, setSources] = useState<SourceLink[]>([]);
//   const streamRef = useRef<EventSource | null>(null);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   // Check if chat has started (user has sent a message)
//   const isChatStarted = messages.length > 1;

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const closeStream = () => {
//     if (streamRef.current) {
//       streamRef.current.close();
//       streamRef.current = null;
//     }
//   };

//   useEffect(() => () => closeStream(), []);

//   const appendStatus = (message: string, detail?: string) => {
//     setStatusEvents((prev) => [...prev, { id: createId(), message, detail }]);
//   };

//   const appendToAssistant = (assistantId: string, chunk: string) => {
//     if (!chunk) return;
//     setMessages((prev) =>
//       prev.map((m) => (m.id === assistantId ? { ...m, content: `${m.content}${chunk}` } : m))
//     );
//   };

//   const startStream = (query: string, assistantId: string) => {
//     const url = new URL("/search/stream", backendUrl);
//     url.searchParams.set("q", query);

//     appendStatus("Searching the web...");

//     const es = new EventSource(url.toString(), { withCredentials: true });
//     streamRef.current = es;

//     es.onmessage = (event) => {
//       if (!event.data) return;
//       try {
//         const data = JSON.parse(event.data);
//         switch (data.type) {
//           case "status":
//             appendStatus(data.message);
//             break;
//           case "sources":
//             setSources(data.data || []);
//             appendStatus(`Found ${data.data?.length ?? 0} sources`);
//             break;
//           case "scrape":
//             appendStatus(
//               data.status === "done" ? `Scraped: ${data.title || data.url}` : `Failed: ${data.title || data.url}`,
//               data.status
//             );
//             break;
//           case "token":
//             appendToAssistant(assistantId, data.message || "");
//             break;
//           case "error":
//             appendStatus(data.message || "Search failed");
//             toast.error(data.message || "Search failed");
//             setIsLoading(false);
//             closeStream();
//             break;
//           case "done":
//             appendStatus("Completed");
//             setIsLoading(false);
//             closeStream();
//             break;
//           default:
//             break;
//         }
//       } catch (err) {
//         console.warn("Failed to parse SSE message", err);
//       }
//     };

//     es.onerror = () => {
//       appendStatus("Connection lost");
//       toast.error("Connection lost while streaming.");
//       setIsLoading(false);
//       closeStream();
//     };
//   };

//   const sendMessage = async () => {
//     const trimmed = input.trim();
//     if (!trimmed || isLoading) return;

//     closeStream();
//     const userMessage: Message = {
//       id: createId(),
//       role: "user",
//       content: trimmed,
//       timestamp: Date.now(),
//     };

//     const assistantId = createId();

//     setMessages((prev) => [
//       ...prev,
//       userMessage,
//       {
//         id: assistantId,
//         role: "assistant",
//         content: "",
//         timestamp: Date.now(),
//       },
//     ]);
//     setInput("");
//     setIsLoading(true);
//     setStatusEvents([]);
//     setSources([]);

//     try {
//       startStream(trimmed, assistantId);
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Failed to send message. Please try again.";
//       toast.error(message);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: createId(),
//           role: "assistant",
//           content: "I couldn't connect to the assistant right now. Please try again in a few seconds.",
//           timestamp: Date.now(),
//         },
//       ]);
//       setIsLoading(false);
//       closeStream();
//     } finally {
//       // loading state cleared by stream completion/error
//     }
//   };

//   return (
//     <div className="relative flex h-screen flex-col overflow-hidden bg-background">
//       <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
//         <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6">
//           <div className="mx-auto w-full max-w-3xl space-y-4">
//             <div className={`flex flex-col items-center justify-center text-center transition-all duration-700 ease-in-out ${isChatStarted ? "max-h-0 opacity-0 overflow-hidden mb-0" : "max-h-[500px] opacity-100 mb-12 mt-10"}`}>
//               <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-primary/10 shadow-lg ring-1 ring-primary/20">
//                 <Bot className="size-10 text-primary" />
//               </div>
//               <h1 className="bg-linear-to-br from-foreground to-muted-foreground bg-clip-text pb-1 text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl">AI Copilot for automating hyper-personalized messaging</h1>
//               <p className="mt-4 max-w-lg text-base text-muted-foreground">Enhance your workflow. Ask me to draft replies, summarize lengthy threads, or manage your inbox efficiently.</p>
//             </div>

//             {/* STATUS FEED */}
//             {statusEvents.length > 0 && (
//               <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm">
//                 <div className="flex items-center justify-between gap-2">
//                   <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
//                     <Globe2 className="size-4" />
//                     Live status
//                   </div>
//                   {isLoading && (
//                     <span className="inline-flex items-center gap-1 text-xs text-primary">
//                       <Loader2 className="size-3 animate-spin" />
//                       Streaming
//                     </span>
//                   )}
//                 </div>
//                 <div className="mt-3 space-y-2 text-sm text-muted-foreground">
//                   {statusEvents.map((status) => (
//                     <div key={status.id} className="flex items-start gap-2">
//                       <span className="mt-1 size-2 rounded-full bg-primary" />
//                       <div>
//                         <p className="text-foreground">{status.message}</p>
//                         {status.detail && <p className="text-xs text-muted-foreground">{status.detail}</p>}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {sources.length > 0 && (
//                   <div className="mt-4 space-y-2">
//                     <p className="text-xs font-semibold uppercase text-muted-foreground">Sources</p>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                       {sources.map((source, idx) => (
//                         <a
//                           key={`${source.link || source.url || idx}`}
//                           href={source.link || source.url || "#"}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="rounded-lg border border-border bg-background px-3 py-2 hover:border-primary transition-colors"
//                         >
//                           <p className="text-sm font-medium text-foreground">
//                             Source {idx + 1}: {source.title || "Untitled"}
//                           </p>
//                           {(source.link || source.url) && <p className="text-xs text-muted-foreground truncate">{source.link || source.url}</p>}
//                           {source.snippet && <p className="text-xs text-muted-foreground line-clamp-2">{source.snippet}</p>}
//                         </a>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* MESSAGE LIST */}
//             {messages.map((message) => (
//               <ChatMessage key={message.id} role={message.role} content={message.content} timestamp={message.timestamp} />
//             ))}

//             {/* LOADING STATE */}
//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-sm">
//                   <div className="flex gap-1">
//                     <span className="size-2 animate-pulse-soft rounded-full bg-primary" />
//                     <span className="size-2 animate-pulse-soft rounded-full bg-primary [animation-delay:150ms]" />
//                     <span className="size-2 animate-pulse-soft rounded-full bg-primary [animation-delay:300ms]" />
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* INPUT AREA */}
//         <div className="relative z-10 border-t border-border bg-background/80 backdrop-blur-sm">
//           <div className="mx-auto w-full max-w-3xl py-4 px-4">
//             <LLMInput value={input} onChange={setInput} onSubmit={sendMessage} isLoading={isLoading} placeholder="Search the web or ask Hyper Mail to draft/summarize..." />
//             <p className="mt-2 text-center text-xs text-muted-foreground">Press Enter to send - Shift + Enter for new line</p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";

import React, { useEffect, useState, useCallback } from "react";

// Declare the global window type for TypeScript
declare global {
  interface Window {
    linkedinBridge?: {
      ready: boolean;
      searchResults: any[];
      onData: ((data: any) => void) | null;
      sendSearch: (query: string) => void;
    };
  }
}

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState("🔄 Checking for extension...");
  const [isExtensionReady, setIsExtensionReady] = useState(false);

  // Check if extension is loaded
  useEffect(() => {
    console.log("🔍 Checking for LinkedIn Bridge extension...");

    const checkExtension = () => {
      console.log("Bridge check:", {
        exists: !!window.linkedinBridge,
        ready: window.linkedinBridge?.ready,
      });

      if (window.linkedinBridge?.ready) {
        console.log("✅ Extension detected and ready!");
        setIsExtensionReady(true);
        setStatus("✅ Connected! Open LinkedIn and search or use the form below.");
      } else if (window.linkedinBridge) {
        console.log("⏳ Bridge exists but not ready yet...");
        setStatus("⏳ Extension loading...");
      } else {
        console.log("❌ Bridge not found on window");
        setStatus("⚠️ Extension not detected. Please install the Chrome extension and refresh.");
      }
    };

    // Check immediately
    checkExtension();

    // Keep checking periodically
    const interval = setInterval(checkExtension, 1000);

    // Also listen for ready event
    const handleReady = () => {
      console.log("📢 Received linkedin-bridge-ready event");
      checkExtension();
    };
    window.addEventListener("linkedin-bridge-ready", handleReady);

    return () => {
      clearInterval(interval);
      window.removeEventListener("linkedin-bridge-ready", handleReady);
    };
  }, []);

  // Listen for LinkedIn data
  useEffect(() => {
    console.log("📡 Setting up data listeners...");

    // Set callback on bridge
    const setupBridgeCallback = () => {
      if (window.linkedinBridge) {
        console.log("🔗 Attaching onData callback to bridge");
        window.linkedinBridge.onData = (data) => {
          console.log("📥 Received data via callback:", data);
          if (data.type === "search_results") {
            setResults(data.results);
            setStatus(`✅ Found ${data.results.length} companies for "${data.query}"`);
          }
        };
      }
    };

    setupBridgeCallback();

    // Re-setup if bridge becomes available
    const checkInterval = setInterval(setupBridgeCallback, 1000);

    // Also listen to custom events
    const handleLinkedInData = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("📥 Received data via custom event:", customEvent.detail);
      if (customEvent.detail?.type === "search_results") {
        setResults(customEvent.detail.data);
        setStatus(`✅ Found ${customEvent.detail.data?.length || 0} companies`);
      }
    };

    window.addEventListener("linkedin-data", handleLinkedInData);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener("linkedin-data", handleLinkedInData);
    };
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!query.trim()) {
        setStatus("⚠️ Please enter a search query");
        return;
      }

      console.log("🔍 Attempting to search for:", query);

      if (window.linkedinBridge?.sendSearch) {
        console.log("📤 Sending search via bridge...");
        window.linkedinBridge.sendSearch(query);
        setStatus(`🔍 Searching LinkedIn for "${query}"... (Make sure LinkedIn is open in another tab)`);
        setResults([]);
      } else {
        console.error("❌ Bridge sendSearch not available");
        setStatus("❌ Extension not loaded. Please install and refresh the page.");
      }
    },
    [query]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="text-4xl">🔗</span>
          </div>
          <h1 className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">LinkedIn Search Bridge</h1>
          <p className="mt-2 text-slate-400">Real-time data from your LinkedIn tab</p>
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-300 ${isExtensionReady ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30" : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"}`}>
            <span className={`h-2 w-2 rounded-full ${isExtensionReady ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            {status}
          </div>
        </header>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies (e.g., Microsoft, Google, Apple)..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-300 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={!isExtensionReady}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">🔍 Search LinkedIn</span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          </div>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Search Results <span className="text-slate-400">({results.length})</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((company: any, i: number) => (
                <div key={company.id || i} className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-start gap-4">
                    {company.logo && <img src={company.logo} alt={company.name} className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{company.name}</h3>
                      {company.subtitle && <p className="mt-1 text-sm text-slate-400 line-clamp-2">{company.subtitle}</p>}
                      {company.url && (
                        <a href={company.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-400 transition-colors duration-200 hover:text-blue-300">
                          View on LinkedIn
                          <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && isExtensionReady && (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center backdrop-blur-sm">
            <div className="mb-4 text-4xl">👆</div>
            <p className="text-lg font-medium text-white">Enter a company name above or search on LinkedIn directly</p>
            <p className="mt-2 text-slate-400">Results will appear here in real-time!</p>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-10 rounded-xl border border-white/5 bg-white/5 p-4 text-xs text-slate-500">
          <p>
            Debug: Extension ready = {String(isExtensionReady)} | Results = {results.length}
          </p>
          <p>Open the browser console (F12) to see connection logs</p>
        </div>
      </div>
    </div>
  );
}

export default App;
