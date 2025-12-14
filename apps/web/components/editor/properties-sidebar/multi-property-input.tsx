import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StyleSchema } from "@/db/types/style";
import { isDefined } from "@/lib/isUndefined";
import { cn } from "@/lib/utils";
import { Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  PropertyInputPrimitive,
  PropertyInputPrimitiveProps,
} from "./property-input";
import { useStyle } from "./style-context";

interface MultiPropertyInputProps
  extends Omit<PropertyInputPrimitiveProps<string>, "setValue" | "value"> {
  names: (keyof StyleSchema)[];
  label: string;
}

export const MultiPropertyInput = ({
  names,
  label,
  ...inputProps
}: MultiPropertyInputProps) => {
  const { getValue, getPreviousValue, setValue } = useStyle();
  const values = names.map((name) => getValue(name));
  const previousValues = names.map((name) => getPreviousValue(name));

  function handleResetValues() {
    let values: Partial<StyleSchema> = {};
    for (const name of names) {
      // @ts-expect-error key mapping poorly implemented
      values[name as keyof StyleSchema] = getPreviousValue(name);
    }
    setValue(values as Partial<StyleSchema>);
  }

  const [localValue, setLocalValue] = useState<
    StyleSchema[keyof StyleSchema] | "Mixed"
  >(getValueFromArray(values));

  useEffect(() => {
    setLocalValue(getValueFromArray(values));
  }, [values.join(",")]);

  function handleSetValues(value: StyleSchema[keyof StyleSchema]) {
    if (value === "") return setLocalValue(getValueFromArray(values));

    let updatedValues: Partial<StyleSchema> = {};
    for (const name of names) {
      // @ts-expect-error key mapping poorly implemented
      updatedValues[name as keyof StyleSchema] = value;
    }
    setValue(updatedValues as Partial<StyleSchema>);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("relative", inputProps.containerClassNames)}>
          {!isEqual(values, previousValues) && (
            <button
              type="button"
              onClick={handleResetValues}
              className="absolute z-10 top-0 right-0 size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center -translate-y-1/2 translate-x-1/2"
            >
              <Undo2 size={10} />
            </button>
          )}
          <PropertyInputPrimitive
            {...inputProps}
            containerClassNames="w-full"
            setValue={handleSetValues}
            value={localValue as string}
            onChange={(e) =>
              setLocalValue(e.target.value as StyleSchema[keyof StyleSchema])
            }
            onBlur={() => isDefined(localValue) && handleSetValues(localValue)}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent className="pointer-events-none">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

function getValueFromArray<T extends any[]>(values: T): T[number] | "Mixed" {
  return values.every((v) => values[0] === v) ? values[0] : "Mixed";
}

function isEqual<T extends any[]>(values: T, previousValues: T): boolean {
  if (previousValues.every((v) => v === undefined)) return true;
  return values.every((v, i) => v === previousValues[i]);
}
