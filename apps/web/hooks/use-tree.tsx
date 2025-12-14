import { getSlot, getSlots } from "@/db/resource/slots";
import { Slot } from "@/db/types";
import { tryCatch } from "@/lib/try-catch";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useEditor } from "@/context/editor";
import { layers } from "@/db/lib/layers";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { isEqual } from "es-toolkit";
import React, { useRef } from "react";
import invariant from "tiny-invariant";

type Item = {
  name: string;
  children?: string[];
};

export type StepType = Record<"top" | "bottom", [number, number] | undefined>;

export type ItemInstance = {
  indent: number;
  index: number;
  stepRange: StepType;
  getId: () => string;
  getItemData: () => Item;
  getChildren: () => Promise<string[]>;
  isFolder: () => boolean;
  isExpanded: () => boolean;
  isFocused: () => boolean;
  expand: () => void;
  collapse: () => void;
  focus: () => void;
  orderKey: string;
};

interface TreeObj {
  rootId: Element["id"];
}

type FlatMap = {
  element: Slot;
  expandedItems: Element["id"][];
  indent?: number;
  focusElementId?: Element["id"];
  expand: (id: string) => void;
  collapse: (id: string) => void;
  focus: (id: string) => void;
  startIndex?: number;
  getStepRange: (currentIndent: number, index: number) => StepType;
};

async function flatMap({
  element,
  expandedItems,
  indent,
  startIndex,
  ...others
}: FlatMap): Promise<ItemInstance[]> {
  let index = startIndex ?? 0;
  indent = indent ?? 0;

  const items: ItemInstance[] = [];

  const { data: content, error } = await tryCatch(
    getSlots({ parentId: element.id })
  );
  if (error) return [];

  for (const child of content) {
    items.push({
      getId: () => child.id,
      getItemData: () => ({
        name: child.name,
      }),
      getChildren: async () => {
        const { data: children, error } = await tryCatch(
          getSlots({ parentId: child.id })
        );
        if (error) return [];
        return children.map((child) => child.id);
      },
      isFolder: () => !!child.canHaveChildren,
      isExpanded: () => expandedItems.includes(child.id),
      expand: () => others.expand(child.id),
      collapse: () => others.collapse(child.id),
      isFocused: () => child.id === others.focusElementId,
      focus: () => others.focus(child.id),
      indent: indent,
      index: index,
      stepRange: others.getStepRange(indent, index),
      orderKey: child.orderKey,
    });
    index++;
    if (expandedItems.includes(child.id)) {
      const children = await flatMap({
        element: child,
        expandedItems,
        indent: (indent ?? 0) + 1,
        startIndex: index,
        ...others,
      });
      items.push(...children);
      index += children.length;
    }
  }

  return items;
}

type ElementWithChildren = Slot & { canHaveChildren: true };

export const useTree = (tree: TreeObj) => {
  const { focusElementId, setFocusElementId } = useEditor();

  const [expandedItems, setExpandedItems] = useState<
    ElementWithChildren["id"][]
  >([]);

  function setExpanded() {
    return;
    // if (focusElement) {
    //   const path = layers.getPath(pages[0].body, focusElement);
    //   if (!path.length) return;

    //   // path.slice(1, -1) omits the focusElement
    //   setExpandedItems((init) => [...init, ...path.slice(1, -1)]);
    // }
  }

  useEffect(() => {
    setExpanded();
  }, [focusElementId]);

  const expand = (id: string) =>
    setExpandedItems((init) => (!init.includes(id) ? [...init, id] : init));
  const collapse = (collapseId: string) =>
    setExpandedItems((init) => init.filter((id) => id !== collapseId));
  const focus = (id: string) => setFocusElementId(id);

  const [items, setItems] = useState<ItemInstance[]>([]);

  function getStepRange(currentIndent: number, index: number) {
    const prevItemIndent = items[index - 1]?.indent as number | undefined;
    const nextItemIndent = items[index + 1]?.indent as number | undefined;

    const step: StepType = {
      top: undefined,
      bottom: undefined,
    };

    if (prevItemIndent && currentIndent < prevItemIndent)
      step.top = [prevItemIndent, currentIndent];
    if (!nextItemIndent) step.bottom = [currentIndent, 0];
    if (nextItemIndent && currentIndent > nextItemIndent)
      step.bottom = [currentIndent, nextItemIndent];

    return step;
  }

  async function getItems(id: string) {
    const el = await getSlot(id);
    if (!el) return [];

    return flatMap({
      element: el,
      expandedItems,
      focusElementId,
      expand,
      collapse,
      focus,
      getStepRange,
    });
  }

  useEffect(() => {
    async function fetchItems() {
      setItems(await getItems(tree.rootId));
    }
    fetchItems();
  }, [expandedItems, focusElementId, tree.rootId]);

  return {
    tree: {
      getItems: () => items,
    },
  };
};

type HighlightProps = {
  indent: number;
  index: number;
};

type PlaceProps = {
  source: ItemInstance;
  dropTarget: ItemInstance;
  edge: "top" | "bottom" | "center" | null;
  step: number;
};
interface TreeContextType {
  highlightedItemId: string | null;
  highlight: (highlightProps: HighlightProps | null) => void;
  place: (placeProps: PlaceProps) => void;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export const Tree = ({
  items,
  rootId,
  children,
}: PropsWithChildren<{ items: ItemInstance[]; rootId: string }>) => {
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null
  );

  function highlight(highlightProps: HighlightProps | null) {
    if (highlightProps === null) return setHighlightedItemId(null);

    const { indent, index } = highlightProps;

    for (let i = index - 1; i > -1; i--) {
      if (items[i].isExpanded() && items[i].indent === indent - 1) {
        setHighlightedItemId(items[i].getId());
        return;
      }
    }

    setHighlightedItemId(null);
  }

  function getNextItem(item: ItemInstance) {
    return items
      .filter((i) => i.indent === item.indent)
      .find((i) => i.index > item.index);
  }

  function place({ source, dropTarget, edge, step }: PlaceProps) {
    // for handling placing in body
    if (dropTarget.indent !== step && !highlightedItemId) {
      const nextItem = getNextItem(dropTarget);
      if (!nextItem)
        return layers.moveElement({
          instruction: {
            position: "insert",
          },
          elementId: source.getId(),
          parentId: rootId,
        });

      // this is triggered when placing in body but it's not the last element in body
      return layers.moveElement({
        instruction: {
          position: "before",
          siblingId: nextItem.getId(),
        },
        elementId: source.getId(),
        parentId: rootId,
      });
    }

    // if I'm shifting to a new indent, place at the bottom of the folder of the new indent
    if (dropTarget.indent !== step)
      return layers.moveElement({
        instruction: {
          position: "insert",
        },
        elementId: source.getId(),
        parentId: highlightedItemId ?? rootId,
      });

    if (edge === "top")
      return layers.moveElement({
        instruction: {
          position: "before",
          siblingId: dropTarget.getId(),
        },
        elementId: source.getId(),
        parentId: highlightedItemId ?? rootId,
      });

    if (edge === "bottom")
      return layers.moveElement({
        instruction: {
          position: "after",
          siblingId: dropTarget.getId(),
        },
        elementId: source.getId(),
        parentId: highlightedItemId ?? rootId,
      });

    if (edge === "center")
      return layers.moveElement({
        instruction: {
          position: "insert",
        },
        elementId: source.getId(),
        parentId: dropTarget.getId(),
      });
  }

  return (
    <TreeContext.Provider value={{ highlightedItemId, highlight, place }}>
      {children}
    </TreeContext.Provider>
  );
};

export const useTreeContext = () => {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error("useTreeContext must be used within a Tree");
  }

  return context;
};

type TaskState =
  | {
      type: "idle";
    }
  | {
      type: "preview";
      container: HTMLElement;
    }
  | {
      type: "is-dragging";
    }
  | {
      type: "is-dragging-over";
      closestEdge: "top" | "bottom" | "center" | null;
      step: number;
    };

const idle: TaskState = { type: "idle" };

type GetClosestEdgeAndIndent = {
  height: number;
  deltaX: number;
  deltaY: number;
  indentThreshold: number;
  defaultIndent: number;
  allowedSides: ("top" | "bottom" | "center")[];
  step: StepType;
};

function getClosestEdgeAndStep({
  height,
  deltaX,
  deltaY,
  indentThreshold,
  defaultIndent,
  allowedSides,
  step,
}: GetClosestEdgeAndIndent) {
  const threshhold = 8;
  const proxyIndent = Math.trunc(deltaX / indentThreshold);

  if (allowedSides.includes("center")) {
    if (deltaY > threshhold && deltaY < height - threshhold) {
      return { edge: "center" as const, step: defaultIndent };
    }
  }

  if (allowedSides.includes("top") && deltaY < height / 2) {
    return {
      edge: "top" as const,
      step: step?.top
        ? Math.max(Math.min(proxyIndent, step.top[0]), step.top[1])
        : defaultIndent,
    };
  }
  if (allowedSides.includes("bottom") && deltaY > height / 2) {
    return {
      edge: "bottom" as const,
      step: step?.bottom
        ? Math.max(Math.min(proxyIndent, step.bottom[0]), step.bottom[1])
        : defaultIndent,
    };
  }

  return { edge: "center" as const, step: defaultIndent };
}

export function useTreeItem({
  item,
  indentWidth,
}: {
  item: ItemInstance;
  indentWidth: number;
}) {
  const { highlightedItemId, highlight, place } = useTreeContext();

  const ref = useRef(null);
  const [state, setState] = useState<TaskState>(idle);
  const [dragging, setDragging] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleHighlight = (highlightIndent: number | null) => {
    if (highlightIndent === null) return highlight(null);
    highlight({ indent: highlightIndent, index: item.index });
  };

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return combine(
      draggable({
        element: el,
        getInitialData() {
          return item;
        },
        onDragStart: () => {
          setState({ type: "is-dragging" });
          setDragging(true);
          setIsExpanded(item.isExpanded());
          item.collapse();
        },
        onDrop: () => {
          setState(idle);
          setDragging(false);
          isExpanded && item.expand();
        },
      }),
      dropTargetForElements({
        element: el,
        getData({ input, element }) {
          const boundingClientRect = element.getBoundingClientRect();
          const closestEdgeAndIndent = getClosestEdgeAndStep({
            height: boundingClientRect.height,
            deltaX: input.clientX - boundingClientRect.x,
            deltaY: input.clientY - boundingClientRect.y,
            indentThreshold: indentWidth,
            defaultIndent: item.indent,
            allowedSides: item.isFolder()
              ? item.isExpanded()
                ? [
                    "top",
                    "center",
                    ...(item.stepRange.bottom ? ["bottom" as const] : []),
                  ]
                : ["top", "center", "bottom"]
              : ["top", "bottom"],
            step: item.stepRange,
          });

          const hasStepRange = !!(
            closestEdgeAndIndent.edge &&
            closestEdgeAndIndent.edge !== "center" &&
            item.stepRange[closestEdgeAndIndent.edge]
          );

          const highlightedIndent =
            item.isFolder() && !hasStepRange ? null : closestEdgeAndIndent.step;

          return {
            item,
            highlightedIndent,
            hasStepRange,
            ...closestEdgeAndIndent,
          };
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self }) {
          const formattedSelf = self.data as {
            item: ItemInstance;
            highlightedIndent: number | null;
            edge: "top" | "bottom" | "center" | null;
            step: number;
          };

          handleHighlight(formattedSelf.highlightedIndent);
          setState({
            type: "is-dragging-over",
            closestEdge: formattedSelf.edge,
            step: formattedSelf.step,
          });
        },
        onDrag({ self }) {
          const formattedSelf = self.data as {
            item: ItemInstance;
            highlightedIndent: number | null;
            edge: "top" | "bottom" | "center" | null;
            step: number;
          };

          handleHighlight(formattedSelf.highlightedIndent);
          setState((current) => {
            if (
              isEqual(current, {
                type: "is-dragging-over",
                closestEdge: formattedSelf.edge,
                step: formattedSelf.step,
              })
            ) {
              return current;
            }
            return {
              type: "is-dragging-over",
              closestEdge: formattedSelf.edge,
              step: formattedSelf.step,
            };
          });
        },
        onDragLeave() {
          setState(idle);
          highlight(null);
        },
        onDrop({ self, source: { data } }) {
          setState(idle);
          const {
            item: dropTarget,
            edge,
            step,
          } = self.data as {
            item: ItemInstance;
            highlightedIndent: number | null;
            edge: "top" | "bottom" | "center" | null;
            step: number;
            hasStepRange: boolean;
          };

          place({
            source: data as ItemInstance,
            dropTarget,
            edge,
            step,
          });
          handleHighlight(null);
        },
      })
    );
  }, [item.isExpanded(), item.stepRange, highlightedItemId]);

  return {
    ref,
    state,
    dragging,
    isHighlighted: highlightedItemId === item.getId(),
  };
}
