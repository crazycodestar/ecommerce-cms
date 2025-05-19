"use client";

import Placeholder from "@tiptap/extension-placeholder";
import {
  EditorContent,
  EditorProvider,
  useCurrentEditor,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form";

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
    <div className="border border-border ">
      <EditorProvider
        extensions={extensions}
        editorContainerProps={{ className: "p-4 editor-container" }}
      >
        {children}
      </EditorProvider>
    </div>
  );
};
