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

import React, { useEffect, useState, useCallback, useRef } from "react";

// Declare the global window type for TypeScript
declare global {
  interface Window {
    linkedinBridge?: {
      ready: boolean;
      linkedinConnected: boolean;
      suggestions: any[];
      searchResults: any[];
      companyDetails: any;
      onReady: (() => void) | null;
      onSuggestions: ((data: any) => void) | null;
      onSearchResults: ((data: any) => void) | null;
      onCompanyDetails: ((data: any) => void) | null;
      onError: ((message: string) => void) | null;
      getSuggestions: (query: string) => void;
      searchCompanies: (query: string) => void;
      getCompanyDetails: (companyId: string) => void;
      sendSearch: (query: string) => void;
    };
  }
}

interface Company {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  followers?: string;
  employees?: string;
  employeeRange?: string;
  description?: string;
  tagline?: string;
  website?: string;
  url?: string;
  logo?: string;
  universalName?: string;
  linkedinId?: string;
  founded?: string;
  specialties?: string[];
  phone?: string;
  companyType?: string;
}

interface Suggestion {
  id: string;
  name: string;
  text?: string;
  subtitle?: string;
  type: string;
  logo?: string;
  url?: string;
  universalName?: string;
}

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState("🔄 Checking for extension...");
  const [isExtensionReady, setIsExtensionReady] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Check if extension is loaded
  useEffect(() => {
    const checkExtension = () => {
      if (window.linkedinBridge?.ready) {
        setIsExtensionReady(true);
        if (window.linkedinBridge.linkedinConnected) {
          setIsLinkedInConnected(true);
          setStatus("✅ Connected to LinkedIn! Start typing to search.");
        } else {
          setStatus("✅ Extension ready. Open LinkedIn in another tab to connect.");
        }
      } else if (window.linkedinBridge) {
        setStatus("⏳ Extension loading...");
      } else {
        setStatus("⚠️ Extension not detected. Install the Chrome extension and refresh.");
      }
    };

    checkExtension();
    const interval = setInterval(checkExtension, 1000);

    const handleReady = () => {
      checkExtension();
    };

    const handleLinkedInConnected = () => {
      setIsLinkedInConnected(true);
      setStatus("✅ Connected to LinkedIn! Start typing to search.");
    };

    window.addEventListener("linkedin-bridge-ready", handleReady);
    window.addEventListener("linkedin-connected", handleLinkedInConnected);

    return () => {
      clearInterval(interval);
      window.removeEventListener("linkedin-bridge-ready", handleReady);
      window.removeEventListener("linkedin-connected", handleLinkedInConnected);
    };
  }, []);

  // Listen for LinkedIn data
  useEffect(() => {
    const setupBridgeCallbacks = () => {
      if (window.linkedinBridge) {
        window.linkedinBridge.onSuggestions = (data) => {
          console.log("💡 Received suggestions:", data?.data?.length);
          if (data?.data) {
            setSuggestions(data.data);
            setShowSuggestions(data.data.length > 0);
          }
        };

        window.linkedinBridge.onSearchResults = (data) => {
          console.log("📥 Received results:", data?.data?.length);
          if (data?.data) {
            setResults(data.data);
            setShowSuggestions(false);
            setIsLoading(false);
            setStatus(`✅ Found ${data.data.length} companies`);
          }
        };

        window.linkedinBridge.onError = (message) => {
          console.error("❌ Bridge error:", message);
          setStatus(`❌ ${message}`);
          setIsLoading(false);
        };
      }
    };

    setupBridgeCallbacks();
    const checkInterval = setInterval(setupBridgeCallbacks, 1000);

    // Event listeners
    const handleSuggestions = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.data) {
        setSuggestions(customEvent.detail.data);
        setShowSuggestions(customEvent.detail.data.length > 0);
      }
    };

    const handleSearchResults = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.data) {
        setResults(customEvent.detail.data);
        setShowSuggestions(false);
        setIsLoading(false);
        setStatus(`✅ Found ${customEvent.detail.data.length} companies`);
      }
    };

    const handleLinkedInData = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.type === "search_results") {
        setResults(customEvent.detail.data);
        setShowSuggestions(false);
        setIsLoading(false);
      }
    };

    window.addEventListener("linkedin-suggestions", handleSuggestions);
    window.addEventListener("linkedin-search-results", handleSearchResults);
    window.addEventListener("linkedin-data", handleLinkedInData);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener("linkedin-suggestions", handleSuggestions);
      window.removeEventListener("linkedin-search-results", handleSearchResults);
      window.removeEventListener("linkedin-data", handleLinkedInData);
    };
  }, []);

  // Fetch suggestions as user types (debounced)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce API call
    if (value.length >= 2 && window.linkedinBridge?.getSuggestions) {
      debounceRef.current = setTimeout(() => {
        console.log("🔍 Fetching suggestions for:", value);
        window.linkedinBridge!.getSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!query.trim()) {
        setStatus("⚠️ Please enter a search query");
        return;
      }

      if (window.linkedinBridge?.searchCompanies) {
        setIsLoading(true);
        window.linkedinBridge.searchCompanies(query);
        setStatus(`🔍 Searching LinkedIn for "${query}"...`);
        setResults([]);
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        setStatus("❌ Extension not loaded. Please install and refresh.");
      }
    },
    [query]
  );

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const searchTerm = suggestion.name || suggestion.text || "";
    setQuery(searchTerm);
    setShowSuggestions(false);

    if (window.linkedinBridge?.searchCompanies) {
      setIsLoading(true);
      window.linkedinBridge.searchCompanies(searchTerm);
      setStatus(`🔍 Searching for "${searchTerm}"...`);
      setResults([]);
      setSuggestions([]);
    }
  };

  const extractDomain = (website?: string): string => {
    if (!website) return "";
    try {
      const url = new URL(website.startsWith("http") ? website : `https://${website}`);
      return url.hostname.replace("www.", "");
    } catch {
      return website;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="text-4xl">🔗</span>
          </div>
          <h1 className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">LinkedIn Company Search</h1>
          <p className="mt-2 text-slate-400">Real-time company data via LinkedIn API</p>
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-300 ${
              isLinkedInConnected ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30" : isExtensionReady ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30" : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isLinkedInConnected ? "bg-emerald-400 animate-pulse" : isExtensionReady ? "bg-blue-400" : "bg-amber-400"}`} />
            {status}
          </div>
        </header>

        {/* Search Form */}
        <div className="relative mb-10">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Start typing a company name..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-300 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-slate-800/95 backdrop-blur-md shadow-2xl">
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-medium uppercase text-slate-400">LinkedIn Suggestions</p>
                      {suggestions.map((suggestion) => (
                        <button key={suggestion.id} type="button" onMouseDown={() => handleSuggestionClick(suggestion)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10">
                          {suggestion.logo ? (
                            <img src={suggestion.logo} alt="" className="h-10 w-10 rounded-lg object-cover bg-white/10" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">{(suggestion.name || suggestion.text || "?")[0]}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{suggestion.name || suggestion.text}</p>
                            {suggestion.subtitle && <p className="text-sm text-slate-400 truncate">{suggestion.subtitle}</p>}
                          </div>
                          <span className="text-xs text-slate-500 capitalize bg-slate-700/50 px-2 py-1 rounded">{suggestion.type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!isExtensionReady || isLoading}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">{isLoading ? "⏳ Searching..." : "🔍 Search"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Results <span className="text-slate-400">({results.length})</span>
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {results.map((company, i) => (
                <div key={company.id || i} className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 hover:bg-white/10">
                  <div className="flex items-start gap-4">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="h-16 w-16 rounded-xl object-cover ring-1 ring-white/10 shrink-0" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl font-bold text-blue-400 shrink-0">{company.name?.[0] || "?"}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg">{company.name}</h3>

                      {/* Industry & Location */}
                      <div className="mt-1 flex flex-wrap gap-2 text-sm">
                        {company.industry && <span className="text-slate-400">🏢 {company.industry}</span>}
                        {company.location && <span className="text-slate-400">📍 {company.location}</span>}
                      </div>

                      {/* Website/Domain */}
                      {company.website && (
                        <div className="mt-2">
                          <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300">
                            🌐 {extractDomain(company.website)}
                          </a>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {company.followers && <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{Number(company.followers).toLocaleString()} followers</span>}
                        {company.employees && <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">{Number(company.employees).toLocaleString()} employees</span>}
                        {company.founded && <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">Founded {company.founded}</span>}
                      </div>

                      {/* Description */}
                      {(company.tagline || company.description) && <p className="mt-2 text-sm text-slate-400 line-clamp-2">{company.tagline || company.description}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {company.url && (
                      <a href={company.url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-blue-500/20 py-2 text-center text-sm font-medium text-blue-400 hover:bg-blue-500/30">
                        View on LinkedIn
                      </a>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(company, null, 2));
                        setStatus("📋 Copied to clipboard!");
                      }}
                      className="flex-1 rounded-lg bg-white/5 py-2 text-center text-sm text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      📋 Copy JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && isExtensionReady && !isLoading && (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center backdrop-blur-sm">
            <div className="mb-4 text-4xl">�</div>
            <p className="text-lg font-medium text-white">Start typing to search companies</p>
            <p className="mt-2 text-slate-400">{isLinkedInConnected ? "Suggestions will appear as you type" : "Open linkedin.com in another tab to enable API access"}</p>
          </div>
        )}

        {/* Debug */}
        <div className="mt-10 rounded-xl border border-white/5 bg-white/5 p-4 text-xs text-slate-500">
          Extension: {String(isExtensionReady)} | LinkedIn: {String(isLinkedInConnected)} | Suggestions: {suggestions.length} | Results: {results.length}
        </div>
      </div>
    </div>
  );
}

export default App;
