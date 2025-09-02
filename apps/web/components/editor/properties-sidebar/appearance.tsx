import {
  BorderBottomIcon,
  BorderLeftIcon,
  BorderRightIcon,
  BorderTopIcon,
} from "@/components/icons";
import { ScanIcon, SquareDashedIcon, SunMediumIcon } from "lucide-react";
import { useState } from "react";
import { PropertyButton } from "./property-button";
import { PropertyInput } from "./property-input";
import { useStyle } from "./style-context";

export function Appearance() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { form } = useStyle();

  return (
    <div className="p-2 pb-3 border-t">
      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2 mb-2">
        <h3 className="text-sm font-medium col-span-4 opacity-[.67]">
          Appearance
        </h3>
      </div>

      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2">
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
      </div>
    </div>
  );
}
