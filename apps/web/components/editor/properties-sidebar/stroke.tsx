import { Minus, SquareIcon } from "lucide-react";
import { PropertyButton } from "./property-button";
import { PropertyColorInput } from "./property-color-input";
import { useStyle } from "./style-context";
import {
  PropertySelect,
  PropertySelectItem,
  PropertySelectValue,
  PropertySelectTrigger,
  PropertySelectContent,
} from "./property-select";
import { PropertyInput } from "./property-input";

export function Stroke() {
  const { getValue, setValue } = useStyle();

  const hasStroke = getValue("strokeFill") !== "none";

  return (
    <div className="p-2 pb-3 border-t">
      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2 mb-1.5 h-7 items-center">
        <h3 className="text-sm font-medium col-span-4">Stroke</h3>
      </div>

      <div className="grid grid-cols-[repeat(3,2fr)_repeat(2,28px)] gap-2">
        {hasStroke ? (
          <>
            <PropertyColorInput
              containerClassNames="col-span-4"
              name="strokeFill"
              label="Fill"
            />
            <PropertyButton
              className="col-span-1"
              onClick={() => setValue("strokeFill", "none")}
            >
              <Minus className="size-3.5" />
            </PropertyButton>
            <PropertySelect
              containerClassNames="col-span-2"
              name="strokeStyle"
              label="Style"
            >
              <PropertySelectTrigger className="w-full">
                <PropertySelectValue />
              </PropertySelectTrigger>
              <PropertySelectContent>
                <PropertySelectItem value="solid">Solid</PropertySelectItem>
                <PropertySelectItem value="dashed">Dashed</PropertySelectItem>
                <PropertySelectItem value="dotted">Dotted</PropertySelectItem>
                <PropertySelectItem value="double">Double</PropertySelectItem>
              </PropertySelectContent>
            </PropertySelect>
            <PropertyInput
              containerClassNames="col-span-2"
              icon={SquareIcon}
              rightElement={<span className="text-xs px-1">px</span>}
              name="strokeWidth"
              label="Width"
            />
          </>
        ) : (
          <PropertyButton
            onClick={() => {
              setValue("strokeFill", {
                type: "color",
                value: "#000000",
                opacity: 100,
              });
              setValue("strokeWidth", 1);
              setValue("strokeStyle", "solid");
            }}
            variant="outline"
            className="col-span-4 text-xs w-full border-0"
          >
            {/* <PlusIcon className="size-3.5 mr-2" /> */}
            Add Stroke
          </PropertyButton>
        )}
        {/* <pre className="col-span-4">
          {JSON.stringify(form.watch("stroke"), null, 2)}
        </pre> */}
      </div>
    </div>
  );
}
