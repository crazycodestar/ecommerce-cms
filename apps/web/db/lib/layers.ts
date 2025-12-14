import { BaseElement, Element, Slot } from "@/db/types";
import { compareFractionalKeys } from "@/lib/compareFractionalKeys";
import { generateKeyBetween } from "fractional-indexing";
import { createSlot, getSlot, getSlots, updateSlot } from "../resource/slots";
import { getComponenetByRootId, getComponent } from "../resource/components";

// Factory object with proper typing
export const elementDefaultValues = {
  body: {
    name: "Body",
    slot: "div",
    type: "body" as const,
    canHaveChildren: true,
  },
  section: {
    name: "Section",
    slot: "section",
    type: "section" as const,
    canHaveChildren: true,
  },
  text: {
    name: "Text",
    slot: "p",
    type: "text" as const,
    canHaveChildren: false,
    data: {
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    },
  },
  image: {
    name: "Image",
    slot: "img",
    type: "image" as const,
    canHaveChildren: false,
    data: {
      src: "",
      alt: "",
    },
  },
  container: {
    name: "Container",
    slot: "div",
    type: "container" as const,
    canHaveChildren: true,
  },
  link: {
    name: "Link",
    slot: "a",
    type: "link" as const,
    canHaveChildren: false,
    data: {
      href: "/",
      text: "Link",
    },
  },
  linkBlock: {
    name: "Link Block",
    slot: "a",
    type: "linkBlock" as const,
    canHaveChildren: true,
    data: {
      href: "/",
    },
  },
  codeEmbed: {
    name: "Code Embed",
    slot: "div",
    type: "codeEmbed" as const,
    canHaveChildren: false,
    data: {
      code: "",
    },
  },
} satisfies Omit<Record<Element["type"], Element>, "instance">;

export type SlotType =
  (typeof elementDefaultValues)[keyof typeof elementDefaultValues]["slot"];

export function getDefaultElement(element: Element["type"]): BaseElement {
  return elementDefaultValues[element as keyof typeof elementDefaultValues];
}

export type Instruction =
  | {
      position: "before";
      siblingId: string;
    }
  | {
      position: "after";
      siblingId: string;
    }
  | {
      position: "between";
      siblingId1: string;
      siblingId2: string;
    }
  | {
      position: "insert";
    };

export type OnInsertElementParams = {
  instruction: Instruction;
  type: Slot["type"];
  parentId: string;
};

const insertElement = async ({
  instruction,
  type,
  parentId,
}: OnInsertElementParams) => {
  const slots = await getSlots({});

  const validSlots = slots?.filter((slot) => slot.parentId === parentId);
  const lastSlot = validSlots?.sort((a, b) =>
    compareFractionalKeys(a.orderKey, b.orderKey)
  )[validSlots.length - 1];
  const newItem = layers.getDefaultElement(type);

  const parmasWithoutOrderKey: Omit<Slot, "orderKey"> = {
    ...newItem,
    id: crypto.randomUUID(),
    // element: newItem,
    parentId: parentId,
  };

  switch (instruction.position) {
    case "before":
      const siblingSlotBefore = validSlots?.find(
        (slot) => slot.id === instruction.siblingId
      );
      if (!siblingSlotBefore) return;

      await createSlot({
        element: {
          ...parmasWithoutOrderKey,
          orderKey: generateKeyBetween(null, siblingSlotBefore.orderKey),
        },
      });
      break;
    case "after":
      const siblingSlotAfter = validSlots?.find(
        (slot) => slot.id === instruction.siblingId
      );
      if (!siblingSlotAfter) return;

      await createSlot({
        element: {
          ...parmasWithoutOrderKey,
          orderKey: generateKeyBetween(siblingSlotAfter.orderKey, null),
        },
      });
      break;
    case "between":
      const siblingSlot1 = validSlots?.find(
        (slot) => slot.id === instruction.siblingId1
      );
      const siblingSlot2 = validSlots?.find(
        (slot) => slot.id === instruction.siblingId2
      );
      if (!siblingSlot1 || !siblingSlot2) return;

      await createSlot({
        element: {
          ...parmasWithoutOrderKey,
          orderKey: generateKeyBetween(
            siblingSlot1.orderKey,
            siblingSlot2.orderKey
          ),
        },
      });
      break;
    case "insert":
      await createSlot({
        element: {
          ...parmasWithoutOrderKey,
          orderKey: generateKeyBetween(lastSlot?.orderKey ?? null, null),
        },
      });
      break;
  }
};

export type MoveElementParams = {
  instruction: Instruction;
  elementId: string;
  parentId: string;
};

const moveElement = async ({
  instruction,
  elementId,
  parentId,
}: MoveElementParams) => {
  const slots = await getSlots({});

  const validSlots = slots?.filter((slot) => slot.parentId === parentId);
  const lastSlot = validSlots?.sort((a, b) =>
    compareFractionalKeys(a.orderKey, b.orderKey)
  )[validSlots.length - 1];

  function getPreviousSlotOrderKey(id: string) {
    const index = validSlots?.findIndex((slot) => slot.id === id);
    if (index === 0) return null;
    return validSlots?.[index - 1]?.orderKey;
  }
  function getNextSlotOrderKey(id: string) {
    const index = validSlots?.findIndex((slot) => slot.id === id);
    if (index === validSlots?.length - 1) return null;
    return validSlots?.[index + 1]?.orderKey;
  }

  switch (instruction.position) {
    case "before":
      const siblingSlotBefore = validSlots?.find(
        (slot) => slot.id === instruction.siblingId
      );
      if (!siblingSlotBefore) return;

      const previousSlotOrderKey = getPreviousSlotOrderKey(
        instruction.siblingId
      );
      await updateSlot(elementId, {
        parentId,
        orderKey: generateKeyBetween(
          previousSlotOrderKey,
          siblingSlotBefore.orderKey
        ),
      });
      break;
    case "after":
      const siblingSlotAfter = validSlots?.find(
        (slot) => slot.id === instruction.siblingId
      );
      if (!siblingSlotAfter) return;

      const nextSlotOrderKey = getNextSlotOrderKey(instruction.siblingId);
      await updateSlot(elementId, {
        parentId,
        orderKey: generateKeyBetween(
          siblingSlotAfter.orderKey,
          nextSlotOrderKey
        ),
      });
      break;
    case "between":
      const siblingSlot1 = validSlots?.find(
        (slot) => slot.id === instruction.siblingId1
      );
      const siblingSlot2 = validSlots?.find(
        (slot) => slot.id === instruction.siblingId2
      );
      if (!siblingSlot1 || !siblingSlot2) return;

      await updateSlot(elementId, {
        parentId,
        orderKey: generateKeyBetween(
          siblingSlot1.orderKey,
          siblingSlot2.orderKey
        ),
      });
      break;
    case "insert":
      await updateSlot(elementId, {
        parentId,
        orderKey: generateKeyBetween(lastSlot?.orderKey ?? null, null),
      });
      break;
  }
};

async function isComponentElement(elementId: string) {
  const component = await getComponenetByRootId(elementId);
  if (component) return true;

  const element = await getSlot(elementId);
  if (!element) return false;

  if (element.parentId) return isComponentElement(element.parentId);
  return false;
}

export const layers = {
  getSlot,
  insertElement,
  moveElement,
  getDefaultElement,
  isComponentElement,
  asChildrenAsText: (
    element: Slot
  ): element is Slot & { data: { text: string } } => {
    return element.type === "text" || element.type === "link";
  },
  canHaveChildren: (
    element: Slot
  ): element is Slot & { canHaveChildren: true } => {
    return element.canHaveChildren;
  },
  assertIsBodySlot: (element: Slot): element is Slot & { type: "body" } => {
    return element.type === "body";
  },
  assertHasHref: (
    element: Slot
  ): element is Slot & { data: { href: string } } => {
    return element.type === "link" || element.type === "linkBlock";
  },
};
