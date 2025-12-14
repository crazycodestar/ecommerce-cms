import Dexie, { type EntityTable } from "dexie";
import {
  Slot,
  Variable,
  Style,
  StyleOnElement,
  State,
  Component,
} from "./types";

const db = new Dexie("site") as Dexie & {
  slots: EntityTable<Slot, "id">;
  variables: EntityTable<Variable, "id">;
  components: EntityTable<Component, "id">;
  styles: EntityTable<Style, "id">;
  stylesOnElements: EntityTable<StyleOnElement, "id">;
  states: EntityTable<State, "id">;
};

db.version(1).stores({
  slots:
    "id, parentId, element, orderKey, name, slot, root, type, canHaveChildren, data",
  variables: "id, name, slug, type, value",
  components: "id, name, rootId",
  styles: "id, properties",
  stylesOnElements: "id, styleId, slotId, type",
  states: "id, key, value",
});

export { db };
