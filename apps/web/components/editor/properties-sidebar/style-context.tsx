import { createContext, useContext, ReactNode } from "react";
import {
  getDefaultValues,
  styleSchema,
  StyleSchema,
} from "@/hooks/use-editor/properties";
import { Path, PathValue, useForm, UseFormReturn } from "react-hook-form";
import { useEditor } from "@/hooks/use-editor";
import { Form } from "@/components/ui/form";
import { layers } from "@/hooks/use-editor/elements";

interface StyleContextType {
  form: UseFormReturn<StyleSchema>;
  onSubmit: (data: StyleSchema) => void;
  handleSetValue: <T extends Path<StyleSchema>>(
    name: T,
    value: PathValue<StyleSchema, T>
  ) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error("useStyle must be used within a StyleProvider");
  }
  return context;
};

export const StyleProvider = ({ children }: { children: ReactNode }) => {
  const elements = useEditor((state) => state.pages[0].elements);
  const focusElement = useEditor((state) => state.focusElement);
  const updateElement = useEditor((state) => state.updateElement);

  const form = useForm<StyleSchema>({
    values: focusElement
      ? layers.find(elements, focusElement)?.style
      : undefined,
  });

  const onSubmit = (data: StyleSchema) => {
    if (!focusElement) return;

    const { success, data: result, error } = styleSchema.safeParse(data);
    if (success) return updateElement(focusElement, { style: result });

    form.reset();
  };

  function handleSetValue<T extends Path<StyleSchema>>(
    name: T,
    value: PathValue<StyleSchema, T>
  ) {
    form.setValue(name, value);
    form.handleSubmit(onSubmit)();
  }

  return (
    <StyleContext.Provider value={{ form, onSubmit, handleSetValue }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
      </Form>
    </StyleContext.Provider>
  );
};
