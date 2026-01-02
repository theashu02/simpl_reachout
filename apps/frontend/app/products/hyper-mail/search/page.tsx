"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Globe2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ChatMessage } from "../components/ChatMessage";
import { LLMInput } from "../components/LLMInput";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: number;
};

type StatusEvent = {
  id: string;
  message: string;
  detail?: string;
};

type SourceLink = {
  title?: string;
  link?: string;
  url?: string;
  snippet?: string;
};

const createId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm your Hyper Mail copilot. Ask me to summarize threads, draft responses, or search across your inbox.",
  timestamp: 0,
};

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000").replace(/\/$/, "");

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([]);
  const [sources, setSources] = useState<SourceLink[]>([]);
  const streamRef = useRef<EventSource | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if chat has started (user has sent a message)
  const isChatStarted = messages.length > 1;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const closeStream = () => {
    if (streamRef.current) {
      streamRef.current.close();
      streamRef.current = null;
    }
  };

  useEffect(() => () => closeStream(), []);

  const appendStatus = (message: string, detail?: string) => {
    setStatusEvents((prev) => [...prev, { id: createId(), message, detail }]);
  };

  const appendToAssistant = (assistantId: string, chunk: string) => {
    if (!chunk) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? { ...m, content: `${m.content}${chunk}` } : m))
    );
  };

  const startStream = (query: string, assistantId: string) => {
    const url = new URL("/search/stream", backendUrl);
    url.searchParams.set("q", query);

    appendStatus("Searching the web...");

    const es = new EventSource(url.toString(), { withCredentials: true });
    streamRef.current = es;

    es.onmessage = (event) => {
      if (!event.data) return;
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "status":
            appendStatus(data.message);
            break;
          case "sources":
            setSources(data.data || []);
            appendStatus(`Found ${data.data?.length ?? 0} sources`);
            break;
          case "scrape":
            appendStatus(
              data.status === "done" ? `Scraped: ${data.title || data.url}` : `Failed: ${data.title || data.url}`,
              data.status
            );
            break;
          case "token":
            appendToAssistant(assistantId, data.message || "");
            break;
          case "error":
            appendStatus(data.message || "Search failed");
            toast.error(data.message || "Search failed");
            setIsLoading(false);
            closeStream();
            break;
          case "done":
            appendStatus("Completed");
            setIsLoading(false);
            closeStream();
            break;
          default:
            break;
        }
      } catch (err) {
        console.warn("Failed to parse SSE message", err);
      }
    };

    es.onerror = () => {
      appendStatus("Connection lost");
      toast.error("Connection lost while streaming.");
      setIsLoading(false);
      closeStream();
    };
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    closeStream();
    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const assistantId = createId();

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      },
    ]);
    setInput("");
    setIsLoading(true);
    setStatusEvents([]);
    setSources([]);

    try {
      startStream(trimmed, assistantId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message. Please try again.";
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: "I couldn't connect to the assistant right now. Please try again in a few seconds.",
          timestamp: Date.now(),
        },
      ]);
      setIsLoading(false);
      closeStream();
    } finally {
      // loading state cleared by stream completion/error
    }
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <div className={`flex flex-col items-center justify-center text-center transition-all duration-700 ease-in-out ${isChatStarted ? "max-h-0 opacity-0 overflow-hidden mb-0" : "max-h-[500px] opacity-100 mb-12 mt-10"}`}>
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-primary/10 shadow-lg ring-1 ring-primary/20">
                <Bot className="size-10 text-primary" />
              </div>
              <h1 className="bg-linear-to-br from-foreground to-muted-foreground bg-clip-text pb-1 text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl">AI Copilot for automating hyper-personalized messaging</h1>
              <p className="mt-4 max-w-lg text-base text-muted-foreground">Enhance your workflow. Ask me to draft replies, summarize lengthy threads, or manage your inbox efficiently.</p>
            </div>

            {/* STATUS FEED */}
            {statusEvents.length > 0 && (
              <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Globe2 className="size-4" />
                    Live status
                  </div>
                  {isLoading && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      <Loader2 className="size-3 animate-spin" />
                      Streaming
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {statusEvents.map((status) => (
                    <div key={status.id} className="flex items-start gap-2">
                      <span className="mt-1 size-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-foreground">{status.message}</p>
                        {status.detail && <p className="text-xs text-muted-foreground">{status.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {sources.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Sources</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sources.map((source, idx) => (
                        <a
                          key={`${source.link || source.url || idx}`}
                          href={source.link || source.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border bg-background px-3 py-2 hover:border-primary transition-colors"
                        >
                          <p className="text-sm font-medium text-foreground">
                            Source {idx + 1}: {source.title || "Untitled"}
                          </p>
                          {(source.link || source.url) && <p className="text-xs text-muted-foreground truncate">{source.link || source.url}</p>}
                          {source.snippet && <p className="text-xs text-muted-foreground line-clamp-2">{source.snippet}</p>}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MESSAGE LIST */}
            {messages.map((message) => (
              <ChatMessage key={message.id} role={message.role} content={message.content} timestamp={message.timestamp} />
            ))}

            {/* LOADING STATE */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="size-2 animate-pulse-soft rounded-full bg-primary" />
                    <span className="size-2 animate-pulse-soft rounded-full bg-primary [animation-delay:150ms]" />
                    <span className="size-2 animate-pulse-soft rounded-full bg-primary [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="relative z-10 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-3xl py-4 px-4">
            <LLMInput value={input} onChange={setInput} onSubmit={sendMessage} isLoading={isLoading} placeholder="Search the web or ask Hyper Mail to draft/summarize..." />
            <p className="mt-2 text-center text-xs text-muted-foreground">Press Enter to send - Shift + Enter for new line</p>
          </div>
        </div>
      </main>
    </div>
  );
}
