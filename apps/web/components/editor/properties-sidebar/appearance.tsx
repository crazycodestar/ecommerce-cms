import {
  AddColorIcon,
  BorderBottomIcon,
  BorderLeftIcon,
  BorderRightIcon,
  BorderTopIcon,
} from "@/components/icons";
import {
  Diamond,
  DiamondIcon,
  Minus,
  PlusIcon,
  ScanIcon,
  SquareDashedIcon,
  SunMediumIcon,
} from "lucide-react";
import { useState } from "react";
import { PropertyButton } from "./property-button";
import { PropertyInput } from "./property-input";
import { useStyle } from "./style-context";
import { PropertyColorInput } from "./property-color-input";
import { Button } from "@/components/ui/button";

export function Appearance() {
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
          icon={SquareDashedIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="borderRadius"
          label="Border radius"
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
              icon={BorderLeftIcon}
              containerClassNames="col-span-2"
              control={form.control}
              name="borderRadius.topLeft"
              label="Border top left"
            />
            <PropertyInput
              icon={BorderTopIcon}
              containerClassNames="col-span-2"
              control={form.control}
              name="borderRadius.topRight"
              label="Border top right"
            />
            <PropertyInput
              icon={BorderRightIcon}
              containerClassNames="col-span-2"
              control={form.control}
              name="borderRadius.bottomLeft"
              label="Border bottom left"
            />
            <PropertyInput
              icon={BorderBottomIcon}
              containerClassNames="col-span-2"
              control={form.control}
              name="borderRadius.bottomRight"
              label="Border bottom right"
            />
          </>
        )}

        {form.watch("background.value") ? (
          <>
            <PropertyColorInput
              containerClassNames="col-span-4"
              control={form.control}
              name="background.value"
              label="Background"
            />
            <PropertyButton
              className="col-span-1"
              onClick={() => handleSetValue("background", undefined)}
            >
              <Minus className="size-3.5" />
            </PropertyButton>
          </>
        ) : (
          <PropertyButton
            onClick={() =>
              handleSetValue("background.value", {
                type: "color",
                value: "#ffffff",
                opacity: 100,
              })
            }
            variant="outline"
            className="col-span-4 text-xs w-full border-0"
          >
            {/* <PlusIcon className="size-3.5 mr-2" /> */}
            Add Background Color
          </PropertyButton>
        )}
        {/* <pre className="col-span-4">
          {JSON.stringify(form.watch("background.value"), null, 2)}
        </pre> */}
      </div>
    </div>
  );
}
