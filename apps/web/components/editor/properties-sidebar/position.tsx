import {
  AlignEndIcon,
  AlignMiddleIcon,
  AlignStartIcon,
  AlignStretchIcon,
  XIcon,
  YIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowDownToLineIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ArrowUpToLineIcon,
  ChevronDownIcon,
  MinusIcon,
  MoveHorizontalIcon,
  Settings2Icon,
} from "lucide-react";
import { PropertyButton } from "./property-button";
import { PropertyInput } from "./property-input";
import { useStyle } from "./style-context";
import { StyleSchema } from "@/db/types/style";

export function Position() {
  const { getValue, setValue } = useStyle();

  const isXFlipped = !!getValue("bottom");
  const isYFlipped = !!getValue("right");

  function XPosSwitch() {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-7 hover:bg-transparent"
        onClick={() => {
          if (isXFlipped) {
            setValue({ top: getValue("bottom") });
            setValue({ bottom: 0 });
          } else {
            setValue({ bottom: getValue("top") });
            setValue({ top: 0 });
          }
        }}
      >
        {isXFlipped ? (
          <ArrowLeftToLineIcon size={14} />
        ) : (
          <ArrowRightToLineIcon size={14} />
        )}
      </Button>
    );
  }

  function YPosSwitch() {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-7 hover:bg-transparent"
        onClick={() => {
          if (isYFlipped) {
            setValue({ left: getValue("right") });
            setValue({ right: 0 });
          } else {
            setValue({ right: getValue("left") });
            setValue({ left: 0 });
          }
        }}
      >
        {isYFlipped ? (
          <ArrowUpToLineIcon size={14} />
        ) : (
          <ArrowDownToLineIcon size={14} />
        )}
      </Button>
    );
  }

  return (
    <div className="p-2 pb-3 border-t">
      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2 mb-1.5 h-7 items-center">
        <h3 className="text-sm font-medium col-span-4">Position</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <PropertyButton label="Position">
              <ChevronDownIcon size={14} />
            </PropertyButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={getValue("position") === "relative"}
              onClick={() => setValue({ position: "relative" })}
            >
              Relative
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={getValue("position") === "absolute"}
              onClick={() => setValue({ position: "absolute" })}
            >
              Absolute
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={getValue("position") === "fixed"}
              onClick={() => setValue({ position: "fixed" })}
            >
              Fixed
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={getValue("position") === "sticky"}
              onClick={() => setValue({ position: "sticky" })}
            >
              Sticky
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2">
        <PropertyInput
          icon={XIcon}
          containerClassNames="col-span-2"
          name={isXFlipped ? "bottom" : "top"}
          label="X"
          rightElement={<XPosSwitch />}
        />
        <PropertyInput
          icon={YIcon}
          containerClassNames="col-span-2"
          name={isYFlipped ? "right" : "left"}
          label="Y"
          rightElement={<YPosSwitch />}
        />
        {getValue("position") === "relative" && <RelativeOptions />}
      </div>
    </div>
  );
}

function RelativeOptions() {
  const { getValue, setValue } = useStyle();

  function getVal<T>(value: string) {
    if (value === "") return undefined;
    return value as T;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <PropertyButton label="Relative options">
          <Settings2Icon size={14} />
        </PropertyButton>
      </PopoverTrigger>
      <PopoverContent className="w-84" side="left" sideOffset={203}>
        <div className="grid grid-cols-3 items-center gap-2">
          <label className="text-sm">Justify self</label>
          <Tabs
            value={getValue("justifySelf")}
            onValueChange={(value) =>
              setValue({
                justifySelf: getVal(value) as StyleSchema["justifySelf"],
              })
            }
            className="col-span-2"
          >
            <TabsList className="w-full h-7">
              <TabsTrigger value="auto" className="rounded-sm">
                <MinusIcon size={14} />
              </TabsTrigger>
              <TabsTrigger value="start" className="rounded-sm">
                <AlignLeftIcon size={14} />
              </TabsTrigger>
              <TabsTrigger value="center" className="rounded-sm">
                <AlignCenterIcon size={14} />
              </TabsTrigger>
              <TabsTrigger value="end" className="rounded-sm">
                <AlignRightIcon size={14} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <label className="text-sm">Align self</label>
          <Tabs
            value={getValue("alignSelf")}
            onValueChange={(value) =>
              setValue({
                alignSelf: getVal(value) as StyleSchema["alignSelf"],
              })
            }
            className="col-span-2"
          >
            <TabsList className="w-full h-7">
              <TabsTrigger value="auto" className="rounded-sm">
                <MinusIcon size={14} />
              </TabsTrigger>
              <TabsTrigger value="start" className="rounded-sm">
                <AlignStartIcon width={14} height={14} />
              </TabsTrigger>
              <TabsTrigger value="center" className="rounded-sm">
                <AlignMiddleIcon width={14} height={14} />
              </TabsTrigger>
              <TabsTrigger value="end" className="rounded-sm">
                <AlignEndIcon width={14} height={14} />
              </TabsTrigger>
              <TabsTrigger value="stretch" className="rounded-sm">
                <AlignStretchIcon width={14} height={14} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <label className="text-sm">Col span</label>
          <PropertyInput
            icon={MoveHorizontalIcon}
            containerClassNames="col-span-2"
            name="colSpan"
            label="Col span"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
