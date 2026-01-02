"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
};

export function LLMInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Type your message...",
}: ChatInputProps) {
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

  // Auto-resize the textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to calculate the correct scrollHeight on shrink
      textarea.style.height = "auto"; 
      // Set new height capped at 200px
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-end gap-2 p-2 sm:gap-3 sm:p-0"
    >
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/50 transition-all">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          // Responsive classes:
          // text-base on mobile prevents iOS zooming on focus
          // sm:text-sm reverts to smaller text on desktop if preferred
          className="max-h-[200px] min-h-11 w-full resize-none border-0 bg-transparent px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <Button
        type="submit"
        size="icon"
        disabled={isLoading || !value.trim()}
        // Button is slightly smaller on mobile (size-10 vs size-12)
        className="size-10 shrink-0 rounded-full transition-transform hover:scale-105 active:scale-95 sm:size-12"
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin sm:size-5" />
        ) : (
          <Send className="size-4 sm:size-5" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}