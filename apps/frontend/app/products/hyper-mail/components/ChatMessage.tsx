import { Bot, User } from "lucide-react";

type ChatMessageProps = {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
};

const formatTime = (timestamp: number) => {
  if (!timestamp) return "Now";
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(timestamp);
};

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex animate-fade-in w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} 
        /* Width Control: 
           - Mobile: 90% width for maximum readability
           - Tablet (sm): 75% 
           - Desktop (md): 60% to prevent super wide lines
        */
        max-w-[90%] sm:max-w-[75%] md:max-w-[60%]`}
      >
        {/* Avatar - shrink-0 prevents it from squishing on small screens */}
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
            isUser ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-transparent"
          }`}
        >
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </div>

        {/* Message Bubble */}
        <div
          className={`relative overflow-hidden rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser ? "rounded-br-none bg-primary text-primary-foreground" : "rounded-bl-none border border-border bg-card text-card-foreground"
          }`}
        >
          {/* break-words is crucial for mobile to handle long URLs/words */}
          <p className="whitespace-pre-wrap wrap-break-word">{content}</p>

          <span className={`mt-1.5 block text-[10px] opacity-80 ${isUser ? "text-primary-foreground" : "text-muted-foreground"}`}>{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
