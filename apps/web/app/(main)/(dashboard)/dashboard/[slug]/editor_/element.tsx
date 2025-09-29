"use client";

import {
  BodyElement,
  CodeEmbedElement,
  ContainerElement,
  Element,
  ImageElement,
  LinkBlockElement,
  LinkElement,
  SectionElement,
  TextElement,
} from "@/hooks/use-editor/elements";
import { cn } from "@/lib/utils";
import { RefObject, useEffect, useRef, useState } from "react";
// drag and drop
import { generateTailwindCSS } from "@/hooks/use-editor/properties";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import invariant from "tiny-invariant";
import { useEditor } from "@/hooks/use-editor";

export function routeToElement(element: Element) {
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
  const tailwindCSS = useTailwindCSS({ element });

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
        element.hasBeenEdited && tailwindCSS,
        "min-h-screen",
        editModeClassNames
      )}
    >
      {element.children.map((child) => routeToElement(child))}
    </div>
  );
}

function useDragAndDrop({ data }: { data: Element }) {
  const ref = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      draggable({
        element,
        getInitialData: () => ({ element: data }),
        onDragStart: () => setIsDragging(true),
        onDrag: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForExternal({
        element,
        getData: () => ({ element: data }),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          const sourceElement = source.data as Element;
          return element.id !== sourceElement.id || !!sourceElement.children;
        },
      })
    );
  }, []);

  return { ref, isDragging };
}

function useTailwindCSS({ element }: { element: Element }) {
  const variables = useEditor((state) => state.variables);

  return generateTailwindCSS(element.style, element.type, variables);
}

function Section({ element }: { element: SectionElement }) {
  const { ref, isDragging } = useDragAndDrop({ data: element });
  const tailwindCSS = useTailwindCSS({ element });

  return (
    <section
      ref={ref}
      data-id={element.id}
      className={cn(
        !(element.children.length || element.hasBeenEdited) && emptyClassNames,
        element.hasBeenEdited && tailwindCSS,
        editModeClassNames,
        isDragging && "opacity-50 pointer-events-none"
      )}
    >
      {element.children.map((child) => routeToElement(child))}
    </section>
  );
}

function Text({ element }: { element: TextElement }) {
  const { ref, isDragging } = useDragAndDrop({ data: element });
  const tailwindCSS = useTailwindCSS({ element });

  return (
    <p
      ref={ref as RefObject<HTMLParagraphElement | null>}
      data-id={element.id}
      className={cn(
        element.hasBeenEdited && tailwindCSS,
        editModeClassNames,
        isDragging && "opacity-50 pointer-events-none"
      )}
    >
      {element.text}
    </p>
  );
}

function Container({ element }: { element: ContainerElement }) {
  const { ref, isDragging } = useDragAndDrop({ data: element });
  const tailwindCSS = useTailwindCSS({ element });

  return (
    <div
      ref={ref as RefObject<HTMLDivElement | null>}
      data-id={element.id}
      className={cn(
        !(element.children.length || element.hasBeenEdited) && emptyClassNames,
        element.hasBeenEdited && tailwindCSS,
        editModeClassNames,
        isDragging && "opacity-50 pointer-events-none"
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

  const { ref, isDragging } = useDragAndDrop({ data: element });
  const tailwindCSS = useTailwindCSS({ element });

  return (
    <img
      src={imageUrl ? imageUrl : "/placeholder.svg"}
      ref={ref as RefObject<HTMLImageElement | null>}
      data-id={element.id}
      alt={element.alt}
      className={cn(
        !element.hasBeenEdited && "size-[200px] object-cover",
        element.hasBeenEdited && tailwindCSS,
        editModeClassNames,
        isDragging && "opacity-50 pointer-events-none"
      )}
    />
  );
}

function Link({ element }: { element: LinkElement }) {
  const { ref, isDragging } = useDragAndDrop({ data: element });
  const tailwindCSS = useTailwindCSS({ element });

  return (
    <a
      ref={ref as RefObject<HTMLAnchorElement | null>}
      data-id={element.id}
      href={element.href}
      className={cn(
        element.hasBeenEdited && tailwindCSS,
        editModeClassNames,
        isDragging && "opacity-50 pointer-events-none"
      )}
      onClick={(e) => e.preventDefault()}
    >
      {element.text}
    </a>
  );
}

function LinkBlock({ element }: { element: LinkBlockElement }) {
  const { ref, isDragging } = useDragAndDrop({ data: element });
  const tailwindCSS = useTailwindCSS({ element });

  return (
    <a
      ref={ref as RefObject<HTMLAnchorElement | null>}
      data-id={element.id}
      href={element.href}
      className={cn(
        !(element.children.length || element.hasBeenEdited) && emptyClassNames,
        element.hasBeenEdited && tailwindCSS,
        editModeClassNames,
        isDragging && "opacity-50 pointer-events-none"
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
  const { ref, isDragging } = useDragAndDrop({ data: element });
  const tailwindCSS = useTailwindCSS({ element });

  return (
    <div
      ref={ref as RefObject<HTMLDivElement | null>}
      data-id={element.id}
      className={cn(
        !element.hasBeenEdited && emptyClassNames,
        element.hasBeenEdited && tailwindCSS,
        editModeClassNames,
        isDragging && "opacity-50 pointer-events-none"
      )}
      dangerouslySetInnerHTML={{
        __html: element.code,
      }}
    />
  );
}
