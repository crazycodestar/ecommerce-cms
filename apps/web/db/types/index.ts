import { JSX } from "react";
import { z } from "zod";
import { StyleSchema } from "./style";
import {
  colorValueSchema,
  conicGradientSchema,
  linearGradientSchema,
  radialGradientSchema,
} from "@/db/types/style";

export type BaseElement = {
  name: string;
  slot: keyof JSX.IntrinsicElements;
  type:
    | "body"
    | "section"
    | "text"
    | "image"
    | "container"
    | "link"
    | "linkBlock"
    | "codeEmbed"
    | "instance";
  canHaveChildren: boolean;
  data?: Record<string, any>;
};

export type BodyElement = BaseElement & {
  type: "body";
  canHaveChildren: true;
};

export type SectionElement = BaseElement & {
  type: "section";
  canHaveChildren: true;
};

export type TextElement = BaseElement & {
  type: "text";
  canHaveChildren: false;
  data: {
    text: string;
  };
};

export type ImageElement = BaseElement & {
  type: "image";
  canHaveChildren: false;
  data: {
    src: string;
    alt?: string;
  };
};

export type ContainerElement = BaseElement & {
  type: "container";
  canHaveChildren: true;
};

export type LinkElement = BaseElement & {
  type: "link";
  canHaveChildren: false;
  data: {
    href: string;
    text: string;
  };
};

export type LinkBlockElement = BaseElement & {
  type: "linkBlock";
  canHaveChildren: true;
  data: {
    href: string;
  };
};

export type CodeEmbedElement = BaseElement & {
  type: "codeEmbed";
  canHaveChildren: false;
  data: {
    code: string;
  };
};

export type InstanceElement = BaseElement & {
  type: "instance";
  canHaveChildren: false;
  data: {
    componentId: string;
  };
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
  | CodeEmbedElement
  | InstanceElement;

export interface Slot extends BaseElement {
  id: string;
  orderKey: string;
  parentId?: string;
  root?: string;
}

export interface Component {
  id: string;
  name: string;
  rootId: string;
}

export const colorVariableSchema = z.object({
  type: z.literal("color"),
  value: z.discriminatedUnion("type", [
    linearGradientSchema,
    radialGradientSchema,
    conicGradientSchema,
    colorValueSchema,
  ]),
});

const variableSchemas = z.discriminatedUnion("type", [colorVariableSchema]);

export type VariableSchema = z.infer<typeof variableSchemas>;

export interface Variable extends VariableSchema {
  id: string;
  name: string;
  slug: string;
}

export interface Style {
  id: string;
  properties: Partial<StyleSchema>;
}

const styleOnElementTypes = [
  "default",
  "breakpoint.md",
  "breakpoint.sm",
  "attribute.hover",
  "attribute.active",
] as const;
export type StyleOnElementType = (typeof styleOnElementTypes)[number];
export interface StyleOnElement {
  id: string;
  styleId: string;
  slotId: string;
  type: StyleOnElementType;
}

export interface State {
  id: string;
  key: string;
  value?: string;
}
