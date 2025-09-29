import { z } from "zod";
import {
  colorValueSchema,
  conicGradientSchema,
  linearGradientSchema,
  radialGradientSchema,
} from "./shared";

const defaultType = "default" as const;

const variableTypeObj: Record<string, z.ZodLiteral<string>> = {
  color: z.literal("color"),
  number: z.literal("number"),
};

const baseVariableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
});

export const variableSchemas = {
  color: z.object({
    ...baseVariableSchema.shape,
    type: z.literal("color"),
    value: z.discriminatedUnion("type", [
      linearGradientSchema,
      radialGradientSchema,
      conicGradientSchema,
      colorValueSchema,
    ]),
  }),
};

export type VariableType = keyof typeof variableSchemas;
export type Variable = z.infer<(typeof variableSchemas)[VariableType]>;

type baseVariableSchemaWithType = z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodLiteral<string>;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    name: string;
    type: string;
  },
  {
    id: string;
    name: string;
    type: string;
  }
>;

export type SchemaWithVariableType<T> = z.ZodDiscriminatedUnion<
  "type",
  [
    z.ZodObject<
      { type: z.ZodLiteral<"default">; value: z.ZodType<T, z.ZodTypeDef, any> },
      "strip",
      z.ZodTypeAny,
      { type: "default"; value?: T },
      { type: "default"; value?: T }
    >,
    z.ZodObject<
      { type: z.ZodLiteral<"variable">; id: z.ZodString },
      "strip",
      z.ZodTypeAny,
      { type: "variable"; id: string },
      { type: "variable"; id: string }
    >,
  ]
>;

export const vars = {
  createSchemaWithVariableType: <T>(
    variableType: VariableType,
    value: z.ZodType<T>
  ): SchemaWithVariableType<T> => {
    return z.discriminatedUnion("type", [
      z.object({
        type: z.literal("default"),
        value,
      }),
      z.object({
        type: z.literal("variable"),
        id: z.string(),
      }),
    ]);
  },

  getVariable: <T>(
    value: z.infer<SchemaWithVariableType<T>> & { type: "variable" },
    variables: Variable[]
  ) => {
    return variables.find((v) => v.id === value.id);
  },
};
