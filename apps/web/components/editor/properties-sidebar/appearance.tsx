import {
  BorderRadiusBottomLeftIcon,
  BorderRadiusBottomRightIcon,
  BorderRadiusTopLeftIcon,
  BorderRadiusTopRightIcon,
} from "@/components/icons";
import { useEditor } from "@/hooks/use-editor";
import { layers } from "@/hooks/use-editor/elements";
import { isTextElement } from "@/hooks/use-editor/properties";
import {
  Minus,
  MinusIcon,
  ScanIcon,
  SunMediumIcon,
  Unlink,
} from "lucide-react";
import { useState } from "react";
import { PropertyButton } from "./property-button";
import { PropertyColorInput } from "./property-color-input";
import { PropertyInput } from "./property-input";
import { useStyle } from "./style-context";
import { VariablePopover } from "./variable-library";
import { variableSchemas, vars } from "@/hooks/use-editor/variables";
import { z } from "zod";

export function Appearance() {
  const focusElementVal = useEditor(
    (state) =>
      state.focusElement &&
      layers.find(state.pages[0].body, state.focusElement)?.type
  );
  const isTextElementBoolean =
    focusElementVal && !!isTextElement(focusElementVal);

  const [isExpanded, setIsExpanded] = useState(false);
  const { form, handleSetValue } = useStyle();

  const fillValue = form.watch("fill");

  function handleComplete(id: string) {
    handleSetValue("fill", {
      type: "variable",
      id,
    });
  }

  const variables = useEditor((state) => state.variables);
  function handleUnlink() {
    if (!fillValue) return;
    if (fillValue.type !== "variable") return;

    const value = vars.getVariable(fillValue, variables);
    handleSetValue("fill", {
      type: "default",
      value: value?.value ?? {
        type: "color",
        value: "#ffffff",
        opacity: 100,
      },
    });
  }

  return (
    <div className="p-2 pb-3 border-t">
      <div className="grid grid-cols-[repeat(3,2fr)_28px_28px] gap-2 mb-1.5 h-7 items-center">
        <h3 className="text-sm font-medium col-span-4">Appearance</h3>
      </div>

      <div className="grid grid-cols-[repeat(3,2fr)_repeat(2,28px)] gap-2">
        <PropertyInput
          icon={SunMediumIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="opacity"
          label="Opacity"
        />
        <PropertyInput
          icon={ScanIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="borderRadius"
          label="Border radius"
          lowerLimit={0}
        />
        <PropertyButton
          onClick={() => setIsExpanded(!isExpanded)}
          label="Expand"
        >
          <ScanIcon size={14} className="size-3.5" />
        </PropertyButton>
        {isExpanded && (
          <>
            <PropertyInput
              icon={BorderRadiusTopLeftIcon}
              containerClassNames="col-span-2"
              control={form.control}
              name="borderRadius.topLeft"
              label="Border top left"
            />
            <PropertyInput
              icon={BorderRadiusTopRightIcon}
              containerClassNames="col-span-2"
              control={form.control}
              name="borderRadius.topRight"
              label="Border top right"
            />
            <PropertyInput
              icon={BorderRadiusBottomRightIcon}
              containerClassNames="col-span-2"
              control={form.control}
              name="borderRadius.bottomLeft"
              label="Border bottom left"
            />
            <PropertyInput
              icon={BorderRadiusBottomLeftIcon}
              containerClassNames="col-span-2"
              control={form.control}
              name="borderRadius.bottomRight"
              label="Border bottom right"
            />
          </>
        )}

        {focusElementVal !== "image" &&
          (fillValue ? (
            <>
              <PropertyColorInput
                containerClassNames="col-span-3"
                control={form.control}
                name="fill"
                label="Fill"
              />
              {fillValue.type === "default" &&
                fillValue.value?.type !== "image" &&
                fillValue.value !== undefined && (
                  <VariablePopover
                    triggerClassName="col-span-1"
                    varType="color"
                    offset={167}
                    defaultValue={{
                      value: fillValue.value,
                    }}
                    onComplete={handleComplete}
                  />
                )}
              {fillValue.type === "variable" && (
                <PropertyButton onClick={handleUnlink}>
                  <Unlink className="size-3.5" />
                </PropertyButton>
              )}
              {!isTextElementBoolean && (
                <PropertyButton
                  className="col-span-1"
                  onClick={() => handleSetValue("fill", undefined)}
                >
                  <Minus className="size-3.5" />
                </PropertyButton>
              )}
            </>
          ) : (
            <>
              <PropertyButton
                onClick={() =>
                  handleSetValue("fill", {
                    type: "default",
                    value: {
                      type: "color",
                      value: "#ffffff",
                      opacity: 100,
                    },
                  })
                }
                variant="outline"
                className="col-span-4 text-xs w-full border-0"
              >
                Add Fill
              </PropertyButton>
              <VariablePopover
                triggerClassName="col-span-1"
                varType="color"
                defaultValue={{
                  value: {
                    type: "color",
                    value: "#ffffff",
                    opacity: 100,
                  },
                }}
                onComplete={handleComplete}
              />
            </>
          ))}
        {/* <pre className="col-span-4">
          {JSON.stringify(form.watch("fill"), null, 2)}
        </pre> */}
      </div>
    </div>
  );
}
