import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MinusIcon, PlusIcon, SquareIcon } from "lucide-react";
import { PropertyButton } from "./property-button";
import { PropertyColorInput } from "./property-color-input";
import { PropertyInput } from "./property-input";
import { useStyle } from "./style-context";
import { DropShadowIcon, RadialIcon, XIcon, YIcon } from "@/components/icons";
import { useController } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Effects() {
  const { getValue, setValue } = useStyle();

  return (
    <div className="p-2 pb-3 border-t">
      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2 mb-1.5 h-7 items-center">
        <h3 className="text-sm font-medium col-span-4">Effects</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <PropertyButton
              disabled={
                ![
                  getValue("dropShadow"),
                  getValue("blur"),
                  getValue("backdropBlur"),
                ].includes(undefined)
              }
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              label="Add effect"
            >
              <PlusIcon size={14} className="size-3.5" />
            </PropertyButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {getValue("dropShadow") === undefined && (
              <DropdownMenuItem
                onClick={() =>
                  setValue("dropShadow", {
                    x: 0,
                    y: 2,
                    spread: 2,
                    color: {
                      type: "color",
                      value: "#525252",
                      opacity: 100,
                    },
                  })
                }
              >
                <DropShadowIcon width={14} height={14} />
                Drop shadow
              </DropdownMenuItem>
            )}
            {getValue("blur") === undefined && (
              <DropdownMenuItem onClick={() => setValue("blur", 0)}>
                <RadialIcon width={14} height={14} />
                Blur
              </DropdownMenuItem>
            )}
            {getValue("backdropBlur") === undefined && (
              <DropdownMenuItem onClick={() => setValue("backdropBlur", 0)}>
                <SquareIcon size={14} />
                Backdrop blur
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-[repeat(3,2fr)_repeat(2,28px)] gap-2">
        {getValue("dropShadow") && (
          <>
            <DropShadowInput className="col-span-4" />
            <PropertyButton
              onClick={() => setValue("dropShadow", undefined)}
              label="Remove"
            >
              <MinusIcon size={14} className="size-3.5" />
            </PropertyButton>
          </>
        )}

        {getValue("blur") !== undefined && (
          <>
            <BlurInput className="col-span-4" />
            <PropertyButton
              onClick={() => setValue("blur", undefined)}
              label="Remove"
            >
              <MinusIcon size={14} className="size-3.5" />
            </PropertyButton>
          </>
        )}

        {getValue("backdropBlur") !== undefined && (
          <>
            <BackdropBlurInput className="col-span-4" />
            <PropertyButton
              onClick={() => setValue("backdropBlur", undefined)}
              label="Remove"
            >
              <MinusIcon size={14} className="size-3.5" />
            </PropertyButton>
          </>
        )}
        {/* <pre className="col-span-4">
          {JSON.stringify(form.watch("dropShadow"), null, 2)}
          {JSON.stringify(form.watch("blur"), null, 2)}
          {JSON.stringify(form.watch("backdropBlur"), null, 2)}
        </pre> */}
      </div>
    </div>
  );
}

function DropShadowInput({ className }: { className?: string }) {
  const { getValue, setValue } = useStyle();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 bg-background pl-1.5 rounded-md border h-7",
            className
          )}
        >
          <DropShadowIcon width={14} height={14} />
          <span className="text-sm">Drop shadow</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-3 w-64 items-center grid grid-cols-3 gap-2"
        side="left"
        sideOffset={16}
      >
        <label className="text-sm">Position</label>
        <PropertyInput
          icon={XIcon}
          containerClassNames="col-span-2"
          name="dropShadow.x"
          label="X"
        />
        <div className="col-span-1" />
        <PropertyInput
          icon={YIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="dropShadow.y"
          label="Y"
        />
        <label className="text-sm">Spread</label>
        <PropertyInput
          icon={RadialIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="dropShadow.spread"
          label="Spread"
          lowerLimit={0}
        />
        <label className="text-sm">Color</label>
        <PropertyColorInput
          noOptions
          containerClassNames="col-span-2"
          control={form.control}
          name="dropShadow.color"
          label="Color"
        />
      </PopoverContent>
    </Popover>
  );
}

function BlurInput({ className }: { className?: string }) {
  const { form } = useStyle();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 bg-background pl-1.5 rounded-md border h-7",
            className
          )}
        >
          <RadialIcon width={14} height={14} />
          <span className="text-sm">Blur</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-3 w-64 items-center grid grid-cols-3 gap-2"
        side="left"
        sideOffset={16}
      >
        <label className="text-sm">Radius</label>
        <PropertyInput
          icon={RadialIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="blur"
          label="Radius"
        />
      </PopoverContent>
    </Popover>
  );
}

function BackdropBlurInput({ className }: { className?: string }) {
  const { form } = useStyle();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 bg-background pl-1.5 rounded-md border h-7",
            className
          )}
        >
          <SquareIcon size={14} />
          <span className="text-sm">Backdrop blur</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-3 w-64 items-center grid grid-cols-3 gap-2"
        side="left"
        sideOffset={16}
      >
        <label className="text-sm">Radius</label>
        <PropertyInput
          icon={SquareIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="backdropBlur"
          label="Radius"
        />
      </PopoverContent>
    </Popover>
  );
}
