import { ClassName, StyleSchema } from "./properties";

// First, define the base element types
export type BaseElement = {
  id: string;
  name: string;
  hasBeenEdited?: boolean;
  className?: ClassName[];
  style?: StyleSchema;
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
};

export type ImageElement = BaseElement & {
  type: "image";
  src: string;
  alt?: string;
};

export type ContainerElement = BaseElement & {
  type: "container";
  children: Element[];
};

export type LinkElement = BaseElement & {
  type: "link";
  href: string;
  text: string;
};

export type LinkBlockElement = BaseElement & {
  type: "linkBlock";
  href: string;
  children: Element[];
};

export type CodeEmbedElement = BaseElement & {
  type: "codeEmbed";
  code: string;
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
    src: "/placeholder.svg",
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

export type Page = {
  id: string;
  name: string;
  elements: Element[];
};

export function getDefaultElement(
  element: Element["type"]
): Omit<Element, "hasBeenEdited" | "id"> {
  return Element[element as keyof typeof Element];
}

export type Pages = [Page & { id: "home" }, ...Page[]];

export const layers = {
  add: (
    data: Element[],
    parentId: string,
    newItemType: Element["type"]
  ): Element[] => {
    const newItem = layers.newItem(newItemType);
    return data.map((item) => {
      if (item.id === parentId && "children" in item) {
        return {
          ...item,
          children: [...item.children, newItem],
        };
      }
      if (layers.hasChildren(item)) {
        return {
          ...item,
          children: layers.add(item.children, parentId, newItemType),
        };
      }
      return item;
    });
  },
  insert(
    pos: "before" | "after",
    data: Element[],
    siblingId: string,
    newItemType: Element["type"]
  ): Element[] {
    return data.flatMap((item) => {
      if (item.id === siblingId) {
        const newItem = layers.newItem(newItemType);
        return pos === "before" ? [newItem, item] : [item, newItem];
      }
      if (layers.hasChildren(item)) {
        return {
          ...item,
          children: layers.insert(pos, item.children, siblingId, newItemType),
        };
      }
      return item;
    });
  },
  update: (
    data: Element[],
    id: string,
    element: Partial<Element>
  ): Element[] => {
    return data.map((item) => {
      if (item.id === id) return { ...item, ...element, hasBeenEdited: true };
      if (layers.hasChildren(item)) {
        return {
          ...item,
          children: layers.update(item.children, id, element),
        };
      }
      return item;
    }) as Element[];
  },
  // utilities
  newItem: (type: Element["type"]): Element => {
    return {
      ...getDefaultElement(type),
      hasBeenEdited: false,
      id: crypto.randomUUID(),
    } as Element;
  },
  find: (data: Element[], id: string): Element | undefined => {
    for (const element of data) {
      if (element.id === id) return element;
      if (layers.hasChildren(element)) {
        const found = layers.find(element.children, id);
        if (found) return found;
      }
    }
  },
  hasChildren: (data: Element): data is Element & { children: Element[] } => {
    if (!("children" in data)) return false;
    return data.children.length > 0;
  },
};
