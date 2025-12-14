import { db } from "@/db";
import { State } from "@/db/types";

export async function getStates() {
  return db.states.toArray();
}

export async function addState(state: Omit<State, "id">) {
  return db.states.add({
    ...state,
    id: crypto.randomUUID(),
  });
}

export async function updateState({
  key,
  value,
}: Pick<State, "key" | "value">) {
  const state = await db.states.where("key").equals(key).first();
  if (!state) return addState({ key, value });

  return db.states.update(state.id, { value });
}
