import { useRef, useState, useEffect } from "react";

export function useResizeOnDrag({
  onDrag,
  onDragEnd,
}: {
  onDrag?: (deltaX: number) => void;
  onDragEnd?: (deltaX: number) => void;
}) {
  const startXRef = useRef<number>(0);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      document
        .getElementById("editor-iframe")
        ?.classList.add("pointer-events-none");
      const deltaX = e.clientX - startXRef.current;
      onDrag?.(deltaX);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsResizing(false);
      document
        .getElementById("editor-iframe")
        ?.classList.remove("pointer-events-none");
      const deltaX = e.clientX - startXRef.current;
      onDragEnd?.(deltaX);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseleave", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [isResizing]);

  return { handleMouseDown };
}
