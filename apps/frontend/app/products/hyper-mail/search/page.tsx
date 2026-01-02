"use client";

import { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";
import { toast } from "sonner";
import { getEdenClient } from "@/lib/ApiService/edenClient";
import { ChatMessage } from "../components/ChatMessage";
import { LLMInput } from "../components/LLMInput";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: number;
};

const createId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm your Hyper Mail copilot. Ask me to summarize threads, draft responses, or search across your inbox.",
  timestamp: 0,
};

const hyperMailApi = getEdenClient();

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if chat has started (user has sent a message)
  const isChatStarted = messages.length > 1;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await hyperMailApi.llm.post({ message: trimmed });

      if (error) {
        const message = typeof error.value === "object" && error.value && "message" in error.value ? String((error.value as { message?: string }).message) : "Unable to reach the assistant.";
        throw new Error(message);
      }

      if (!data?.success || !data.reply) {
        throw new Error(data?.error ?? "Assistant did not return a response.");
      }

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: data.reply.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
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
    } finally {
      setIsLoading(false);
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
            <LLMInput value={input} onChange={setInput} onSubmit={sendMessage} isLoading={isLoading} placeholder="Ask Hyper Mail to create, summarize, or reply..." />
            <p className="mt-2 text-center text-xs text-muted-foreground">Press Enter to send • Shift + Enter for new line</p>
          </div>
        </div>
      </main>
    </div>
  );
}
