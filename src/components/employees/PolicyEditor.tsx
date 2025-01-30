import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Button } from "../ui/button";
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Quote,
  Undo,
  Redo,
  UnderlineIcon,
  ListOrdered,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PolicyEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function PolicyEditor({ content, onChange }: PolicyEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your policy content...",
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-lg">
      <div className="border-b p-2 flex flex-wrap gap-1">
        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(editor.isActive("bold") && "bg-muted")}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(editor.isActive("italic") && "bg-muted")}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(editor.isActive("underline") && "bg-muted")}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(editor.isActive("heading", { level: 1 }) && "bg-muted")}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(editor.isActive("heading", { level: 2 }) && "bg-muted")}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(editor.isActive("heading", { level: 3 }) && "bg-muted")}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(editor.isActive("bulletList") && "bg-muted")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(editor.isActive("orderedList") && "bg-muted")}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={cn(editor.isActive({ textAlign: "left" }) && "bg-muted")}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={cn(editor.isActive({ textAlign: "center" }) && "bg-muted")}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={cn(editor.isActive({ textAlign: "right" }) && "bg-muted")}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 mr-4">
          <Button variant="ghost" size="sm" onClick={setLink} className={cn(editor.isActive("link") && "bg-muted")}>
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(editor.isActive("blockquote") && "bg-muted")}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(editor.isActive("codeBlock") && "bg-muted")}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <style>{`
        .ProseMirror {
          padding: 1rem;
          min-height: 200px;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }

        .ProseMirror h1 {
            font-size: 2em;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 0.5em;
            color: #000;
        }

        .ProseMirror h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin-top: 0.83em;
            margin-bottom: 0.5em;
            color: #000;
        }

        .ProseMirror h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 0.5em;
            color: #000;
        }

        .ProseMirror > * + * {
          margin-top: 0.75em;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding: 0 1rem;
        }
        .ProseMirror blockquote {
          border-left: 2px solid #e2e8f0;
          margin-left: 0;
          margin-right: 0;
          padding-left: 1rem;
        }
        .ProseMirror code {
          background-color: #f1f5f9;
          border-radius: 0.25rem;
          padding: 0.25rem;
        }
        .ProseMirror pre {
          background: #0d0d0d;
          border-radius: 0.5rem;
          color: #fff;
          font-family: monospace;
          padding: 0.75rem 1rem;
        }
        .ProseMirror pre code {
          background: none;
          color: inherit;
          font-size: 0.8rem;
          padding: 0;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #64748b;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      <EditorContent editor={editor} className="overflow-x-auto" />
    </div>
  );
}
