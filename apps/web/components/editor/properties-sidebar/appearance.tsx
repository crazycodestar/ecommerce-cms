import {
  BorderBottomIcon,
  BorderLeftIcon,
  BorderRightIcon,
  BorderTopIcon,
  BorderRadiusTopLeftIcon,
  BorderRadiusTopRightIcon,
  BorderRadiusBottomLeftIcon,
  BorderRadiusBottomRightIcon,
} from "@/components/icons";
import { Minus, ScanIcon, SquareDashedIcon, SunMediumIcon } from "lucide-react";
import { useState } from "react";
import { PropertyButton } from "./property-button";
import { PropertyColorInput } from "./property-color-input";
import { PropertyInput } from "./property-input";
import { useStyle } from "./style-context";
import { useEditor } from "@/hooks/use-editor";
import { layers } from "@/hooks/use-editor/elements";
import { isTextElement } from "@/hooks/use-editor/properties";

export function Appearance() {
  const focusElementVal = useEditor(
    (state) =>
      state.focusElement &&
      layers.find(state.pages[0].elements, state.focusElement)?.type
  );
  const isTextElementBoolean =
    focusElementVal && !!isTextElement(focusElementVal);

  const [isExpanded, setIsExpanded] = useState(false);
  const { form, handleSetValue } = useStyle();

  return (
    <div className="p-2 pb-3 border-t">
      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2 mb-1.5 h-7 items-center">
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

        {form.watch("fill.value") ? (
          <>
            <PropertyColorInput
              containerClassNames="col-span-4"
              control={form.control}
              name="fill.value"
              label="Fill"
            />
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
          <PropertyButton
            onClick={() =>
              handleSetValue("fill.value", {
                type: "color",
                value: "#ffffff",
                opacity: 100,
              })
            }
            variant="outline"
            className="col-span-4 text-xs w-full border-0"
          >
            {/* <PlusIcon className="size-3.5 mr-2" /> */}
            Add Fill
          </PropertyButton>
        )}
        {/* <pre className="col-span-4">
          {JSON.stringify(form.watch("opacity"), null, 2)}
        </pre> */}
      </div>
    </div>
  );
}
