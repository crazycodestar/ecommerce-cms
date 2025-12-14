"use client";

import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export const ContentConsumer = React.forwardRef<
  HTMLDivElement,
  {
    width: number | null;
    setWidth: (width: number) => void;
  }
>(({ width, setWidth }, ref) => {
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    if (containerRef.current) {
      startWidthRef.current = containerRef.current.offsetWidth;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(
        320,
        Math.min(1200, startWidthRef.current + deltaX)
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div ref={ref} className="h-full w-full">
      <div
        ref={containerRef}
        className={cn("relative h-full mx-auto")}
        style={{ width: `${width}px`, maxWidth: "100%" }}
      >
        <iframe
          id="editor-iframe"
          src={window.location.href}
          className={cn(
            "h-full w-full border-0",
            isResizing && "pointer-events-none"
          )}
          title={"Temp preview of the content"}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
        {/* Resize handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-gray-300 cursor-col-resize flex items-center justify-center group"
          onMouseDown={handleMouseDown}
          style={{ transform: "translateX(50%)" }}
        >
          <div className="py-1 bg-gray-300 group-hover:bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
});
