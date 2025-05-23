"use client";

import { ConvexError } from "convex/values";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: ConvexError<{ message: "" }> | (Error & { digest?: string });
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (error instanceof ConvexError) {
      console.error("ConvexError", error.message);
    } else if (error instanceof Error) {
      console.error("Error", error.message);
    } else {
      console.error("Unknown error", error);
    }
    console.error("here", error);
  }, [error]);

  return (
    <div className="flex-1 h-full w-full flex flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-medium">Something went wrong!</h2>
      <h2 className="text-xs font-medium max-w-md">{error.message}</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white rounded-md hover:opacity-75 transition"
      >
        Try again
      </button>
    </div>
  );
}
