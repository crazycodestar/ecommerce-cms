import { StyleObject } from "./properties";

// First, define the base element types
export type BaseElement = {
  id: string;
  name: string;
  hasBeenEdited?: boolean;
  style?: StyleObject;
};

export type BodyElement = BaseElement & {
  type: "body";
  children: Element[];
};

export type SectionElement = BaseElement & {
  type: "section";
  children: Element[];
};

export type TextElement = BaseElement & {
  type: "text";
  text: string;
  children?: undefined;
};

export type ImageElement = BaseElement & {
  type: "image";
  src: string;
  alt?: string;
  children?: undefined;
};

export type ContainerElement = BaseElement & {
  type: "container";
  children: Element[];
};

export type LinkElement = BaseElement & {
  type: "link";
  href: string;
  text: string;
  children?: undefined;
};

export type LinkBlockElement = BaseElement & {
  type: "linkBlock";
  href: string;
  children: Element[];
};

export type CodeEmbedElement = BaseElement & {
  type: "codeEmbed";
  code: string;
  children?: undefined;
};

// Union type of all possible elements
export type Element =
  | BodyElement
  | SectionElement
  | TextElement
  | ImageElement
  | ContainerElement
  | LinkElement
  | LinkBlockElement
  | CodeEmbedElement;

export type ElementWithChildren = Element & { children: Element[] };

// Factory object with proper typing
export const Element = {
  body: {
    id: "",
    name: "Body",
    type: "body" as const,
    children: [],
  },
  section: {
    id: "",
    name: "Section",
    type: "section" as const,
    children: [],
  },
  text: {
    id: "",
    name: "Text",
    type: "text" as const,
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
  },
  image: {
    id: "",
    name: "Image",
    type: "image" as const,
    src: "",
    alt: "",
  },
  container: {
    id: "",
    name: "Container",
    type: "container" as const,
    children: [],
  },
  link: {
    id: "",
    name: "Link",
    type: "link" as const,
    href: "/",
    text: "Link",
  },
  linkBlock: {
    id: "",
    name: "Link Block",
    type: "linkBlock" as const,
    href: "/",
    children: [],
  },
  codeEmbed: {
    id: "",
    name: "Code Embed",
    type: "codeEmbed" as const,
    code: "",
  },
} satisfies Record<Element["type"], Element>;

export type ElementType = (typeof Element)[keyof typeof Element]["type"];

export function canHaveChildren(element: Element) {
  return !!element.children;
}

export type Page = {
  id: string;
  name: string;
  body: BodyElement;
};

export function getDefaultElement(
  element: Element["type"]
): Omit<Element, "hasBeenEdited" | "id"> {
  return Element[element as keyof typeof Element];
}

export type Pages = [Page & { id: "home" }, ...Page[]];

export const layers = {
  add: (
    root: Element & { children: Element[] },
    parentId: string,
    newItem: Element
  ): Element & { children: Element[] } => {
    if (root.id === parentId) {
      return {
        ...root,
        children: [...root.children, newItem],
      };
    }

    const children = root.children.map((item) => {
      if (item.id === parentId && item.children) {
        return {
          ...item,
          children: [...item.children, newItem],
        };
      }
      if (layers.hasChildren(item)) {
        return {
          ...item,
          children: layers.add(item, parentId, newItem).children,
        };
      }
      return item;
    }) as Element[];

    return {
      ...root,
      children,
    };
  },
  insert(
    pos: "before" | "after" | "start" | "end",
    root: Element & { children: Element[] },
    parentOrSiblingId: string,
    newItem: Element
  ): Element & { children: Element[] } {
    if (root.id === parentOrSiblingId) {
      return {
        ...root,
        children: [...root.children, newItem],
      };
    }

    const children = root.children.flatMap((item) => {
      if (!!item.children) {
        if (item.id === parentOrSiblingId && pos === "start") {
          return {
            ...item,
            children: [newItem, ...item.children],
          };
        }

        if (item.id === parentOrSiblingId && pos === "end") {
          return {
            ...item,
            children: [...item.children, newItem],
          };
        }
      }

      if (item.id === parentOrSiblingId && pos === "before") {
        return [newItem, item];
      }

      if (item.id === parentOrSiblingId && pos === "after") {
        return [item, newItem];
      }

      if (layers.hasChildren(item)) {
        return {
          ...item,
          children: layers.insert(pos, item, parentOrSiblingId, newItem)
            .children,
        };
      }
      return item;
    }) as Element[];

    return {
      ...root,
      children,
    };
  },
  update: (
    root: Element & { children: Element[] },
    id: string,
    element: Partial<Element>
  ): Element & { children: Element[] } => {
    if (root.id === id)
      return { ...root, ...element, hasBeenEdited: true } as Element & {
        children: Element[];
      };

    const children = root.children.map((item) => {
      if (item.id === id) return { ...item, ...element, hasBeenEdited: true };
      if (layers.hasChildren(item)) {
        return {
          ...item,
          children: layers.update(item, id, element).children,
        };
      }
      return item;
    }) as Element[];

    return {
      ...root,
      children,
    };
  },
  delete: (
    root: Element & { children: Element[] },
    id: string
  ): Element & { children: Element[] } => {
    if (root.id === id) return { ...root, children: [] };

    const children = root.children
      .map((item) => {
        if (item.id === id) return null;
        if (layers.hasChildren(item)) {
          return { ...item, children: layers.delete(item, id).children };
        }
        return item;
      })
      .filter((item) => item !== null) as Element[];

    return {
      ...root,
      children,
    };
  },
  reorder: (
    root: Element & { children: Element[] },
    newChildrenIds: Element["id"][]
  ): Element[] => {
    return newChildrenIds.map((id) => layers.find(root, id)!);
  },
  // utilities
  newItem: (type: Element["type"]): Element => {
    return {
      ...getDefaultElement(type),
      hasBeenEdited: false,
      id: crypto.randomUUID(),
    } as Element;
  },
  find: (
    root: Element & { children: Element[] },
    id: string
  ): Element | undefined => {
    if (root.id === id) return root;
    for (const element of root.children) {
      if (element.id === id) return element;
      if (layers.hasChildren(element)) {
        const found = layers.find(element, id);
        if (found) return found;
      }
    }
  },
  hasChildren: (data: Element): data is Element & { children: Element[] } => {
    if (!data.children) return false;
    return data.children.length > 0;
  },
  findParentOrSiblingId: (
    root: Element & { children: Element[] },
    id: string
  ):
    | { id: string; instruction: "before" | "after" | undefined }
    | undefined => {
    const parentId = root.id;
    const index = root.children.findIndex((child) => child.id === id);

    if (index !== -1) {
      if (root.children.length === 1)
        return { id: parentId, instruction: undefined };
      const previousChild = root.children[index - 1];
      if (previousChild) return { id: previousChild.id, instruction: "before" };
      else return { id: root.children[index + 1].id, instruction: "after" };
    }

    for (const child of root.children) {
      if (!layers.hasChildren(child)) continue;

      const found = layers.findParentOrSiblingId(child, id);
      if (found) return found;
    }

    return undefined;
  },
  getPath: (data: Element, id: Element["id"]): Element["id"][] => {
    if (data.id === id) return [data.id];
    if (!layers.hasChildren(data)) return [];

    for (const child of data.children) {
      const path = layers.getPath(child, id);
      if (path.length > 0) return [data.id, ...path];
    }

    return [];
  },
};
