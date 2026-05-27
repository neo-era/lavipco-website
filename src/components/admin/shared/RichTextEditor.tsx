"use client";

/**
 * Rich text editor dùng Tiptap.
 *
 * Toolbar tối giản: bold, italic, h2/h3, list, link, image, blockquote, code.
 * Output HTML — sanitize phía server hoặc khi render ở public page (lib/sanitize.ts).
 *
 * Props:
 *  - value: HTML string
 *  - onChange: (html: string) => void
 *  - placeholder
 */
import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pilcrow,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Bỏ heading mặc định để config riêng
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-brand-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-md",
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[280px] px-4 py-3 [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (vd form.reset)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-[320px] rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground",
          className,
        )}
      >
        Đang tải editor...
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkOpen, setLinkOpen] = React.useState(false);

  function handleLink() {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  }

  function handleImage() {
    const url = window.prompt("URL hình ảnh:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        label="Hoàn tác"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        label="Làm lại"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        active={editor.isActive("paragraph")}
        label="Đoạn văn"
      >
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        label="H2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        label="H3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Đậm"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Nghiêng"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label="Gạch ngang"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label="Code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Ordered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Trích dẫn"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        label="Trái"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        label="Giữa"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        label="Phải"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <Separator />

      <div className="relative">
        <ToolbarButton
          onClick={() => {
            const current = editor.getAttributes("link").href as string | undefined;
            setLinkUrl(current ?? "");
            setLinkOpen((o) => !o);
          }}
          active={editor.isActive("link")}
          label="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        {linkOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-md border bg-popover p-1 shadow-md">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="h-8 w-64 rounded-md border bg-background px-2 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLink();
                }
                if (e.key === "Escape") setLinkOpen(false);
              }}
            />
            <Button type="button" size="sm" onClick={handleLink}>
              {linkUrl ? "OK" : "Bỏ link"}
            </Button>
          </div>
        )}
      </div>
      <ToolbarButton onClick={handleImage} label="Hình ảnh">
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30",
        active && "bg-brand-primary/10 text-brand-primary",
      )}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span className="mx-1 h-6 w-px bg-border" aria-hidden />;
}
