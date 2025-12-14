import { db } from "@/db";
import { Variable } from "@/db/types";

export async function getVariables() {
  return db.variables.toArray();
}

export async function getVariable(id: Variable["id"]) {
  return db.variables.get(id);
}

export async function getVariableBySlug(slug: Variable["slug"]) {
  return db.variables.where("slug").equals(slug).first();
}

export async function addVariable(variable: Omit<Variable, "id" | "slug">) {
  const id = crypto.randomUUID();
  const slug = variable.name.toLowerCase().replace(/ /g, "-");

  const existingVariable = await db.variables
    .where("slug")
    .equals(slug)
    .first();
  if (existingVariable) {
    throw new Error("Variable with this name already exists");
  }

  await db.variables.add({ ...variable, id, slug });
  return slug;
}

export async function updateVariable(
  id: Variable["id"],
  variable: Partial<Variable>
) {
  const existingVariable = await db.variables.get(id);
  if (!existingVariable) {
    throw new Error("Variable not found");
  }

  let slug = existingVariable.slug;

  if (variable.name && variable.name !== existingVariable.name) {
    const newSlug = variable.name.toLowerCase().replace(/ /g, "-");
    const existingSlug = await db.variables
      .where("slug")
      .equals(newSlug)
      .first();
    if (existingSlug && existingSlug.id !== id) {
      throw new Error("Variable with this name already exists");
    }
    slug = newSlug;
  }

  return db.variables.update(id, { ...variable, slug });
}

export async function deleteVariable(id: Variable["id"]) {
  return db.variables.delete(id);
}
