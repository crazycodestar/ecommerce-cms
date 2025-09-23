import { useEffect, useState } from "react";
import { useEditor } from "./use-editor";
import { ElementWithChildren, layers } from "./use-editor/elements";
import { Element } from "./use-editor/elements";

type Item = {
  name: string;
  children?: string[];
};

export type ItemInstance = {
  getId: () => string;
  getItemData: () => Item;
  getChildren: () => string[];
  isFolder: () => boolean;
  isExpanded: () => boolean;
  isFocused: () => boolean;
  expand: () => void;
  collapse: () => void;
  focus: () => void;
  indent: number;
};

interface TreeObj {
  rootId: Element["id"];
}

function FlatMap({
  element,
  expandedItems,
  indent,
  ...others
}: {
  element: ElementWithChildren;
  expandedItems: Element["id"][];
  indent?: number;
  focusElementId: Element["id"] | null;
  expand: (id: string) => void;
  collapse: (id: string) => void;
  focus: (id: string) => void;
}): ItemInstance[] {
  const items: ItemInstance[] = [];

  for (const child of element.children) {
    items.push({
      getId: () => child.id,
      getItemData: () => ({
        name: child.name,
      }),
      getChildren: () => child.children?.map((child) => child.id) ?? [],
      isFolder: () => !!child.children,
      isExpanded: () => expandedItems.includes(child.id),
      expand: () => others.expand(child.id),
      collapse: () => others.collapse(child.id),
      isFocused: () => child.id === others.focusElementId,
      focus: () => others.focus(child.id),
      indent: indent ?? 0,
    });
    if (expandedItems.includes(child.id))
      items.push(
        ...FlatMap({
          element: child as ElementWithChildren,
          expandedItems,
          indent: (indent ?? 0) + 1,
          ...others,
        })
      );
  }

  return items;
}

export const useTree = (tree: TreeObj) => {
  const pages = useEditor((state) => state.pages);
  const focusElement = useEditor((state) => state.focusElement);
  const setFocusElement = useEditor((state) => state.setFocusElement);
  const moveElement = useEditor((state) => state.moveElement);
  const historyIndex = useEditor((state) => state.historyIndex);

  const body = pages[0].body;

  const [expandedItems, setExpandedItems] = useState<
    ElementWithChildren["id"][]
  >([]);

  function setExpanded() {
    if (focusElement) {
      const path = layers.getPath(pages[0].body, focusElement);
      if (!path.length) return;

      // path.slice(1, -1) omits the focusElement
      setExpandedItems((init) => [...init, ...path.slice(1, -1)]);
    }
  }

  useEffect(() => {
    setExpanded();
  }, [focusElement]);

  const expand = (id: string) => {
    const el = layers.find(body, id);
    if (!el || !el.children) return;

    setExpandedItems((init) => [...init, id]);
  };
  const collapse = (collapseId: string) =>
    setExpandedItems((init) => init.filter((id) => id !== collapseId));
  const focus = (id: string) => setFocusElement(id);

  const [items, setItems] = useState<ItemInstance[]>([]);

  function getItems(id: string) {
    const el = layers.find(body, id);
    if (!el || !el.children) return [];

    return FlatMap({
      element: el as ElementWithChildren,
      expandedItems,
      focusElementId: focusElement,
      expand,
      collapse,
      focus,
    });
  }

  useEffect(() => {
    setItems(getItems(tree.rootId));
  }, [historyIndex, expandedItems, focusElement]);

  return {
    tree: {
      getItems: () => items,
      reorder: (...args: Parameters<typeof moveElement>) => {
        moveElement(...args);
        setExpanded();
      },
    },
  };
};
