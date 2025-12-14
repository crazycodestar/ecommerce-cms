import { db } from "@/db";
import { getSlot } from "./slots";

export async function getComponent(id: string) {
  return await db.components.where("id").equals(id).first();
}

export async function getComponenetByRootId(rootId: string) {
  return db.components.where("rootId").equals(rootId).first();
}

export async function getComponentRootSlot(componentId: string) {
  const component = await getComponent(componentId);

  if (!component) {
    throw new Error(`Component with id ${componentId} not found`);
  }

  const element = await getSlot(component.rootId);

  if (!element) {
    throw new Error(
      `Element with rootId ${component.rootId} not found for component ${componentId}`
    );
  }

  return element;
}
