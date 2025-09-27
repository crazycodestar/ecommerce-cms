import { LetterSpacingIcon, LineHeightIcon } from "@/components/icons";
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
import { useEditor } from "@/hooks/use-editor";
import { layers } from "@/hooks/use-editor/elements";
import { isTextElement } from "@/hooks/use-editor/properties";
import { cn } from "@/lib/utils";
import {
  ALargeSmallIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ChevronDownIcon,
  ItalicIcon,
  MinusIcon,
  Settings2Icon,
} from "lucide-react";
import { PropertyButton } from "./property-button";
import { PropertyInput } from "./property-input";
import {
  PropertySelect,
  PropertySelectContent,
  PropertySelectItem,
  PropertySelectTrigger,
  PropertySelectValue,
} from "./property-select";
import { useStyle } from "./style-context";

const fontFamilyOptions = [
  ["System UI", "system-ui"],
  ["Inter", "inter"],
  ["Roboto", "roboto"],
  ["Montserrat", "montserrat"],
  ["Lora", "lora"],
  ["Poppins", "poppins"],
  ["Geist", "geist"],
  ["Geist Mono", "geist_mono"],
  ["Arial", "arial"],
  ["Helvetica", "helvetica"],
  ["Verdana", "verdana"],
  ["Tahoma", "tahoma"],
  ["Arial Black", "arial_black"],
  ["Impact", "impact"],
  ["Courier New", "courier_new"],
  ["Lucida Console", "lucida_console"],
];

export function Typography() {
  const focusElement = useEditor((state) => state.focusElement);
  const focusElementVal = useEditor(
    (state) =>
      focusElement && layers.find(state.pages[0].body, focusElement)?.type
  );
  const isTextElementBoolean =
    focusElementVal && !!isTextElement(focusElementVal);

  const { form, handleSetValue } = useStyle();

  function FontSizeOptions() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7 hover:bg-transparent"
          >
            <ChevronDownIcon size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-56">
          {[
            10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72,
            84, 96, 128,
          ].map((size, index) => (
            <DropdownMenuCheckboxItem
              key={index}
              checked={form.watch("fontSize") === size}
              onClick={() => handleSetValue("fontSize", size)}
            >
              {size}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("p-2 pb-3 border-t", !isTextElementBoolean && "hidden")}>
      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2 mb-1.5 h-7 items-center">
        <h3 className="text-sm font-medium col-span-4">Typography</h3>
      </div>

      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2">
        <PropertySelect
          containerClassNames="col-span-4"
          control={form.control}
          name="fontFamily"
          label="Font family"
        >
          <PropertySelectTrigger className="w-full truncate">
            <PropertySelectValue />
          </PropertySelectTrigger>
          <PropertySelectContent className="max-h-56">
            {fontFamilyOptions.map(([label, value], index) => (
              <PropertySelectItem key={index} value={value}>
                {label}
              </PropertySelectItem>
            ))}
          </PropertySelectContent>
        </PropertySelect>
        <PropertySelect
          containerClassNames="col-span-2"
          control={form.control}
          name="fontWeight"
          label="Font weight"
        >
          <PropertySelectTrigger className="w-full truncate">
            <PropertySelectValue />
          </PropertySelectTrigger>
          <PropertySelectContent>
            <PropertySelectItem value="thin">Thin</PropertySelectItem>
            <PropertySelectItem value="extralight">
              Extra light
            </PropertySelectItem>
            <PropertySelectItem value="light">Light</PropertySelectItem>
            <PropertySelectItem value="normal">Normal</PropertySelectItem>
            <PropertySelectItem value="medium">Medium</PropertySelectItem>
            <PropertySelectItem value="semibold">Semibold</PropertySelectItem>
            <PropertySelectItem value="bold">Bold</PropertySelectItem>
            <PropertySelectItem value="extrabold">
              Extra bold
            </PropertySelectItem>
            <PropertySelectItem value="black">Black</PropertySelectItem>
          </PropertySelectContent>
        </PropertySelect>
        <PropertyInput
          // icon={SunMediumIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="fontSize"
          label="Font size"
          rightElement={<FontSizeOptions />}
        />
        <PropertyInput
          icon={LineHeightIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="leading"
          sensitivity={0.1}
          increment={0.1}
          label="Line height"
        />
        <PropertyInput
          icon={LetterSpacingIcon}
          containerClassNames="col-span-2"
          control={form.control}
          name="tracking"
          increment={0.1}
          sensitivity={0.1}
          label="Letter spacing"
        />
        <TypographyOptions />
        {/* <pre className="col-span-4">
          {JSON.stringify(form.watch("fontFamily"), null, 2)}
        </pre> */}
      </div>
    </div>
  );
}

function TypographyOptions() {
  const { form, handleSetValue } = useStyle();

  function getVal<T>(value: string) {
    if (value === "") return undefined;
    return value as T;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <PropertyButton label="Typography options">
          <Settings2Icon size={14} />
        </PropertyButton>
      </PopoverTrigger>
      <PopoverContent className="w-84" side="left" sideOffset={203}>
        <div className="grid grid-cols-3 items-center gap-2">
          <label className="text-sm">Text align</label>
          <Tabs
            value={form.watch("textAlign") ?? undefined}
            onValueChange={(value) =>
              handleSetValue("textAlign", getVal(value))
            }
            className="col-span-2"
          >
            <TabsList className="w-full h-7">
              <TabsTrigger value="" className="rounded-sm">
                <MinusIcon size={14} />
              </TabsTrigger>
              <TabsTrigger value="left" className="rounded-sm">
                <AlignLeftIcon size={14} />
              </TabsTrigger>
              <TabsTrigger value="center" className="rounded-sm">
                <AlignCenterIcon size={14} />
              </TabsTrigger>
              <TabsTrigger value="right" className="rounded-sm">
                <AlignRightIcon size={14} />
              </TabsTrigger>
              <TabsTrigger value="justify" className="rounded-sm">
                <AlignJustifyIcon size={14} />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <label className="text-sm">Font Style</label>
          <Tabs
            value={form.watch("fontStyle") ?? undefined}
            onValueChange={(value) =>
              handleSetValue("fontStyle", getVal(value))
            }
            className="col-span-2"
          >
            <TabsList className="w-full h-7">
              <TabsTrigger value="normal" className="rounded-sm">
                <ALargeSmallIcon size={14} />
              </TabsTrigger>
              <TabsTrigger value="italic" className="rounded-sm">
                <ItalicIcon size={14} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
