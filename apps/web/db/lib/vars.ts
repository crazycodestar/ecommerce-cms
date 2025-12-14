import {
  addVariable,
  deleteVariable,
  getVariable,
  getVariableBySlug,
  getVariables,
  updateVariable,
} from "@/db/resource/variables";
import { Variable } from "@/db/types";

async function list() {
  return getVariables();
}

async function get(id: Variable["id"]) {
  return getVariable(id);
}

async function getBySlug(slug: Variable["slug"]) {
  return getVariableBySlug(slug);
}

async function create(variable: Omit<Variable, "id" | "slug">) {
  return addVariable(variable);
}

async function update(id: Variable["id"], variable: Partial<Variable>) {
  return updateVariable(id, variable);
}

async function remove(id: Variable["id"]) {
  return deleteVariable(id);
}

export const vars = {
  list,
  get,
  getBySlug,
  create,
  update,
  remove,
};
