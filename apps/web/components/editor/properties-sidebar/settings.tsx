"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  useBlurOnEnter,
  useBlurOnEnterTextarea,
} from "@/hooks/use-blur-on-enter";
import { useEditor } from "@/hooks/use-editor";
import { layers } from "@/hooks/use-editor/elements";
import { ColorSchema, ImageSchema } from "@/hooks/use-editor/properties";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef } from "react";
import {
  Control,
  FieldValues,
  Path,
  useController,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import {
  ColorIndicator,
  ColorPicker,
  ColorValueInput,
} from "./property-color-input";

const textSchema = z.object({
  key: z.literal("text"),
  value: z.string(),
});

const hrefSchema = z.object({
  key: z.literal("href"),
  value: z.string(),
});

const srcSchema = z.object({
  key: z.literal("src"),
  value: z.string(),
});

const altSchema = z.object({
  key: z.literal("alt"),
  value: z.string(),
});

const codeSchema = z.object({
  key: z.literal("code"),
  value: z.string(),
});

const settingsSchema = z.object({
  properties: z.array(
    z.discriminatedUnion("key", [
      textSchema,
      hrefSchema,
      srcSchema,
      altSchema,
      codeSchema,
    ])
  ),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;
type SettingsSChemaPropertiesKey = SettingsSchema["properties"][number]["key"];
type SettingsSChemaPropertiesValue =
  SettingsSchema["properties"][number]["value"];

export function Settings() {
  const updateElement = useEditor((state) => state.updateElement);
  const focusElement = useEditor((state) => state.focusElement);
  const elements = useEditor((state) => state.pages[0].body);
  const element = focusElement ? layers.find(elements, focusElement) : null;

  const values = element
    ? Object.entries(element)
        .map(([key, value]) => {
          if (
            key === "id" ||
            key === "name" ||
            key === "hasBeenEdited" ||
            key === "children" ||
            key === "style" ||
            key === "className" ||
            key === "type"
          )
            return null;
          return {
            key: key as SettingsSChemaPropertiesKey,
            value: value as SettingsSChemaPropertiesValue,
          };
        })
        .filter((i): i is NonNullable<typeof i> => i !== null)
    : [];

  const form = useForm<SettingsSchema>({
    resolver: zodResolver(settingsSchema),
    values: {
      properties: values,
    },
  });

  const onSubmit = (data: SettingsSchema) => {
    if (!focusElement) return;

    const { success, data: result, error } = settingsSchema.safeParse(data);

    if (success) {
      const obj = result?.properties.reduce(
        (acc, { key, value }) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<SettingsSChemaPropertiesKey, SettingsSChemaPropertiesValue>
      );

      updateElement(focusElement, { ...obj });
      return;
    }

    form.reset();
  };

  return (
    <div className="p-2 pb-3 border-t">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
          {form.watch("properties").map((property, index) => (
            <React.Fragment key={index}>
              {(property.key === "text" || property.key === "code") && (
                <SettingsTextarea
                  name={`properties.${index}.value`}
                  control={form.control}
                  label={property.key}
                />
              )}
              {(property.key === "href" || property.key === "alt") && (
                <SettingsInput
                  name={`properties.${index}.value`}
                  control={form.control}
                  label={property.key}
                />
              )}
              {property.key === "src" && (
                <SettingsSrcInput
                  name={`properties.${index}.value`}
                  control={form.control}
                  label={property.key}
                />
              )}
            </React.Fragment>
          ))}
        </form>
      </Form>
    </div>
  );
}

interface SettingsTextareaProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}

function SettingsTextarea<T extends FieldValues>({
  name,
  control,
  label,
  ...inputProps
}: SettingsTextareaProps<T>) {
  const { inputRef } = useBlurOnEnterTextarea();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = () => {
    buttonRef.current?.click();
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid gap-1">
          <FormLabel className="text-sm font-medium capitalize">
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={`Enter ${label}`}
              className="resize-none"
              {...field}
              ref={inputRef}
              onBlur={handleSubmit}
              value={field.value}
              {...inputProps}
            />
          </FormControl>
          <button ref={buttonRef} className="hidden" type="submit">
            save
          </button>
        </FormItem>
      )}
    />
  );
}

interface SettingsInputProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}

function SettingsInput<T extends FieldValues>({
  name,
  control,
  label,
  ...inputProps
}: SettingsInputProps<T>) {
  const { inputRef } = useBlurOnEnter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = () => {
    buttonRef.current?.click();
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid gap-1">
          <FormLabel className="text-sm font-medium capitalize">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={`Enter ${label}`}
              {...field}
              ref={inputRef}
              onBlur={handleSubmit}
              value={field.value}
              {...inputProps}
            />
          </FormControl>
          <button ref={buttonRef} className="hidden" type="submit">
            save
          </button>
        </FormItem>
      )}
    />
  );
}

interface SettingsSrcInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}

function SettingsSrcInput<T extends FieldValues>({
  name,
  control,
  label,
}: SettingsSrcInputProps<T>) {
  const { field } = useController({ control, name });
  const value: ImageSchema = {
    type: "image",
    value: field.value,
    objectFit: "cover",
  };

  function handleChange(color: ColorSchema | { type: "preset"; id: string }) {
    if (color.type !== "image") return;
    field.onChange(color.value);
    buttonRef.current?.click();
  }
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium capitalize">{label}</label>
      <ColorValueInput
        color={value}
        onChange={handleChange}
        className={cn("w-full")}
        leftElement={
          <Popover>
            <PopoverTrigger asChild>
              <ColorIndicator color={value} />
            </PopoverTrigger>
            <PopoverContent
              className="p-3 w-[268px]"
              side="left"
              sideOffset={16}
            >
              <ColorPicker data={value} onChange={handleChange} noOptions />
            </PopoverContent>
          </Popover>
        }
      />

      <button ref={buttonRef} className="hidden" type="submit">
        save
      </button>
      {/* <pre>{JSON.stringify(value, null, 2)}</pre> */}
    </div>
  );
}
