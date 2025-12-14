import { State, useEditor } from "@/context/editor";
import { properties } from "@/db/lib/styles";
import { Style, StyleOnElement } from "@/db/types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Slot } from "@/db/types";
import { style, StyleSchema } from "@/db/types/style";
import { omit } from "es-toolkit";
import { defaultStyle } from "@/db/compiler/default";

interface StyleContextType {
  getValue: <T extends keyof StyleSchema>(property: T) => StyleSchema[T];
  getPreviousValue: <T extends keyof StyleSchema>(
    property: T
  ) => StyleSchema[T] | undefined;
  setValue: (
    values: Partial<StyleSchema>,
    callback?: (res: { error?: string }) => void
  ) => void;
  resetValue: <T extends keyof StyleSchema>(property: T) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error("useStyle must be used within a StyleProvider");
  }
  return context;
};

const styleKeyMapping: Record<
  Exclude<StyleOnElement["type"], "default">,
  StyleOnElement["type"]
> = {
  "breakpoint.md": "default",
  "breakpoint.sm": "breakpoint.md",
  "attribute.hover": "default",
  "attribute.active": "default",
};

export const StyleProvider = ({
  children,
  styleKey,
}: {
  children: ReactNode;
  styleKey: StyleOnElement["type"];
}) => {
  const { focusElementId } = useEditor();
  const styleObject = useLiveQuery(async () => {
    if (!focusElementId) return;
    return properties.getStyleObject(focusElementId);
  }, [focusElementId]);

  function getValue<T extends keyof StyleSchema>(property: T): StyleSchema[T] {
    const styles = styleObject && styleObject[styleKey]?.properties;
    return styles?.[property] ?? defaultStyle[property];
  }

  function getPreviousValue<T extends keyof StyleSchema>(
    property: T,
    activeStyleKey: StyleOnElement["type"] = styleKey
  ): StyleSchema[T] | undefined {
    if (activeStyleKey === "default") return undefined;

    const previousStyleKey = styleKeyMapping[activeStyleKey];
    const previousStyle =
      styleObject && styleObject[previousStyleKey]?.properties;
    const res = previousStyle?.[property];

    if (res === undefined) return getPreviousValue(property, previousStyleKey);
    return res;
  }

  async function setValue(
    values: Partial<StyleSchema>,
    callback?: (res: { error?: string }) => void
  ) {
    if (!focusElementId) return;

    // validation
    const result = style.partial().safeParse(values);
    if (!result.success) return callback?.({ error: "VALIDATION_ERROR" });

    const styleObject = await properties.getStyleObject(focusElementId);
    const activeStyleId = styleObject[styleKey].id;

    const styleProperties = Object.entries({
      ...styleObject[styleKey].properties,
      ...result.data,
    }).reduce((acc, curr) => {
      const [key, value] = curr;
      const previousValue = getPreviousValue(
        key as keyof StyleSchema,
        styleKey
      );
      const defaultValue = defaultStyle[key as keyof StyleSchema];

      if (value === undefined) return acc;
      if (value === (previousValue ?? defaultValue)) return acc;

      // @ts-expect-error key mapping poorly implemented
      acc[key as keyof StyleSchema] = value;
      return acc;
    }, {} as Partial<StyleSchema>);

    if (!activeStyleId)
      return properties.createStyle(focusElementId, styleKey, styleProperties);

    await properties.updateStyle(activeStyleId, styleProperties);
  }

  function resetValue<T extends keyof StyleSchema>(property: T) {
    const previousValue = getPreviousValue(property);
    if (previousValue === undefined) return;
    setValue({ [property]: previousValue });
  }

  return (
    <StyleContext.Provider
      value={{ getValue, getPreviousValue, setValue, resetValue }}
    >
      {children}
    </StyleContext.Provider>
  );
};

function isInputEvent(
  event: any
): event is React.ChangeEvent<HTMLInputElement> {
  return (
    typeof event === "object" &&
    event !== null &&
    "target" in event &&
    "value" in event.target
  );
}

export const useStyleField = <T extends keyof StyleSchema>({
  property,
}: {
  property: T;
}) => {
  const { getValue, getPreviousValue, setValue, resetValue } = useStyle();

  const [localValue, setLocalValue] = useState<StyleSchema[T]>(
    getValue(property)
  );
  const previousValue = getPreviousValue(property);
  const defaultValue = defaultStyle[property];

  useEffect(() => {
    setLocalValue(getValue(property));
  }, [getValue(property)]);

  function handleChange(value: any) {
    if (isInputEvent(value))
      return setLocalValue(value.target.value as StyleSchema[T]);
    setLocalValue(value as StyleSchema[T]);
  }

  function handleSetValue(arg: StyleSchema[T]) {
    if (arg === "") return setLocalValue(getValue(property));

    setValue({ [property]: arg }, (res) => {
      if (res?.error && res.error === "VALIDATION_ERROR")
        setLocalValue(getValue(property));
    });
  }

  return {
    field: {
      value: localValue as string,
      onChange: handleChange,
      onBlur: () => localValue !== undefined && handleSetValue(localValue),
    },
    previousValue,
    defaultValue,
    reset: () => resetValue(property),
    setValue: handleSetValue,
  };
};
