import { db } from "@/db";
import { Component } from "@/db/types";
import { getSlot, createSlot, updateSlot } from "@/db/resource/slots";
import { getComponentRootSlot, getComponent } from "@/db/resource/components";
import { updateState } from "../resource/states";

async function createComponent(slotId: string) {
  // Get the slot by id
  const slot = await getSlot(slotId);

  if (!slot) {
    throw new Error(`Slot with id ${slotId} not found`);
  }

  // Create a component with the slot's name
  const componentId = crypto.randomUUID();
  const component: Component = {
    id: componentId,
    name: slot.name,
    rootId: slot.id,
  };

  await db.components.add(component);
  await updateSlot(slotId, { root: componentId });

  const instanceId = crypto.randomUUID();
  await createSlot({
    element: {
      ...slot,
      id: instanceId,
      type: "instance",
      data: {
        componentId,
      },
      canHaveChildren: false,
    },
  });

  return component;
}

export const comp = {
  createComponent,
  getComponent,
  getComponentRootSlot,
};
