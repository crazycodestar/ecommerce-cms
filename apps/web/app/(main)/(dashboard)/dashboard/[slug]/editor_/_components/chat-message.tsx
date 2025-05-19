import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatMessage({
  role,
  content,
  timestamp,
}: ChatMessageProps) {
  const isCode = content.includes("```");

  const formatContent = () => {
    if (!isCode) return content;

    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const codeContent = part.slice(3, -3);
        const language = codeContent.split("\n")[0];
        const code = codeContent.slice(language.length + 1);

        return (
          <div
            key={index}
            className="mt-2 mb-2 rounded-md bg-gray-100 dark:bg-gray-800 p-4 w-[310px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                {language || "code"}
              </span>
              <button className="text-xs text-blue-500 hover:text-blue-700">
                Copy
              </button>
            </div>

            <pre className="text-sm overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <p key={index} className="whitespace-pre-wrap">
          {part}
        </p>
      );
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3",
        role === "assistant" ? "items-start" : "items-start"
      )}
    >
      <Avatar
        className={cn(
          "h-8 w-8",
          role === "assistant"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <AvatarFallback>{role === "assistant" ? "v0" : "U"}</AvatarFallback>
        {role === "assistant" && <AvatarImage src="/v0-logo.png" alt="v0" />}
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {role === "assistant" ? "v0" : "You"}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>

        {/* <div className="w-full bg-gray-200 rounded-md my-2 p-4">Data</div> */}

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {formatContent()}
        </div>
      </div>
    </div>
  );
}
