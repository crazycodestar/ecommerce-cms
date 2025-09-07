"use client";

import { useEditor, useSync } from "@/hooks/use-editor";
import { layers } from "@/hooks/use-editor/elements";
import {
  BodyElement,
  CodeEmbedElement,
  LinkBlockElement,
  LinkElement,
  ImageElement,
  ContainerElement,
  TextElement,
  SectionElement,
  Element,
  type ElementType,
  type Page,
} from "@/hooks/use-editor/elements";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
// drag and drop
import invariant from "tiny-invariant";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  dropTargetForExternal,
  monitorForExternal,
} from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import { DragLocationHistory } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import {
  parseJSONToTailwindCSS,
  useBaseStyles,
  useTailwindCSS,
} from "@/hooks/use-editor/properties";

type HighlightBox = {
  left: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  type: ElementType | undefined;
  name: string;
  id: string;
};

const useMonitor = (page: Page) => {
  const insertElementToPage = useEditor((state) => state.insertElementToPage);
  const addElementToPage = useEditor((state) => state.addElementToPage);

  const [isDragging, setIsDragging] = useState(false);
  const [activeElement, setActiveElement] = useState<HighlightBox | null>(null);
  const [dropIndicator, setDropIndicator] = useState<Omit<
    HighlightBox,
    "type" | "bottom" | "id" | "name"
  > | null>(null);

  function closestEdge(
    element: {
      top: number;
      left: number;
      bottom: number;
      right: number;
      width: number;
      height: number;
    },
    mousePosition: { clientX: number; clientY: number },
    windowScroll: { scrollX: number; scrollY: number }
  ) {
    const THRESHOLD = 10;

    if (mousePosition.clientX < element.left + THRESHOLD) {
      return {
        edge: "left" as const,
        instruction: "before" as const,
        top: element.top + windowScroll.scrollY,
        left: element.left + windowScroll.scrollX,
        width: 0,
        height: element.height,
      };
    }
    if (mousePosition.clientX > element.right - THRESHOLD) {
      return {
        edge: "right" as const,
        instruction: "after" as const,
        top: element.top + windowScroll.scrollY,
        left: element.left + element.width + windowScroll.scrollX,
        width: 0,
        height: element.height,
      };
    }
    if (mousePosition.clientY < element.top + THRESHOLD) {
      return {
        edge: "top" as const,
        instruction: "before" as const,
        top: element.top + windowScroll.scrollY,
        left: element.left + windowScroll.scrollX,
        width: element.width,
        height: 0,
      };
    }
    if (mousePosition.clientY > element.bottom - THRESHOLD) {
      return {
        edge: "bottom" as const,
        instruction: "after" as const,
        top: element.top + element.height + windowScroll.scrollY,
        left: element.left + windowScroll.scrollX,
        width: element.width,
        height: 0,
      };
    }
    return null;
  }

  const getClosestAndDropTarget = (location: DragLocationHistory) => {
    const dropTarget = location.current.dropTargets[0]?.element as
      | globalThis.Element
      | undefined;
    const dropTargetRect = dropTarget?.getBoundingClientRect();

    const closest = dropTargetRect
      ? closestEdge(dropTargetRect, location.current.input, window)
      : null;

    const parentEl = location.current.dropTargets[1]?.element as
      | globalThis.Element
      | undefined;
    const el = closest ? parentEl : dropTarget;
    const rect = el?.getBoundingClientRect();

    return {
      closest,
      activeElement:
        el && rect
          ? {
              left: rect.left + window.scrollX,
              top: rect.top + window.scrollY,
              bottom: rect.bottom + window.scrollY,
              width: rect.width,
              height: rect.height,
              type: layers.find(page.elements, el.id)?.type,
              name: layers.find(page.elements, el.id)?.name ?? "",
              id: (el as HTMLElement).id,
            }
          : null,
      dropTarget,
    };
  };

  useEffect(() => {
    return combine(
      monitorForExternal({
        onDragStart: () => setIsDragging(true),
        onDrag: ({ location }) => {
          const { closest, activeElement } = getClosestAndDropTarget(location);
          setActiveElement(activeElement);
          setDropIndicator(closest);
        },
        onDrop: ({ source, location }) => {
          const { closest, dropTarget } = getClosestAndDropTarget(location);
          if (!dropTarget) return;

          const validDropTarget = recursivelyFindNearestElement(
            dropTarget as HTMLElement
          );
          if (!validDropTarget) return;

          const element = source.getStringData("text/plain") as Element["type"];
          const instruction = closest?.instruction;

          if (instruction)
            insertElementToPage(
              page.id,
              validDropTarget.dataset.id,
              instruction,
              element
            );
          else addElementToPage(page.id, validDropTarget.dataset.id, element);

          setIsDragging(false);
          setActiveElement(null);
          setDropIndicator(null);
        },
      }),
      monitorForElements({
        onDragStart: () => setIsDragging(true),
      })
    );
  }, []);

  return { isDragging, activeElement, dropIndicator };
};

const recursivelyFindNearestElement = (el: HTMLElement) => {
  if (el.dataset.id) return el as HTMLElement & { dataset: { id: string } };
  if (el.parentElement) return recursivelyFindNearestElement(el.parentElement);
  return null;
};

const useInspector = (elements: Element[]) => {
  const setFocusElement = useEditor((state) => state.setFocusElement);

  const [highlight, setHighlight] = useState<HighlightBox | null>(null);
  const [focusElementPreview, setFocusElementPreview] =
    useState<HighlightBox | null>(null);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY);

      if (
        !el ||
        (el as HTMLElement).id === "inspector-highlight" ||
        (el as HTMLElement).id === "inspector-label"
      ) {
        return;
      }

      const validEl = recursivelyFindNearestElement(el as HTMLElement);
      if (!validEl) return;

      const rect = validEl.getBoundingClientRect();
      const id = validEl.dataset.id;

      setHighlight({
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        width: rect.width,
        height: rect.height,
        type: layers.find(elements, id)?.type,
        id,
        name: layers.find(elements, id)?.name ?? "",
      });
    }

    function handleClick(e: MouseEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY);

      if (
        !el ||
        (el as HTMLElement).id === "focusElement-highlight" ||
        (el as HTMLElement).id === "focusElement-label"
      ) {
        return;
      }

      const validEl = recursivelyFindNearestElement(el as HTMLElement);
      if (!validEl) return;

      const rect = validEl.getBoundingClientRect();
      const id = validEl.dataset.id;

      const focusElement = layers.find(elements, id);
      if (focusElement) setFocusElement(focusElement);

      setFocusElementPreview({
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        width: rect.width,
        height: rect.height,
        type: layers.find(elements, id)?.type,
        id,
        name: layers.find(elements, id)?.name ?? "",
      });
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
    };
  }, [elements]);

  const handlePlaceInspectorLabel = (highlight: HighlightBox) => {
    if (highlight.type) {
      // adjust for when the element is at the top of the page
      return highlight.top ? highlight.top - 20 : highlight.bottom;
    }
    // No type means type is body element
    return highlight.top;
  };

  return { highlight, handlePlaceInspectorLabel, focusElementPreview };
};

function Indicator({ page }: { page: Page }) {
  const { isDragging, activeElement, dropIndicator } = useMonitor(page);
  const { highlight, handlePlaceInspectorLabel, focusElementPreview } =
    useInspector(page.elements);

  function DragIndicator() {
    return (
      <>
        {/* Label Box */}
        {activeElement && (
          <div
            id="inspector-label"
            className={cn(
              "capitalize absolute bg-blue-500 text-white text-xs py-0.5 px-[5px] rounded-[3px] whitespace-nowrap z-50",
              activeElement.top ? "rounded-b-none" : "rounded-t-none"
            )}
            style={{
              left: activeElement.left,
              top: handlePlaceInspectorLabel(activeElement),
            }}
          >
            {activeElement.name ?? "Unknown"}
          </div>
        )}

        {/* Active Element Box */}
        {activeElement && (
          <div
            className="absolute border-2 border-blue-500 pointer-events-none z-50"
            style={{
              left: activeElement.left,
              top: activeElement.top,
              width: activeElement.width,
              height: activeElement.height,
            }}
          />
        )}

        {/* Drop Indicator */}
        {dropIndicator && (
          <div
            className="absolute border-2 border-red-500 pointer-events-none z-50"
            style={dropIndicator}
          />
        )}
      </>
    );
  }

  function FocusIndicator() {
    if (!focusElementPreview) return null;

    return (
      <>
        {/* Focus Element Box */}
        <div
          id="focusElement-highlight"
          className="absolute border-2 border-blue-500 pointer-events-none z-50"
          style={focusElementPreview}
        />

        {/* Focus Element Label Box */}
        <div
          id="focusElement-label"
          className={cn(
            "capitalize absolute bg-blue-500 text-white text-xs py-0.5 px-[5px] rounded-[3px] whitespace-nowrap z-50",
            focusElementPreview.top ? "rounded-b-none" : "rounded-t-none"
          )}
          style={{
            left: focusElementPreview.left,
            top: handlePlaceInspectorLabel(focusElementPreview),
          }}
        >
          {focusElementPreview.name ?? "Unknown"}
        </div>
      </>
    );
  }

  function InspectorHighlight() {
    return (
      <>
        {/* Inspector Highlight Box */}
        {highlight && (
          <div
            id="inspector-highlight"
            className="absolute border-2 border-blue-500 pointer-events-none z-50"
            style={{
              left: highlight.left,
              top: highlight.top,
              width: highlight.width,
              height: highlight.height,
            }}
          />
        )}

        {/* Inspector Label Box */}
        {highlight && (
          <div
            id="inspector-label"
            className={cn(
              "capitalize absolute bg-transparent text-blue-500 ring-inset ring-2 ring-blue-500 text-xs font-medium py-0.5 px-[5px] rounded-[3px] whitespace-nowrap z-50 pointer-events-none",
              highlight.top ? "rounded-b-none" : "rounded-t-none"
            )}
            style={{
              left: highlight.left,
              top: handlePlaceInspectorLabel(highlight),
            }}
          >
            {highlight.name ?? "Unknown"}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {isDragging ? (
        <DragIndicator />
      ) : (
        <>
          {focusElementPreview && <FocusIndicator />}
          {highlight && highlight.id !== focusElementPreview?.id && (
            <InspectorHighlight />
          )}
        </>
      )}
    </>
  );
}

export function View() {
  useSync();
  useBaseStyles();
  useTailwindCSS();

  const pages = useEditor((state) => state.pages);
  const page = pages.find((page) => page.id === "home")!;

  return (
    <>
      <Indicator page={page} />
      {page.elements.map((element) => routeToElement(element))}
    </>
  );
}

function routeToElement(element: Element) {
  if (element.type === Element.body.type) {
    return <Body key={element.id} element={element} />;
  }
  if (element.type === Element.section.type) {
    return <Section key={element.id} element={element} />;
  }
  if (element.type === Element.text.type) {
    return <Text key={element.id} element={element} />;
  }
  if (element.type === Element.container.type) {
    return <Container key={element.id} element={element} />;
  }
  if (element.type === Element.image.type) {
    return <Image key={element.id} element={element} />;
  }
  if (element.type === Element.link.type) {
    return <Link key={element.id} element={element} />;
  }
  if (element.type === Element.linkBlock.type) {
    return <LinkBlock key={element.id} element={element} />;
  }
  if (element.type === Element.codeEmbed.type) {
    return <CodeEmbed key={element.id} element={element} />;
  }

  return null;
}

const emptyClassNames =
  "h-[50px] w-full border border-dashed border-neutral-600 inset-ring-2 inset-ring-neutral-300";
const editModeClassNames = "cursor-default";

function Body({ element }: { element: BodyElement }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      dropTargetForExternal({
        element,
        getData: (data) => ({ data }),
      }),
      dropTargetForElements({
        element,
      })
    );
  }, []);

  return (
    <div
      ref={ref}
      data-id={element.id}
      className={cn(
        parseJSONToTailwindCSS(element.style),
        "min-h-screen",
        editModeClassNames
      )}
    >
      {element.children.map((child) => routeToElement(child))}
    </div>
  );
}

function Section({ element }: { element: SectionElement }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      dropTargetForExternal({
        element,
        getData: () => ({ elementType: Element.section.type }),
      }),
      dropTargetForElements({
        element,
      })
    );
  }, []);

  return (
    <section
      ref={ref}
      data-id={element.id}
      className={cn(
        !(element.children.length || element.hasBeenEdited) && emptyClassNames,
        parseJSONToTailwindCSS(element.style),
        editModeClassNames
      )}
    >
      {element.children.map((child) => routeToElement(child))}
    </section>
  );
}

function Text({ element }: { element: TextElement }) {
  return (
    <p
      data-id={element.id}
      className={cn(element.className?.join(" ") ?? "", editModeClassNames)}
    >
      {element.text}
    </p>
  );
}

function Container({ element }: { element: ContainerElement }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      dropTargetForExternal({
        element,
        getData: () => ({ elementType: Element.container.type }),
      }),
      dropTargetForElements({
        element,
      })
    );
  }, []);

  return (
    <div
      ref={ref}
      data-id={element.id}
      className={cn(
        !(element.children.length || element.hasBeenEdited) && emptyClassNames,
        parseJSONToTailwindCSS(element.style),
        editModeClassNames
      )}
    >
      {element.children.map((child) => routeToElement(child))}
    </div>
  );
}

function Image({ element }: { element: ImageElement }) {
  return (
    <img
      src={element.src}
      data-id={element.id}
      alt={element.alt}
      className={cn(
        !element.hasBeenEdited && "size-[200px] object-cover",
        parseJSONToTailwindCSS(element.style),
        editModeClassNames
      )}
    />
  );
}

function Link({ element }: { element: LinkElement }) {
  return (
    <a
      data-id={element.id}
      href={element.href}
      className={cn(parseJSONToTailwindCSS(element.style), editModeClassNames)}
      onClick={(e) => e.preventDefault()}
    >
      {element.text}
    </a>
  );
}

function LinkBlock({ element }: { element: LinkBlockElement }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      dropTargetForExternal({
        element,
        getData: () => ({ elementType: Element.linkBlock.type }),
      }),
      dropTargetForElements({
        element,
      })
    );
  }, []);

  return (
    <a
      ref={ref}
      data-id={element.id}
      href={element.href}
      className={cn(
        !(element.children.length || element.hasBeenEdited) && emptyClassNames,
        parseJSONToTailwindCSS(element.style),
        editModeClassNames
      )}
      onClick={(e) => e.preventDefault()}
    >
      {element.children.map((child) => routeToElement(child))}
    </a>
  );
}

function CodeEmbed({ element }: { element: CodeEmbedElement }) {
  // FIXME: tailwind classnames colors are having a weird behaviour. bg-black, bg-white
  // and even bg-primary work fine. but bg-red-800 is not working.
  return (
    <div
      data-id={element.id}
      className={cn(
        !element.hasBeenEdited && emptyClassNames,
        parseJSONToTailwindCSS(element.style),
        editModeClassNames
      )}
      dangerouslySetInnerHTML={{
        __html: element.code,
      }}
    />
  );
}
