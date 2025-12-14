"use client";

import { generateTailwindCSS } from "@/db/compiler";
import { comp } from "@/db/lib/comp";
import { layers } from "@/db/lib/layers";
import { properties } from "@/db/lib/styles";
import { getSlots } from "@/db/resource/slots";
import { Slot, StyleOnElementType } from "@/db/types";
import { StyleSchema } from "@/db/types/style";
import { elementDefaultValues, SlotType } from "@/db/lib/layers";
import { cn } from "@/lib/utils";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import { useLiveQuery } from "dexie-react-hooks";
import { omit } from "es-toolkit";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

type DataAttributes = Record<`data-${string}`, string>;

export function ElementRouter({
  content,
  ...props
}: { content: Slot[] } & DataAttributes) {
  return (
    <>
      {content?.map((element) => (
        <SlotElement key={element.id} element={element} {...props} />
      ))}
    </>
  );
}

const emptyClassNames =
  "h-[50px] w-full border border-dashed border-neutral-600 inset-ring-2 inset-ring-neutral-300";
const editModeClassNames = "cursor-default";

function useDragAndDrop({
  data,
  parentId,
  isDraggable = true,
}: {
  data: Slot;
  parentId?: string;
  isDraggable?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      draggable({
        element,
        canDrag: () => isDraggable,
        getInitialData: () => ({ element: data, parentId }),
        onDragStart: () => setIsDragging(true),
        onDrag: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForExternal({
        element,
        getData: () => ({ dropTarget: data, dropTargetParentId: parentId }),
      }),
      dropTargetForElements({
        element,
        getData: () => ({ dropTarget: data, dropTargetParentId: parentId }),
        canDrop: ({ source }) => {
          const { element: sourceElement, parentId: sourceParentId } =
            source.data as { element: Element; parentId: string | undefined };

          return data.id !== sourceElement.id && sourceParentId === parentId;
        },
      })
    );
  }, []);

  return { ref, isDragging };
}

function assertIsInstanceSlot(
  element: Slot
): element is Slot & { type: "instance" } {
  return element.type === "instance";
}

function SlotElement({
  element,
  ...props
}: { element: Slot } & DataAttributes) {
  const Comp = element.slot as SlotType;
  const isBodySlot = layers.assertIsBodySlot(element);
  const isComponentChild = !!props["data-parent-id"];

  const content = useLiveQuery(() => getSlots({ parentId: element.id }));
  const component = useLiveQuery(async () => {
    if (!assertIsInstanceSlot(element)) return;

    const component = await comp.getComponent(element.data?.componentId);
    if (!component) return;

    const slot = await comp.getComponentRootSlot(element.data?.componentId);
    if (!slot) return;

    const style = await properties.getStyleObject(component.rootId);
    const styleObj = Object.fromEntries(
      Object.entries(style).map(([key, value]) => [key, value.properties])
    ) as Record<StyleOnElementType, StyleSchema>;
    const tailwindCSS = generateTailwindCSS(styleObj, element.type);

    const children = slot.canHaveChildren
      ? await getSlots({ parentId: slot.id })
      : undefined;

    return {
      slot,
      tailwindCSS,
      children,
      componentId: element.data?.componentId,
    };
  });

  const { ref, isDragging } = useDragAndDrop({
    data: element,
    parentId: props["data-parent-id"],
    isDraggable: !isBodySlot && !isComponentChild,
  });

  const tailwindCSS = useLiveQuery(async () => {
    const style = await properties.getStyleObject(element.id);
    const styleObj = Object.fromEntries(
      Object.entries(style).map(([key, value]) => [key, value.properties])
    ) as Record<StyleOnElementType, StyleSchema>;
    return generateTailwindCSS(styleObj, element.type);
  }, [element.id]);

  const unEditedClassNames = (() => {
    if (layers.canHaveChildren(element)) {
      return emptyClassNames;
    }
    if (element.type === elementDefaultValues.image.type) {
      return "size-[200px] object-cover";
    }

    return "";
  })();

  function getChildren(element: Slot) {
    if (layers.asChildrenAsText(element)) {
      return element.data.text;
    }

    if (!element.canHaveChildren) return;
    if (!content) return;

    return <ElementRouter content={content} {...props} />;
  }

  const formattedElement = (element: Slot) => {
    if (element.type === "instance" && component) {
      const { slot: rootElement, tailwindCSS, children } = component;
      return {
        ...omit(rootElement as Slot & { instanceOf?: never }, [
          "id",
          "slot",
          "name",
          "type",
          "canHaveChildren",
          "data",
          "instanceOf",
          "orderKey",
          "parentId",
        ]),
        ...(children && {
          children: (
            <ElementRouter
              content={children}
              data-parent-id={element.id}
              {...props}
            />
          ),
        }),
        className: tailwindCSS,
        "data-instance-id": element.id,
        "data-id": rootElement.id,
        ...(layers.assertHasHref(rootElement) && {
          href: rootElement.data.href,
        }),
      };
    }

    return {
      ...omit(element as Slot & { instanceOf?: never }, [
        "id",
        "slot",
        "name",
        "type",
        "canHaveChildren",
        "data",
        "instanceOf",
        "orderKey",
        "parentId",
      ]),
      children: getChildren(element),
      ...(layers.assertHasHref(element) && { href: element.data.href }),
    };
  };

  const hasSize =
    tailwindCSS?.includes("size-") ||
    (tailwindCSS?.includes("w-") && tailwindCSS?.includes("h-"));
  const hasBeenEdited = (content?.length ?? 0) > 0 || isBodySlot || hasSize;

  return (
    <Comp
      // @ts-expect-error Slot element ref too complex to represent
      ref={ref}
      data-id={element.id}
      className={cn(
        !hasBeenEdited && unEditedClassNames,
        tailwindCSS,
        editModeClassNames,
        isDragging && "opacity-50 pointer-events-none",
        isBodySlot && "min-h-screen"
        // isBodySlot && "min-h-screen p-8 gap-[50px]" // FIXME: Remove extra styling besides min-h-screen
        // isBodySlot && "min-h-screen grid-cols-3 p-8 gap-[50px] grid" // FIXME: Remove extra styling besides min-h-screen
      )}
      data-slot="slot"
      data-droppable={layers.canHaveChildren(element)}
      onClick={(e) => e.preventDefault()}
      {...formattedElement(element)}
      {...props}
    />
  );
}

// function Image({ element }: { element: ImageElement }) {
//   const imageUrl = useQuery(
//     api.images.getImageUrl,
//     element.src
//       ? {
//           imageId: element.src as Id<"_storage">,
//         }
//       : "skip"
//   );

//   const { ref, isDragging } = useDragAndDrop({ data: element });

//   const tailwindCSS = useTailwindCSS({ element });
//   return (
//     <img
//       src={imageUrl ? imageUrl : "/placeholder.svg"}
//       ref={ref as RefObject<HTMLImageElement | null>}
//       data-id={element.id}
//       alt={element.alt}
//       className={cn(
//         !element.hasBeenEdited && "size-[200px] object-cover",
//         element.hasBeenEdited && tailwindCSS,
//         editModeClassNames,
//         isDragging && "opacity-50 pointer-events-none"
//       )}
//     />
//   );
// }

// function CodeEmbed({ element }: { element: CodeEmbedElement }) {
//   // FIXME: tailwind classnames colors are having a weird behaviour. bg-black, bg-white
//   // and even bg-primary work fine. but bg-red-800 is not working.
//   const { ref, isDragging } = useDragAndDrop({ data: element });
//   const tailwindCSS = useTailwindCSS({ element });

//   return (
//     <div
//       ref={ref as RefObject<HTMLDivElement | null>}
//       data-id={element.id}
//       className={cn(
//         !element.hasBeenEdited && emptyClassNames,
//         element.hasBeenEdited && tailwindCSS,
//         editModeClassNames,
//         isDragging && "opacity-50 pointer-events-none"
//       )}
//       dangerouslySetInnerHTML={{
//         __html: element.code,
//       }}
//     />
//   );
// }

// function Component({ element }: { element: ComponentElement }) {
//   const components = useEditor((state) => state.components);
//   const component = components.find(
//     (component) => component.parentId === element.instanceOf
//   );

//   const formattedComponent = component
//     ? omit(component, ["parentId", "parentName"])
//     : undefined;

//   const combined = {
//     ...formattedComponent,
//     // ...element,
//     instanceOf: undefined,
//   } as Element;

//   const dataAttributes = component?.parentId
//     ? { "data-parent-id": component.parentId }
//     : undefined;

//   return <>{routeToElement(combined, dataAttributes)}</>;
// }
