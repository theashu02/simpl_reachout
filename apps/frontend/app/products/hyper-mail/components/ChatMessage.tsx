import { Bot, User } from "lucide-react";

type ChatMessageProps = {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
};

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </div>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card text-card-foreground border border-border rounded-bl-md"
          }`}
        >
          <p className="whitespace-pre-wrap">{content}</p>
          <span className={`mt-1.5 block text-[10px] ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
