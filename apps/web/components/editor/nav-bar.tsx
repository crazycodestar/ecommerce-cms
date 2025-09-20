"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Globe,
  Play,
  ChevronDown,
  Undo2,
  Redo2,
} from "lucide-react";
import Link from "next/link";
import type { Size } from "@/hooks/use-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEditor } from "@/hooks/use-editor";

export function Navbar({
  url,
  onPublish,
  isPending,
  view,
  setView,
}: {
  url: string;
  onPublish: () => void;
  isPending: boolean;
  view: Size;
  setView: (view: Size) => void;
}) {
  const { undo, redo, historyIndex, history } = useEditor();
  const canUndo = historyIndex > -1;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="sticky top-0 z-10 bg-neutral-100 grid grid-cols-3 gap-2 min-h-12 h-12 items-center px-2">
      {/* <pre className="absolute top-0 right-0 bg-white">
        {JSON.stringify(history, null, 2)}
        {JSON.stringify(historyIndex, null, 2)}
      </pre> */}
      <div className="col-span-1 flex gap-1.5">
        <Button
          onClick={undo}
          variant="outline"
          size="icon"
          disabled={!canUndo}
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          onClick={redo}
          variant="outline"
          size="icon"
          disabled={!canRedo}
        >
          <Redo2 className="size-4" />
        </Button>
      </div>
      <div className="col-span-1 flex justify-center">
        <div className="inline-flex">
          <Button
            variant={view === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("desktop")}
            aria-label="Desktop view"
            className="rounded-r-none"
          >
            <Monitor className="size-4" />
          </Button>
          <Button
            variant={view === "tablet" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("tablet")}
            aria-label="Tablet view"
            className="rounded-none border-l-0"
          >
            <Tablet className="size-4" />
          </Button>
          <Button
            variant={view === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("mobile")}
            aria-label="Mobile view"
            className="rounded-l-none border-l-0"
          >
            <Smartphone className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <div className="group flex items-center gap-0.5">
            <Button
              asChild
              size="icon"
              variant="ghost"
              className="w-7 rounded-r-none group-hover:bg-neutral-200 hover:bg-neutral-200"
            >
              <Link href={url} target="_blank">
                <Play className="size-4" />
              </Link>
            </Button>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-l-none w-[22px] group-hover:bg-neutral-200 hover:bg-neutral-200"
              >
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link
                href={url}
                target="_blank"
                className="flex items-center gap-2"
              >
                <Eye className="size-4" />
                Preview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={url}
                target="_blank"
                className="flex items-center gap-2"
              >
                <Globe className="size-4" />
                Live
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={onPublish}
          disabled={isPending}
          className="flex items-center gap-2"
          size="sm"
        >
          {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          Publish
        </Button>
      </div>
    </div>
  );
}
