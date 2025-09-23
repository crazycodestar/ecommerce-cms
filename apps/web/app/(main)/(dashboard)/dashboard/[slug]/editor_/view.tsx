"use client";

import { useEditor, useSync } from "@/hooks/use-editor";
import { useBaseStyles, useTailwindCSS } from "@/hooks/use-editor/properties";
import { useHotkeys } from "react-hotkeys-hook";
import { routeToElement } from "./element";
import { Indicator } from "./indicator";
import { useMonitor } from "./useMoniitor";

export function View() {
  useSync();
  useBaseStyles();
  useTailwindCSS();

  const pages = useEditor((state) => state.pages);
  const page = pages.find((page) => page.id === "home")!;
  const { isDragging, activeElement, dropIndicator } = useMonitor(page);

  const setFocusElement = useEditor((state) => state.setFocusElement);
  useHotkeys("esc", () => setFocusElement(null), {
    enableOnFormTags: false,
  });

  return (
    <>
      <Indicator
        page={page}
        isDragging={isDragging}
        activeElement={activeElement}
        dropIndicator={dropIndicator}
      />
      {[page.body].map((element) => routeToElement(element))}
    </>
  );
}
