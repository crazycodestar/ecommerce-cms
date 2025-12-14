import {
  AlignEndIcon,
  AlignMiddleIcon,
  AlignStartIcon,
  FlexColIcon,
  FlexRowIcon,
  HorizontalGapIcon,
  PaddingBottomIcon,
  PaddingIcon,
  PaddingLeftIcon,
  PaddingRightIcon,
  PaddingTopIcon,
  SmallDashCenterIcon,
  SmallDashEndIcon,
  SmallDashStartIcon,
  VerticalDashIcon,
  VerticalGapIcon,
  VerticalSmallDashCenterIcon,
  VerticalSmallDashEndIcon,
  VerticalSmallDashStartIcon,
  WrapIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StyleSchema } from "@/db/types/style";
import { cn } from "@/lib/utils";
import {
  ALargeSmallIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BaselineIcon,
  ChevronDownIcon,
  ChevronsDownUpIcon,
  ChevronsLeftRightIcon,
  ChevronsRightLeft,
  ChevronsUpDownIcon,
  Dot,
  EyeClosedIcon,
  EyeOffIcon,
  FoldHorizontal,
  FoldVertical,
  LaptopMinimal,
  LayoutGridIcon,
  MinusIcon,
  MoveHorizontalIcon,
  MoveVerticalIcon,
  PlusIcon,
  ScanIcon,
  Settings2Icon,
  UnfoldHorizontal,
  UnfoldVertical,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  useController,
  UseFormReturn,
} from "react-hook-form";
import { PropertyButton } from "./property-button";
import { PropertyInput } from "./property-input";
import { useStyle } from "./style-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MultiPropertyInput } from "./multi-property-input";
import { useEditor } from "@/context/editor";

export function Layout() {
  // const marginForm = useMarginForm();

  return (
    <div className="p-2 pb-3 border-t">
      <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2 mb-1 h-7 items-center">
        <h3 className="text-sm font-medium col-span-4">Layout</h3>
        {/* <AlignOptions onAlign={marginForm.handleAlign} /> */}
      </div>

      <div className="space-y-2 flex flex-col">
        <DisplayForm />
        <PaddingForm />
        <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2">
          <WidthForm className="col-span-2" />
          <HeightForm className="col-span-2" />
        </div>
      </div>
    </div>
  );
}

// function useMarginForm() {
//   const { values, handleUpdate } = useProperty("m");
//   const form = useForm<MarginSchema>({
//     values,
//   });

//   const onSubmit = (data: MarginSchema) => {
//     const { success, data: result } = marginSchema.safeParse(data);
//     if (success) return handleUpdate(result);

//     return form.reset();
//   };

//   function handleAlign(align: "left" | "center" | "right") {
//     switch (align) {
//       case "left":
//         form.setValue("margin.left", 0);
//         form.setValue("margin.right", "Auto");
//         break;
//       case "center":
//         form.setValue("margin.left", "Auto");
//         form.setValue("margin.right", "Auto");
//         break;
//       case "right":
//         form.setValue("margin.left", "Auto");
//         form.setValue("margin.right", 0);
//         break;
//     }

//     form.handleSubmit(onSubmit)();
//   }

//   return {
//     form,
//     onSubmit,
//     handleAlign,
//   };
// }

// function AlignOptions({
//   onAlign,
// }: {
//   onAlign: (align: "left" | "center" | "right") => void;
// }) {
//   return (
//     <DropdownMenu>
//       <Tooltip delayDuration={800} disableHoverableContent>
//         <DropdownMenuTrigger asChild>
//           <TooltipTrigger asChild>
//             <Button
//               type="button"
//               size="icon"
//               variant="ghost"
//               className="col-span-1 size-7"
//             >
//               <AlignCenterIcon size={14} className="size-3.5" />
//             </Button>
//           </TooltipTrigger>
//         </DropdownMenuTrigger>
//         <TooltipContent>
//           <p>Align Options</p>
//         </TooltipContent>
//       </Tooltip>
//       <DropdownMenuContent>
//         <DropdownMenuItem onClick={() => onAlign("left")}>
//           <AlignLeftIcon className="size-3.5" />
//           <span> Align Left</span>
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => onAlign("center")}>
//           <AlignCenterIcon className="size-3.5" />
//           <span> Align Center</span>
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => onAlign("right")}>
//           <AlignRightIcon className="size-3.5" />
//           <span> Align Right</span>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// function MarginForm({ form, onSubmit }: ReturnType<typeof useMarginForm>) {
//   const [isExpanded, setIsExpanded] = useState(false);

//   return (
//     <Form {...form}>
//       <form
//         className="grid grid-cols-[repeat(4,2fr)_28px] gap-2"
//         onSubmit={form.handleSubmit(onSubmit)}
//       >
//         <PropertyInput
//           icon={SquareDashedIcon}
//           containerClassNames="col-span-4"
//           control={form.control}
//           name="value"
//           label="Margin"
//         />
//         <Button
//           type="button"
//           onClick={() => setIsExpanded(!isExpanded)}
//           size="icon"
//           variant="ghost"
//           className="col-span-1 size-7"
//         >
//           <ScanIcon size={14} className="size-3.5" />
//         </Button>
//         {isExpanded && (
//           <>
//             <PropertyInput
//               icon={BorderLeftIcon}
//               containerClassNames="col-span-2"
//               control={form.control}
//               name="value.left"
//               label="Margin left"
//             />
//             <PropertyInput
//               icon={BorderTopIcon}
//               containerClassNames="col-span-2"
//               control={form.control}
//               name="value.top"
//               label="Margin top"
//             />
//             <PropertyInput
//               icon={BorderRightIcon}
//               containerClassNames="col-span-2"
//               control={form.control}
//               name="value.right"
//               label="Margin right"
//             />
//             <PropertyInput
//               icon={BorderBottomIcon}
//               containerClassNames="col-span-2"
//               control={form.control}
//               name="value.bottom"
//               label="Margin bottom"
//             />
//           </>
//         )}
//       </form>
//     </Form>
//   );
// }

function PaddingForm() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="grid grid-cols-[repeat(4,2fr)_28px] gap-2">
      <MultiPropertyInput
        names={["paddingLeft", "paddingTop", "paddingRight", "paddingBottom"]}
        label="Padding"
        icon={PaddingIcon}
        containerClassNames="col-span-4"
      />
      <PropertyButton onClick={() => setIsExpanded(!isExpanded)} label="Expand">
        <ScanIcon size={14} className="size-3.5" />
      </PropertyButton>
      {isExpanded && (
        <>
          <PropertyInput
            icon={PaddingLeftIcon}
            containerClassNames="col-span-2"
            name="paddingLeft"
            label="Padding left"
          />
          <PropertyInput
            icon={PaddingTopIcon}
            containerClassNames="col-span-2"
            name="paddingTop"
            label="Padding top"
          />
          <PropertyInput
            icon={PaddingRightIcon}
            containerClassNames="col-span-2"
            name="paddingRight"
            label="Padding right"
          />
          <PropertyInput
            icon={PaddingBottomIcon}
            containerClassNames="col-span-2"
            name="paddingBottom"
            label="Padding bottom"
          />
        </>
      )}
    </div>
  );
}

function WidthForm({ className }: { className?: string }) {
  const { focusElementId } = useEditor();
  const { getValue, getPreviousValue, setValue } = useStyle();
  const [showMinWidth, setShowMinWidth] = useState(false);
  const [showMaxWidth, setShowMaxWidth] = useState(false);

  useEffect(() => {
    setShowMinWidth(false);
    setShowMaxWidth(false);
  }, [
    getValue("width"),
    getValue("minWidth"),
    getValue("maxWidth"),
    focusElementId,
  ]);

  function handleRemoveAuxWidth(name: Path<StyleSchema>) {
    if (name === "maxWidth") {
      setValue({ maxWidth: "none" });
      return setShowMaxWidth(false);
    }

    if (name === "minWidth") {
      setValue({ minWidth: "auto" });
      return setShowMinWidth(false);
    }
  }

  function WidthOptions() {
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
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={getValue("width") === "auto"}
            onClick={() => setValue({ width: "auto" })}
          >
            <BaselineIcon size={16} />
            <span>Auto</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue("width") === "fill-container"}
            onClick={() => setValue({ width: "fill-container" })}
          >
            <MoveHorizontalIcon size={16} />
            <span>Fill Container</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue("width") === "hug-content"}
            onClick={() => setValue({ width: "hug-content" })}
          >
            <ChevronsRightLeft size={16} />
            <span>Hug Content</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue("width") === "fill-screen"}
            onClick={() => setValue({ width: "fill-screen" })}
          >
            <LaptopMinimal size={16} />
            <span>Fill Screen</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setShowMinWidth(true);
              setValue({ minWidth: "auto" });
            }}
          >
            <FoldHorizontal size={16} />
            <span>Add min width</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setShowMaxWidth(true);
              setValue({ maxWidth: "none" });
            }}
          >
            <UnfoldHorizontal size={16} />
            <span>Add max width</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  function AuxWidthOptions({ name }: { name: keyof StyleSchema }) {
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
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={getValue(name) === "fill-container"}
            onClick={() => setValue({ [name]: "fill-container" })}
          >
            <MoveHorizontalIcon size={16} />
            <span>Fill Container</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue(name) === "hug-content"}
            onClick={() => setValue({ [name]: "hug-content" })}
          >
            <ChevronsRightLeft size={16} />
            <span>Hug Content</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue(name) === "fill-screen"}
            onClick={() => setValue({ [name]: "fill-screen" })}
          >
            <LaptopMinimal size={16} />
            <span>Fill Viewport</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleRemoveAuxWidth(name)}>
            <X size={16} />
            <span>Remove max width</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <PropertyInput
        icon={ChevronsLeftRightIcon}
        name="width"
        label="Width"
        rightElement={<WidthOptions />}
      />
      {(showMinWidth ||
        getValue("minWidth") !== "auto" ||
        (getPreviousValue("minWidth") !== undefined &&
          getPreviousValue("minWidth") !== "auto")) && (
        <PropertyInput
          icon={FoldHorizontal}
          name="minWidth"
          label="Min width"
          placeholder="Min W"
          disabled={getPreviousValue("minWidth") === "auto"}
          rightElement={<AuxWidthOptions name="minWidth" />}
        />
      )}
      {(showMaxWidth ||
        getValue("maxWidth") !== "none" ||
        (getPreviousValue("maxWidth") !== undefined &&
          getPreviousValue("maxWidth") !== "none")) && (
        <PropertyInput
          icon={UnfoldHorizontal}
          name="maxWidth"
          label="Max width"
          placeholder="Max W"
          disabled={getPreviousValue("maxWidth") === "none"}
          rightElement={<AuxWidthOptions name="maxWidth" />}
        />
      )}
    </div>
  );
}

function HeightForm({ className }: { className?: string }) {
  const { focusElementId } = useEditor();
  const { getValue, getPreviousValue, setValue } = useStyle();
  const [showMinHeight, setShowMinHeight] = useState(false);
  const [showMaxHeight, setShowMaxHeight] = useState(false);

  useEffect(() => {
    setShowMinHeight(false);
    setShowMaxHeight(false);
  }, [
    getValue("height"),
    getValue("minHeight"),
    getValue("maxHeight"),
    focusElementId,
  ]);

  function handleRemoveAuxHeight(name: Path<StyleSchema>) {
    if (name === "maxHeight") {
      setValue({ maxHeight: "none" });
      return setShowMaxHeight(false);
    }

    if (name === "minHeight") {
      setValue({ minHeight: "auto" });
      return setShowMinHeight(false);
    }
  }

  function HeightOptions() {
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
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={getValue("height") === "auto"}
            onClick={() => setValue({ height: "auto" })}
          >
            <BaselineIcon size={16} />
            <span>Auto</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue("height") === "fill-container"}
            onClick={() => setValue({ height: "fill-container" })}
          >
            <MoveVerticalIcon size={16} />
            <span>Fill Container</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue("height") === "hug-content"}
            onClick={() => setValue({ height: "hug-content" })}
          >
            <ChevronsDownUpIcon size={16} />
            <span>Hug Content</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue("height") === "fill-screen"}
            onClick={() => setValue({ height: "fill-screen" })}
          >
            <LaptopMinimal size={16} />
            <span>Fill Viewport</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setShowMinHeight(true);
              setValue({ minHeight: "auto" });
            }}
          >
            <FoldVertical size={16} />
            <span>Add min height</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setShowMaxHeight(true);
              setValue({ maxHeight: "none" });
            }}
          >
            <UnfoldVertical size={16} />
            <span>Add max height</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  function AuxHeightOptions({ name }: { name: keyof StyleSchema }) {
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
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={getValue(name) === "fill-container"}
            onClick={() => setValue({ [name]: "fill-container" })}
          >
            <MoveVerticalIcon size={16} />
            <span>Fill Container</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue(name) === "hug-content"}
            onClick={() => setValue({ [name]: "hug-content" })}
          >
            <ChevronsDownUpIcon size={16} />
            <span>Hug Content</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={getValue(name) === "fill-screen"}
            onClick={() => setValue({ [name]: "fill-screen" })}
          >
            <LaptopMinimal size={16} />
            <span>Fill Viewport</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleRemoveAuxHeight(name)}>
            <X size={16} />
            <span>Remove max height</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <PropertyInput
        icon={ChevronsUpDownIcon}
        rightElement={<HeightOptions />}
        name="height"
        label="Height"
      />
      {(showMinHeight ||
        getValue("minHeight") !== "auto" ||
        (getPreviousValue("minHeight") !== undefined &&
          getPreviousValue("minHeight") !== "auto")) && (
        <PropertyInput
          icon={FoldVertical}
          name="minHeight"
          label="Min height"
          placeholder="Min H"
          disabled={getPreviousValue("minHeight") === "auto"}
          rightElement={<AuxHeightOptions name="minHeight" />}
        />
      )}
      {(showMaxHeight ||
        getValue("maxHeight") !== "none" ||
        (getPreviousValue("maxHeight") !== undefined &&
          getPreviousValue("maxHeight") !== "none")) && (
        <PropertyInput
          icon={UnfoldVertical}
          name="maxHeight"
          label="Max height"
          placeholder="Max H"
          disabled={getPreviousValue("maxHeight") === "none"}
          rightElement={<AuxHeightOptions name="maxHeight" />}
        />
      )}
    </div>
  );
}

function DisplayForm({ className }: { className?: string }) {
  const { getValue, setValue } = useStyle();

  function handleSetDisplay(value: StyleSchema["display"]) {
    switch (value) {
      case "flex-col":
        setValue({
          display: "flex-col",
          justifyContent: "start",
          alignItems: "start",
          gapX: 0,
        });
        break;
      case "flex-row":
        setValue({
          display: "flex-row",
          justifyContent: "start",
          alignItems: "start",
          gapX: 0,
        });
        break;
      case "grid":
        setValue({
          display: "grid",
          justifyContent: "start",
          alignItems: "start",
          gapX: 0,
          gapY: 0,
          gridCols: 3,
        });
        break;
      case "inline":
        setValue({ display: "inline" });
        break;
      case "hidden":
        setValue({ display: "hidden" });
        break;
    }
  }

  return (
    <div className={cn("grid grid-cols-[repeat(4,2fr)_28px] gap-2", className)}>
      <Tabs
        value={getValue("display")}
        onValueChange={(value) =>
          handleSetDisplay(value as StyleSchema["display"])
        }
        className="col-span-4"
      >
        <TabsList className="w-full h-7">
          <TabsTrigger value="flex-col" className="py-0 rounded-sm">
            <FlexColIcon width={16} height={16} />
          </TabsTrigger>
          <TabsTrigger value="flex-row" className="py-0 rounded-sm">
            <FlexRowIcon width={16} height={16} />
          </TabsTrigger>
          <TabsTrigger value="grid" className="py-0 rounded-sm">
            <LayoutGridIcon size={16} />
          </TabsTrigger>
          <TabsTrigger value="inline" className="py-0 rounded-sm">
            <ALargeSmallIcon size={16} />
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <PropertyButton
        onClick={() => setValue({ display: "hidden" })}
        className={cn(getValue("display") === "hidden" && "bg-muted")}
        label="Hidden"
      >
        <EyeOffIcon size={14} />
      </PropertyButton>
      {getValue("display") !== "inline" && getValue("display") !== "hidden" && (
        <>
          <div className="col-span-2">
            {getValue("display") !== "grid" && (
              <FlexLayoutControl className="col-span-2" />
            )}
            {getValue("display") === "grid" && (
              <GridLayoutControl name="gridCols" className="col-span-2" />
            )}
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <PropertyInput
              icon={
                getValue("display") === "flex-col"
                  ? VerticalGapIcon
                  : HorizontalGapIcon
              }
              // defaultValue={0}
              name="gapX"
              label={
                getValue("display") === "flex-col"
                  ? "Vertical gap"
                  : "Horizontal gap"
              }
            />
            {getValue("display") === "grid" && (
              <PropertyInput
                icon={VerticalGapIcon}
                // defaultValue={0}
                name="gapY"
                label="Vertical gap"
              />
            )}
          </div>
          {getValue("display") === "flex-row" && (
            <PropertyButton
              onClick={() =>
                setValue({
                  flexWrap: getValue("flexWrap") === "wrap" ? "nowrap" : "wrap",
                })
              }
              label={getValue("flexWrap") === "wrap" ? "No wrap" : "Wrap"}
              className={cn(getValue("flexWrap") === "wrap" && "bg-muted")}
            >
              <WrapIcon width={14} height={14} />
            </PropertyButton>
          )}
          {getValue("display") === "grid" && <GridLayoutOptions />}
        </>
      )}
      <div className="col-span-4 flex items-center gap-2">
        <Checkbox
          checked={getValue("overflowY") === "hidden"}
          onCheckedChange={() =>
            setValue({
              overflowY: getValue("overflowY") === "hidden" ? "auto" : "hidden",
            })
          }
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <Label className="text-xs font-normal">Clip Content</Label>
      </div>
    </div>
  );
}

const useClick = () => {
  const lastClick = useRef(0);

  const handleClick = (
    onClick: (...args: unknown[]) => void,
    onDoubleClick: (...args: unknown[]) => void
  ) => {
    const now = Date.now();
    if (now - lastClick.current < 400) {
      onDoubleClick();
    } else {
      onClick();
    }
    lastClick.current = now;
  };

  return handleClick;
};

function FlexLayoutControl({ className }: { className?: string }) {
  const { getValue, setValue } = useStyle();
  const display = getValue("display");
  const isFlexCol = display === "flex-col";

  const justifyContent = getValue("justifyContent") ?? "start";
  const alignItems = getValue("alignItems") ?? "start";

  function columnPos(index: number): "start" | "center" | "end" {
    const mod = (index + 1) % 3;
    if (mod === 1) return "start";
    if (mod === 2) return "center";
    return "end";
  }

  function rowPos(index: number): "start" | "center" | "end" {
    if (index < 3) return "start";
    if (index < 6) return "center";
    return "end";
  }

  const iconAlign = (index: number) =>
    isFlexCol ? columnPos(index) : rowPos(index);
  const iconJustify = (index: number) =>
    isFlexCol ? rowPos(index) : columnPos(index);

  function isActive(index: number): boolean {
    return (
      iconJustify(index) === justifyContent && iconAlign(index) === alignItems
    );
  }

  function handleSetValue(index: number, isDoubleClick?: boolean) {
    if (isDoubleClick) {
      setValue({
        justifyContent: "space-between",
        alignItems: iconAlign(index),
      });
      return;
    }

    setValue({
      justifyContent: iconJustify(index),
      alignItems: iconAlign(index),
    });
  }

  const IconTypeObj = {
    start: isFlexCol ? AlignLeftIcon : AlignStartIcon,
    center: isFlexCol ? AlignCenterIcon : AlignMiddleIcon,
    end: isFlexCol ? AlignRightIcon : AlignEndIcon,
  };

  const handleClick = useClick();

  const FlexIcon = ({ index }: { index: number }) => {
    const Icon = IconTypeObj[iconAlign(index)];
    return (
      <div
        key={index}
        onClick={() =>
          handleClick(
            () => handleSetValue(index),
            () => handleSetValue(index, true)
          )
        }
        className="flex items-center justify-center group"
      >
        {!isActive(index) && (
          <Dot size={16} className="text-muted-foreground group-hover:hidden" />
        )}
        <Icon
          size={16}
          width={16}
          height={16}
          className={cn(
            "text-blue-600",
            !isActive(index) &&
              "hidden group-hover:block group-hover:text-blue-600/50"
          )}
        />
      </div>
    );
  };

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const JustifyIconTypeObj = {
    start: {
      start: isFlexCol ? MinusIcon : VerticalDashIcon,
      center: isFlexCol ? SmallDashStartIcon : VerticalSmallDashStartIcon,
      end: isFlexCol ? MinusIcon : VerticalDashIcon,
    },
    center: {
      start: isFlexCol ? MinusIcon : VerticalDashIcon,
      center: isFlexCol ? SmallDashCenterIcon : VerticalSmallDashCenterIcon,
      end: isFlexCol ? MinusIcon : VerticalDashIcon,
    },
    end: {
      start: isFlexCol ? MinusIcon : VerticalDashIcon,
      center: isFlexCol ? SmallDashEndIcon : VerticalSmallDashEndIcon,
      end: isFlexCol ? MinusIcon : VerticalDashIcon,
    },
  };

  function JustifyIcon({ index }: { index: number }) {
    const Icon = JustifyIconTypeObj[iconAlign(index)][iconJustify(index)];
    const isHovered =
      activeIndex && iconAlign(index) === iconAlign(activeIndex);
    const isSelected = iconAlign(index) === alignItems;
    return (
      <div
        onClick={() =>
          handleClick(
            () => handleSetValue(index, true),
            () => handleSetValue(index)
          )
        }
        onMouseEnter={() => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
        className={cn("flex items-center justify-center")}
      >
        {!isSelected && !isHovered && (
          <Dot size={16} className="text-muted-foreground" />
        )}
        <Icon
          width={16}
          height={16}
          size={16}
          className={cn(
            "text-blue-600",
            iconAlign(index) !== alignItems && "hidden",
            isHovered && !isSelected && "block text-blue-600/50"
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("grid grid-cols-3 h-[68px] bg-muted rounded-md", className)}
    >
      {Array.from({ length: 9 }).map((_, index) =>
        justifyContent === "space-between" ? (
          <JustifyIcon key={index} index={index} />
        ) : (
          <FlexIcon key={index} index={index} />
        )
      )}
    </div>
  );
}

function GridLayoutControl({
  name,
  className,
}: {
  name: "gridCols";
  className?: string;
}) {
  const { getValue, setValue } = useStyle();

  return (
    <div
      className={cn(
        "relative flex h-full gap-0.5 bg-muted border-2 border-muted rounded-md overflow-hidden",
        className
      )}
    >
      {Array.from({ length: getValue(name) }).map((_, index) => (
        <div className="bg-background flex-1" key={index} />
      ))}
      <div className="absolute inset-0 flex bg-muted/20">
        <button
          onClick={() => setValue({ [name]: Math.max(getValue(name) - 1, 1) })}
          className="flex-1 flex items-center justify-center"
        >
          <MinusIcon size={16} />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm">{getValue(name)}</span>
        </div>
        <button
          onClick={() => setValue({ [name]: getValue(name) + 1 })}
          className="flex-1 flex items-center justify-center"
        >
          <PlusIcon size={16} />
        </button>
      </div>
    </div>
  );
}

function GridLayoutOptions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <PropertyButton label="Grid layout options">
          <Settings2Icon size={14} />
        </PropertyButton>
      </PopoverTrigger>
      <PopoverContent className="w-56" side="left" sideOffset={203}>
        <div className="grid grid-cols-3 items-center gap-2">
          <label className="text-sm">Place</label>
          <FlexLayoutControl className="col-span-2" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
