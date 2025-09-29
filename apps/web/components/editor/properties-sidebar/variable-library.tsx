import { VariableIcon } from "@/components/icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEditor } from "@/hooks/use-editor";
import {
  Variable,
  variableSchemas,
  VariableType,
} from "@/hooks/use-editor/variables";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusIcon, PlusIcon, Settings2Icon, TrashIcon, X } from "lucide-react";
import { ComponentProps, useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { PropertyButton } from "./property-button";
import {
  ColorIndicator,
  ColorPicker,
  ColorValueInput,
} from "./property-color-input";
import { PropertyInputPrimitive as PropertyInput } from "./property-input";
import { isEqual } from "es-toolkit";

interface VariablePopoverProps<T extends VariableType> {
  varType: T;
  defaultValue: Partial<z.infer<(typeof variableSchemas)[T]>> & {
    value: z.infer<(typeof variableSchemas)[T]>["value"];
  };
  triggerClassName?: string;
  offset?: number;
  onComplete?: (id: string) => void;
  children?: React.ReactNode;
  state?: "library" | "add";
}

export function VariablePopover<T extends VariableType>({
  varType,
  defaultValue,
  triggerClassName,
  offset = 203,
  onComplete,
  children,
  state: initialState,
}: VariablePopoverProps<T>) {
  const variables = useEditor((state) => state.variables);
  const variablesOfType = variables.filter((v) => v.type === varType);
  const createVariable = useEditor((state) => state.addVariable);

  const [state, setState] = useState<"library" | "add">("library");
  const [open, onOpenChange] = useState(false);

  const finalState = initialState ?? state;

  function handleSubmit(data: z.infer<(typeof variableSchemas)[T]>) {
    onOpenChange(false);
    createVariable(data);
    onComplete?.(data.id);
  }

  function handleSelect(id: string) {
    onOpenChange(false);
    onComplete?.(id);
  }

  const variableForm = useVariableForm({
    varType,
    schema: variableSchemas[varType],
    value: defaultValue,
    onSubmit: handleSubmit,
  });

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : (
          <PropertyButton className={cn("col-span-1", triggerClassName)}>
            <VariableIcon className="size-3.5" />
          </PropertyButton>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" side="left" sideOffset={offset}>
        <div className="grid grid-cols-[repeat(3,2fr)_28px] items-center gap-2 mb-2">
          <h3 className="text-sm font-medium col-span-3">
            {finalState === "library" ? "Library" : "Add Variable"}
          </h3>
          {!initialState && (
            <PropertyButton
              className="col-span-1"
              onClick={() => setState(state === "library" ? "add" : "library")}
            >
              {state === "library" ? (
                <PlusIcon className="size-3.5" />
              ) : (
                <X className="size-3.5" />
              )}
            </PropertyButton>
          )}
        </div>
        {state === "library" && (
          <div className="flex flex-col gap-1 h-[250px] overflow-y-auto">
            {variablesOfType.map((v) => (
              <VariableItem
                key={v.id}
                variable={v}
                onClick={() => handleSelect(v.id)}
              />
            ))}
          </div>
        )}
        {state === "add" && (
          <div className="grid">
            <VariableForm {...variableForm} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface UseVariableFormProps<T extends VariableType> {
  varType: T;
  schema: (typeof variableSchemas)[T];
  value: Partial<z.infer<(typeof variableSchemas)[T]>> & {
    value: z.infer<(typeof variableSchemas)[T]>["value"];
  };
  onSubmit: (data: z.infer<(typeof variableSchemas)[T]>) => void;
}

function useVariableForm<T extends VariableType>({
  varType,
  schema,
  value,
  onSubmit,
}: UseVariableFormProps<T>) {
  const form = useForm<Variable>({
    resolver: zodResolver(schema),
    mode: "all",
  });

  useEffect(() => {
    form.trigger();
    // TODO: add duplicate check
  }, []);

  useEffect(() => {
    const { id: __, ...otherValues } = value;
    const { id: _, ...otherFormValues } = form.watch();

    if (isEqual(otherValues, otherFormValues)) return;

    form.reset({
      id: crypto.randomUUID(),
      name: "",
      type: varType,
      ...value,
    });
    form.trigger();
  }, [value]);

  return {
    varType,
    form,
    onSubmit,
  };
}

interface VariableFormProps<T extends VariableType> {
  varType: T;
  form: UseFormReturn<Variable>;
  onSubmit: (data: z.infer<(typeof variableSchemas)[T]>) => void;
  returnKey?: string;
}

function VariableForm<T extends VariableType>({
  varType,
  form,
  onSubmit,
  returnKey = "Create Variable",
}: VariableFormProps<T>) {
  const hasErrors = !!Object.keys(form.formState.errors).length;

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="grid gap-2"
      >
        {/* <pre>here: {JSON.stringify(form.watch(), null, 2)}</pre> */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 gap-1">
              <FormLabel className="col-span-1 text-sm font-normal">
                Name
              </FormLabel>
              <FormControl>
                <PropertyInput
                  containerClassNames="col-span-3"
                  placeholder="Enter name"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 gap-1">
              <FormLabel className="col-span-1 text-sm font-normal">
                Type
              </FormLabel>
              <FormControl>
                {varType === "color" && (
                  <ColorValueInput
                    color={field.value}
                    onChange={field.onChange}
                    containerClassNames={cn("w-full col-span-3")}
                    leftElement={
                      <Popover>
                        <PopoverTrigger asChild>
                          <ColorIndicator color={field.value} />
                        </PopoverTrigger>
                        <PopoverContent
                          className="p-3 w-[268px]"
                          side="left"
                          sideOffset={16}
                        >
                          <ColorPicker
                            data={field.value}
                            onChange={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                    }
                  />
                )}
              </FormControl>
            </FormItem>
          )}
        />
        <PropertyButton
          type="submit"
          variant="default"
          disabled={hasErrors}
          className="text-xs w-fit ml-auto px-3"
        >
          {returnKey}
        </PropertyButton>
      </form>
    </Form>
  );
}

export function VariableLibrary() {
  const variables = useEditor((state) => state.variables);

  return (
    <div className="grid">
      {variables.map((v) => (
        <VariableItemEdit key={v.id} variable={v} />
      ))}
    </div>
  );
}

function VariableItemEdit({ variable }: { variable: Variable }) {
  const updateVariable = useEditor((state) => state.updateVariable);

  const [open, onOpenChange] = useState(false);

  function handleSubmit(data: z.infer<(typeof variableSchemas)[VariableType]>) {
    onOpenChange(false);
    updateVariable(variable.id, data);
  }

  const variableForm = useVariableForm({
    varType: variable.type,
    schema: variableSchemas[variable.type],
    value: variable,
    onSubmit: handleSubmit,
  });

  return (
    <div className="grid grid-cols-[repeat(4,2fr)_28px] items-center gap-2">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <VariableItem variable={variable} />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" side="left" sideOffset={5}>
          <div className="grid grid-cols-[repeat(3,2fr)_28px] items-center gap-2">
            <h3 className="text-sm font-medium col-span-3">Edit Variable</h3>
          </div>
          <div className="grid">
            <VariableForm returnKey="Edit Variable" {...variableForm} />
          </div>
        </PopoverContent>
      </Popover>
      <PropertyButton>
        <MinusIcon className="size-3.5" />
      </PropertyButton>
    </div>
  );
}

export function VariableItem({
  variable,
  className,
  ...props
}: { variable: Variable } & ComponentProps<typeof PropertyButton>) {
  return (
    <PropertyButton
      className={cn("w-full col-span-4 justify-start gap-2 px-2", className)}
      size="sm"
      {...props}
    >
      {variable.type === "color" && <ColorIndicator color={variable.value} />}
      <p className="text-sm">{variable.name}</p>
    </PropertyButton>
  );
}
