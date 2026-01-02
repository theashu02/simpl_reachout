'use client'

import { FormEvent, KeyboardEvent, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
};

export function LLMInput({ value, onChange, onSubmit, isLoading, placeholder = "Type your message..." }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          style={{ minHeight: "48px", maxHeight: "120px" }}
        />
      </div>
      <Button type="submit" size="icon" disabled={isLoading || !value.trim()} className="size-12 shrink-0 rounded-full transition-transform hover:scale-105 active:scale-95">
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
