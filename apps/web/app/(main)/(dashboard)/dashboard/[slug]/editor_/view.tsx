"use client";

import { useEditor, useSync } from "@/hooks/use-editor";
import {
  BodyElement,
  CodeEmbedElement,
  ContainerElement,
  Element,
  ImageElement,
  layers,
  LinkBlockElement,
  LinkElement,
  SectionElement,
  TextElement,
  type ElementType,
  type Page,
} from "@/hooks/use-editor/elements";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
// drag and drop
import {
  isTextElement,
  parseJSONToTailwindCSS,
  useBaseStyles,
  useTailwindCSS,
} from "@/hooks/use-editor/properties";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { DragLocationHistory } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  dropTargetForExternal,
  monitorForExternal,
} from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import invariant from "tiny-invariant";
import { useHotkeys } from "react-hotkeys-hook";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";

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

  const [isDragging, setIsDragging] = useState(false);
  const [activeElement, setActiveElement] = useState<HighlightBox | null>(null);
  const [dropIndicator, setDropIndicator] = useState<Omit<
    HighlightBox,
    "type" | "bottom" | "id" | "name"
  > | null>(null);

  function closestEdge({
    element,
    mousePosition,
    windowScroll,
    canDrop = true,
    directions,
  }: {
    element: {
      top: number;
      left: number;
      bottom: number;
      right: number;
      width: number;
      height: number;
    };
    mousePosition: { clientX: number; clientY: number };
    windowScroll: { scrollX: number; scrollY: number };
    canDrop: boolean;
    directions: ("top" | "right" | "left" | "bottom")[];
  }) {
    if (!canDrop) {
      const distanceFromArray: [number, number, number, number] = [
        Math.abs(element.top - mousePosition.clientY),
        Math.abs(element.right - mousePosition.clientX),
        Math.abs(element.left - mousePosition.clientX),
        Math.abs(element.bottom - mousePosition.clientY),
      ];
      const minDistance = Math.min(...distanceFromArray);
      if (minDistance === distanceFromArray[0] && directions.includes("top")) {
        return {
          edge: "top" as const,
          instruction: "before" as const,
          top: element.top + windowScroll.scrollY,
          left: element.left + windowScroll.scrollX,
          width: element.width,
          height: 0,
        };
      }
      if (
        minDistance === distanceFromArray[1] &&
        directions.includes("right")
      ) {
        return {
          edge: "right" as const,
          instruction: "after" as const,
          top: element.top + windowScroll.scrollY,
          left: element.left + element.width + windowScroll.scrollX,
          width: 0,
          height: element.height,
        };
      }
      if (minDistance === distanceFromArray[2] && directions.includes("left")) {
        return {
          edge: "left" as const,
          instruction: "before" as const,
          top: element.top + windowScroll.scrollY,
          left: element.left + windowScroll.scrollX,
          width: 0,
          height: element.height,
        };
      }
      if (
        minDistance === distanceFromArray[3] &&
        directions.includes("bottom")
      ) {
        return {
          edge: "bottom" as const,
          instruction: "after" as const,
          top: element.top + element.height + windowScroll.scrollY,
          left: element.left + windowScroll.scrollX,
          width: element.width,
          height: 0,
        };
      }
    }
    const THRESHOLD = 10;

    if (
      mousePosition.clientX < element.left + THRESHOLD &&
      directions.includes("left")
    ) {
      return {
        edge: "left" as const,
        instruction: "before" as const,
        top: element.top + windowScroll.scrollY,
        left: element.left + windowScroll.scrollX,
        width: 0,
        height: element.height,
      };
    }
    if (
      mousePosition.clientX > element.right - THRESHOLD &&
      directions.includes("right")
    ) {
      return {
        edge: "right" as const,
        instruction: "after" as const,
        top: element.top + windowScroll.scrollY,
        left: element.left + element.width + windowScroll.scrollX,
        width: 0,
        height: element.height,
      };
    }
    if (
      mousePosition.clientY < element.top + THRESHOLD &&
      directions.includes("top")
    ) {
      return {
        edge: "top" as const,
        instruction: "before" as const,
        top: element.top + windowScroll.scrollY,
        left: element.left + windowScroll.scrollX,
        width: element.width,
        height: 0,
      };
    }
    if (
      mousePosition.clientY > element.bottom - THRESHOLD &&
      directions.includes("bottom")
    ) {
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
    const parentElement = location.current.dropTargets[1]?.element as
      | globalThis.Element
      | undefined;
    const dropTargetRect = dropTarget?.getBoundingClientRect();

    const dropTargetDataSetId = (dropTarget as HTMLElement)?.dataset.id;
    const dropTargetDataSetElement = dropTargetDataSetId
      ? layers.find(page.body, dropTargetDataSetId)
      : undefined;

    const isFlexRow = parentElement?.className.includes("flex-row");
    const isGrid = parentElement?.className.includes("grid");

    const parentElementDataSetId = (parentElement as HTMLElement)?.dataset.id;
    const parentElementDataSetElement = parentElementDataSetId
      ? layers.find(page.body, parentElementDataSetId)
      : undefined;

    const closest = dropTargetRect
      ? closestEdge({
          element: dropTargetRect,
          mousePosition: location.current.input,
          windowScroll: window,
          canDrop: dropTargetDataSetElement
            ? !isTextElement(dropTargetDataSetElement.type)
            : true,
          directions: isFlexRow
            ? ["left", "right"]
            : isGrid
              ? ["top", "bottom", "left", "right"]
              : ["top", "bottom"],
        })
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
              type: layers.find(page.body, el.id)?.type,
              name: layers.find(page.body, el.id)?.name ?? "",
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

          const elementType = source.getStringData(
            "text/plain"
          ) as Element["type"];
          const instruction = closest?.instruction;

          const newItem = layers.newItem(elementType);
          insertElementToPage(
            page.id,
            validDropTarget.dataset.id,
            instruction,
            newItem
          );

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

const useInspector = (elements: Element & { children: Element[] }) => {
  const focusElement = useEditor((state) => state.focusElement);
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

    const handleMouseLeave = () => setHighlight(null);

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
      setFocusElement(validEl?.dataset.id ?? null);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [elements]);

  useEffect(() => {
    if (!focusElement) return setFocusElementPreview(null);
    const el = document.querySelector(`[data-id="${focusElement}"]`);
    if (!el) return setFocusElementPreview(null);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const rect = entry.target.getBoundingClientRect();
        setFocusElementPreview({
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          width: rect.width,
          height: rect.height,
          type: layers.find(elements, focusElement)?.type,
          id: focusElement,
          name: layers.find(elements, focusElement)?.name ?? "",
        });
      }
    });

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [focusElement]);

  const handlePlaceInspectorLabel = (highlight: HighlightBox) => {
    return highlight.top ? highlight.top - 20 : window.scrollY;
  };

  return { highlight, handlePlaceInspectorLabel, focusElementPreview };
};

function Indicator({ page }: { page: Page }) {
  const { isDragging, activeElement, dropIndicator } = useMonitor(page);
  const { highlight, handlePlaceInspectorLabel, focusElementPreview } =
    useInspector(page.body);

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

  const setFocusElement = useEditor((state) => state.setFocusElement);
  useHotkeys("esc", () => setFocusElement(null), {
    enableOnFormTags: false,
  });

  const pages = useEditor((state) => state.pages);
  const page = pages.find((page) => page.id === "home")!;

  return (
    <>
      <Indicator page={page} />
      {[page.body].map((element) => routeToElement(element))}
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
        element.hasBeenEdited &&
          parseJSONToTailwindCSS(element.style, element.type),
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
        element.hasBeenEdited &&
          parseJSONToTailwindCSS(element.style, element.type),
        editModeClassNames
      )}
    >
      {element.children.map((child) => routeToElement(child))}
    </section>
  );
}

function Text({ element }: { element: TextElement }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      dropTargetForExternal({
        element,
        getData: () => ({ elementType: Element.text.type }),
      }),
      dropTargetForElements({
        element,
      })
    );
  }, []);

  return (
    <p
      ref={ref}
      data-id={element.id}
      className={cn(
        element.hasBeenEdited &&
          parseJSONToTailwindCSS(element.style, element.type),
        editModeClassNames
      )}
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
        element.hasBeenEdited &&
          parseJSONToTailwindCSS(element.style, element.type),
        editModeClassNames
      )}
    >
      {element.children.map((child) => routeToElement(child))}
    </div>
  );
}

function Image({ element }: { element: ImageElement }) {
  const imageUrl = useQuery(
    api.images.getImageUrl,
    element.src
      ? {
          imageId: element.src as Id<"_storage">,
        }
      : "skip"
  );

  return (
    <img
      src={imageUrl ? imageUrl : "/placeholder.svg"}
      // src={"/placeholder.svg"}
      data-id={element.id}
      alt={element.alt}
      className={cn(
        !element.hasBeenEdited && "size-[200px] object-cover",
        element.hasBeenEdited &&
          parseJSONToTailwindCSS(element.style, element.type),
        editModeClassNames
      )}
    />
  );
}

function Link({ element }: { element: LinkElement }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      dropTargetForExternal({
        element,
        getData: () => ({ elementType: Element.link.type }),
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
        element.hasBeenEdited &&
          parseJSONToTailwindCSS(element.style, element.type),
        editModeClassNames
      )}
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
        element.hasBeenEdited &&
          parseJSONToTailwindCSS(element.style, element.type),
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
        element.hasBeenEdited &&
          parseJSONToTailwindCSS(element.style, element.type),
        editModeClassNames
      )}
      dangerouslySetInnerHTML={{
        __html: element.code,
      }}
    />
  );
}
