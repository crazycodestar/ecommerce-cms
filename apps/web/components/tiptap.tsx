"use client";

import {
  TooltipContent as TooltipContentPrimitive,
  Tooltip as TooltipPrimitive,
  TooltipProvider,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@/components/ui/tooltip";
import Placeholder from "@tiptap/extension-placeholder";
import {
  EditorContent,
  EditorProvider,
  useCurrentEditor,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListCollapse,
  Pilcrow,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import React from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { Button } from "./ui/button";

interface TooltipInterface
  extends React.ComponentProps<typeof TooltipPrimitive> {
  children: React.ReactNode;
  content: string;
}

const Tooltip = ({ children, content, ...props }: TooltipInterface) => {
  return (
    <TooltipPrimitive {...props}>
      <TooltipTriggerPrimitive asChild>{children}</TooltipTriggerPrimitive>
      <TooltipContentPrimitive>
        <p>{content}</p>
      </TooltipContentPrimitive>
    </TooltipPrimitive>
  );
};

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="control-group p-4 border-b">
      <div className="button-group flex gap-2 items-center flex-wrap">
        <TooltipProvider>
          <div className="flex gap-1">
            <Tooltip content="Undo">
              <Button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                variant="outline"
                size="icon"
                type="button"
              >
                <Undo2 className="size-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Redo">
              <Button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                variant="outline"
                size="icon"
                type="button"
              >
                <Redo2 className="size-4" />
              </Button>
            </Tooltip>
          </div>
          <ToggleGroup
            variant="outline"
            value={[
              editor.isActive("bold") ? "bold" : "",
              editor.isActive("italic") ? "italic" : "",
              editor.isActive("strike") ? "strike" : "",
            ]}
            type="multiple"
          >
            <Tooltip content="Bold">
              <ToggleGroupItem
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "bg-muted" : ""}
                value="bold"
                aria-label="Toggle bold"
              >
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
            </Tooltip>
            <Tooltip content="Italic">
              <ToggleGroupItem
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "bg-muted" : ""}
                value="italic"
                aria-label="Toggle italic"
              >
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
            </Tooltip>
            <Tooltip content="Strike">
              <ToggleGroupItem
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? "bg-muted" : ""}
                value="strike"
                aria-label="Toggle strike"
              >
                <Strikethrough className="h-4 w-4" />
              </ToggleGroupItem>
            </Tooltip>
          </ToggleGroup>
          <ToggleGroup
            variant="outline"
            value={
              editor.isActive("paragraph")
                ? "paragraph"
                : editor.isActive("heading", { level: 1 })
                  ? "h1"
                  : editor.isActive("heading", { level: 2 })
                    ? "h2"
                    : editor.isActive("heading", { level: 3 })
                      ? "h3"
                      : ""
            }
            type="single"
          >
            <Tooltip content="Paragraph">
              <ToggleGroupItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive("paragraph") ? "bg-muted" : ""}
                value="paragraph"
                aria-label="Toggle paragraph"
              >
                <Pilcrow className="h-4 w-4" />
              </ToggleGroupItem>
            </Tooltip>

            <Tooltip content="Heading 1">
              <ToggleGroupItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={
                  editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
                }
                value="h1"
                aria-label="Toggle heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </ToggleGroupItem>
            </Tooltip>

            <Tooltip content="Heading 2">
              <ToggleGroupItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={
                  editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
                }
                value="h2"
                aria-label="Toggle heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </ToggleGroupItem>
            </Tooltip>

            <Tooltip content="Heading 3">
              <ToggleGroupItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={
                  editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""
                }
                value="h3"
                aria-label="Toggle heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </ToggleGroupItem>
            </Tooltip>
          </ToggleGroup>
          <ToggleGroup
            variant="outline"
            value={
              editor.isActive("bulletList")
                ? "bulletList"
                : editor.isActive("orderedList")
                  ? "orderedList"
                  : ""
            }
            type="single"
          >
            <Tooltip content="Bullet List">
              <ToggleGroupItem
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? "bg-muted" : ""}
                value="bulletList"
                aria-label="Toggle bullet list"
              >
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </Tooltip>
            <Tooltip content="Ordered List">
              <ToggleGroupItem
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "bg-muted" : ""}
                value="orderedList"
                aria-label="Toggle ordered list"
              >
                <ListCollapse className="size-4" />
              </ToggleGroupItem>
            </Tooltip>
          </ToggleGroup>
        </TooltipProvider>
      </div>
    </div>
  );
};

const extensions = [
  //   Color.configure({ types: [TextStyle.name, ListItem.name] }),
  Placeholder.configure({
    placeholder: "Write Something ...",
  }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
];
interface RichTextFormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export const RichTextFormInput = <T extends FieldValues>({
  control,
  name,
}: RichTextFormInputProps<T>) => {
  const { editor } = useCurrentEditor();
  const { field } = useController({
    control,
    name,
  });

  const value = React.useRef(field.value);
  React.useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(value.current);
  }, [editor]);

  editor?.on("update", () => {
    const isEmpty = !editor.state.doc.textContent.length;
    field.onChange(isEmpty ? "" : editor.getHTML());
  });

  return null;
};

export const TipTapContent = ({ content }: { content: string }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content,
    editable: false,
  });

  return (
    <EditorContent
      contentEditable={false}
      editor={editor}
      className="editor-container"
    />
  );
};

export const Tiptap = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="border rounded-md">
      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        editorContainerProps={{ className: "p-4 editor-container" }}
      >
        {children}
      </EditorProvider>
    </div>
  );
};
