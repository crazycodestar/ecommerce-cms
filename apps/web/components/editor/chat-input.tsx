"use client";

import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperclipIcon, SendIcon } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
}

export default function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-shadow",
        isFocused ? "shadow-md ring-1 ring-primary" : ""
      )}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Message v0..."
        className="min-h-[60px] max-h-[200px] border-0 focus-visible:ring-0 resize-none py-3 px-4"
      />

      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full"
        >
          <PaperclipIcon className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>

        <Button
          type="button"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onSend(value)}
          disabled={!value.trim()}
        >
          <SendIcon className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  );
}

// Import cn utility
import { cn } from "@/lib/utils";
