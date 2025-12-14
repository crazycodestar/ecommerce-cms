import {
  BorderRadiusBottomLeftIcon,
  BorderRadiusBottomRightIcon,
  BorderRadiusTopLeftIcon,
  BorderRadiusTopRightIcon,
} from "@/components/icons";
import { vars } from "@/db/lib/vars";
import { Minus, ScanIcon, SunMediumIcon, Unlink } from "lucide-react";
import { useState } from "react";
import { MultiPropertyInput } from "./multi-property-input";
import { PropertyButton } from "./property-button";
import { PropertyColorInput } from "./property-color-input";
import { PropertyInput } from "./property-input";
import { useStyle } from "./style-context";
import { VariablePopover } from "./variable-library";

export function Appearance({
  isTextElementBoolean,
}: {
  isTextElementBoolean: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getValue, setValue } = useStyle();

  const fillValue = getValue("fill");

  function handleComplete(value: string) {
    setValue({
      fill: {
        type: "variable",
        value,
      },
    });
  }

  async function handleUnlink() {
    if (fillValue === "none") return;
    if (fillValue.type !== "variable") return;

    const value = await vars.getBySlug(fillValue.value);
    if (!value) return;

    setValue({
      fill: value.value,
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
          name="opacity"
          label="Opacity"
        />
        <MultiPropertyInput
          names={[
            "borderRadiusTopLeft",
            "borderRadiusTopRight",
            "borderRadiusBottomLeft",
            "borderRadiusBottomRight",
          ]}
          icon={ScanIcon}
          containerClassNames="col-span-2"
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
              name="borderRadiusTopLeft"
              label="Border top left"
            />
            <PropertyInput
              icon={BorderRadiusTopRightIcon}
              containerClassNames="col-span-2"
              name="borderRadiusTopRight"
              label="Border top right"
            />
            <PropertyInput
              icon={BorderRadiusBottomLeftIcon}
              containerClassNames="col-span-2"
              name="borderRadiusBottomLeft"
              label="Border bottom left"
            />
            <PropertyInput
              icon={BorderRadiusBottomRightIcon}
              containerClassNames="col-span-2"
              name="borderRadiusBottomRight"
              label="Border bottom right"
            />
          </>
        )}

        {fillValue !== "none" && fillValue.type !== "image" ? (
          <>
            <PropertyColorInput
              containerClassNames="col-span-3"
              name="fill"
              label="Fill"
            />
            {fillValue.type !== "variable" && (
              <VariablePopover
                triggerClassName="col-span-1"
                varType="color"
                offset={167}
                defaultValue={{
                  type: "color",
                  value: fillValue,
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
                onClick={() => setValue({ fill: "none" })}
              >
                <Minus className="size-3.5" />
              </PropertyButton>
            )}
          </>
        ) : (
          <>
            <PropertyButton
              onClick={() =>
                setValue({
                  fill: {
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
        )}
        {/* <pre className="col-span-4">
          {JSON.stringify(form.watch("fill"), null, 2)}
        </pre> */}
      </div>
    </div>
  );
}
