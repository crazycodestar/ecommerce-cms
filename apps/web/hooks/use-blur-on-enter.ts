import { useEffect, useRef } from "react";

export function useBlurOnEnter() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        inputRef.current?.blur();
      }
    }

    inputRef.current?.addEventListener("keydown", handleKeyDown);

    return () =>
      inputRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [inputRef]);

  return { inputRef };
}

export function useBlurOnEnterTextarea() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        inputRef.current?.blur();
      }
    }

    inputRef.current?.addEventListener("keydown", handleKeyDown);

    return () =>
      inputRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [inputRef]);

  return { inputRef };
}
