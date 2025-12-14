import { db } from "@/db";
import { BaseElement, Slot } from "@/db/types";
import { compareFractionalKeys } from "@/lib/compareFractionalKeys";
import { generateKeyBetween } from "fractional-indexing";

export async function addSlot<T extends BaseElement>({
  id,
  element,
  parentId,
  root,
}: {
  id: string;
  element: T;
  parentId?: string;
  root?: string;
}) {
  const slotsInParent = await db.slots
    .filter((slot) => {
      if (parentId) {
        return slot.parentId === parentId && slot.root === root;
      }
      return slot.root === root;
    })
    .toArray();

  const lastSlot = slotsInParent.sort((a, b) =>
    compareFractionalKeys(a.orderKey, b.orderKey)
  )[slotsInParent.length - 1];
  const orderKey = generateKeyBetween(lastSlot?.orderKey ?? null, null);

  const newSlot: Slot = {
    ...element,
    parentId,
    id,
    orderKey,
    root,
  };

  const res = await db.slots.add(newSlot);
  return res;
}

export async function createSlot({ element }: { element: Slot }) {
  return db.slots.add(element);
}

export async function getSlots({
  root,
  parentId,
}: {
  root?: string;
  parentId?: string;
}) {
  let slots = await db.slots.filter((slot) => slot.root === root).toArray();

  if (parentId) {
    slots = slots.filter((slot) => slot.parentId === parentId);
  }

  return slots.sort((a, b) => compareFractionalKeys(a.orderKey, b.orderKey));
}

export async function getSlot(id: string) {
  return await db.slots.where("id").equals(id).first();
}

export function updateSlot(id: string, slot: Partial<Slot>) {
  return db.slots.where("id").equals(id).modify(slot);
}
