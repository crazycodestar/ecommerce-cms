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

export function Position() {
  const { form, handleSetValue } = useStyle();

  function XPosSwitch() {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-7 hover:bg-transparent"
        onClick={() =>
          handleSetValue("x.isFlipped", !form.watch("x.isFlipped"))
        }
      >
        {form.watch("x.isFlipped") ? (
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
        onClick={() =>
          handleSetValue("y.isFlipped", !form.watch("y.isFlipped"))
        }
      >
        {form.watch("y.isFlipped") ? (
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
              checked={form.watch("position.type") === "relative"}
              onClick={() => handleSetValue("position.type", "relative")}
            >
              Relative
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={form.watch("position.type") === "absolute"}
              onClick={() => handleSetValue("position.type", "absolute")}
            >
              Absolute
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={form.watch("position.type") === "fixed"}
              onClick={() => handleSetValue("position.type", "fixed")}
            >
              Fixed
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={form.watch("position.type") === "sticky"}
              onClick={() => handleSetValue("position.type", "sticky")}
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
          control={form.control}
          name="x.pos"
          label="X"
          rightElement={<XPosSwitch />}
        />
        <PropertyInput
          icon={YIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="y.pos"
          label="Y"
          rightElement={<YPosSwitch />}
        />
        {form.watch("position.type") === "relative" && <RelativeOptions />}
      </div>
    </div>
  );
}

function RelativeOptions() {
  const { form, handleSetValue } = useStyle();

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
            value={form.watch("position.justifySelf")}
            onValueChange={(value) =>
              handleSetValue("position.justifySelf", getVal(value))
            }
            className="col-span-2"
          >
            <TabsList className="w-full h-7">
              <TabsTrigger value="" className="rounded-sm">
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
            value={form.watch("position.alignSelf")}
            onValueChange={(value) =>
              handleSetValue("position.alignSelf", getVal(value))
            }
            className="col-span-2"
          >
            <TabsList className="w-full h-7">
              <TabsTrigger value="" className="rounded-sm">
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
            control={form.control}
            name="position.colSpan"
            label="Col span"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
