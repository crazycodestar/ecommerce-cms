import { Form } from "@/components/ui/form";
import { useEditor } from "@/hooks/use-editor";
import { layers } from "@/hooks/use-editor/elements";
import {
  getStyleValues,
  getStyleValuesBase,
  StyleKey,
  styleSchema,
  StyleSchema,
  updateStyleValues,
} from "@/hooks/use-editor/properties";
import { createContext, ReactNode, useContext } from "react";
import { Path, PathValue, useForm, UseFormReturn } from "react-hook-form";
interface StyleContextType {
  form: UseFormReturn<StyleSchema>;
  onSubmit: (data: StyleSchema) => void;
  handleSetValue: <T extends Path<StyleSchema>>(
    name: T,
    value: PathValue<StyleSchema, T>
  ) => void;
  baseForm: UseFormReturn<StyleSchema>;
  styleKey: StyleKey;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error("useStyle must be used within a StyleProvider");
  }
  return context;
};

export const StyleProvider = ({
  children,
  styleKey,
}: {
  children: ReactNode;
  styleKey: StyleKey;
}) => {
  const body = useEditor((state) => state.pages[0].body);
  const focusElement = useEditor((state) => state.focusElement);
  const updateElement = useEditor((state) => state.updateElement);

  const el = focusElement ? layers.find(body, focusElement) : null;
  if (!el) return;

  const initialValues = el.style ?? {
    default: {},
    breakpoints: {
      md: {},
      sm: {},
    },
    attributes: {
      hover: {},
      active: {},
    },
  };

  const baseValues = getStyleValuesBase({
    values: initialValues,
    styleKey,
    type: el.type,
  });
  const values = getStyleValues({
    values: initialValues,
    styleKey,
    type: el.type,
  });

  // console.log("--------------------------------");
  // console.log("styleKey", styleKey);
  // console.log("el.type", el.type);
  // console.log("initialValues", initialValues);
  // console.log("baseValues", baseValues);
  // console.log("values", values);
  // console.log("--------------------------------");

  const baseForm = useForm<StyleSchema>({
    values: baseValues,
  });

  const form = useForm<StyleSchema>({
    values,
  });

  const onSubmit = (data: StyleSchema) => {
    if (!focusElement) return;

    const { success, data: result, error } = styleSchema.safeParse(data);
    if (success) {
      const style = updateStyleValues({
        initialValues,
        updatedValues: result,
        dirtyFields: form.formState.dirtyFields,
        styleKey,
        type: el.type,
      });
      return updateElement(focusElement, { style });
    }

    form.reset();
  };

  function handleSetValue<T extends Path<StyleSchema>>(
    name: T,
    value: PathValue<StyleSchema, T>
  ) {
    form.setValue(name, value, { shouldDirty: true });
    form.handleSubmit(onSubmit)();
  }

  return (
    <StyleContext.Provider
      value={{ form, onSubmit, handleSetValue, baseForm, styleKey }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
      </Form>
    </StyleContext.Provider>
  );
};
