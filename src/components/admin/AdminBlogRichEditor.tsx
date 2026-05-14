"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

const toolBtn =
  "rounded px-2 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 data-[active=true]:bg-brand-primary/25 data-[active=true]:text-brand-primary disabled:opacity-30";

const EMOJIS = [
  "😀",
  "😊",
  "😍",
  "🥰",
  "😎",
  "🤩",
  "😅",
  "😇",
  "🙏",
  "👍",
  "👏",
  "💪",
  "🔥",
  "✨",
  "💫",
  "⭐",
  "🌟",
  "❤️",
  "💛",
  "💚",
  "☕",
  "🍵",
  "🧁",
  "🍰",
  "🥐",
  "🌿",
  "🍊",
  "🍋",
  "📷",
  "📌",
  "✍️",
  "📝",
  "💬",
  "🎉",
  "🎊",
  "🇩🇪",
  "🇸🇦",
  "🇪🇬",
  "☀️",
  "🌙",
  "🌸",
  "🍀",
  "✅",
  "💡",
  "📚",
  "🎵",
  "☁️",
  "⛅",
  "🙌",
  "🤝",
  "💼",
];

function Toolbar({ editor }: { editor: Editor | null }) {
  const t = useTranslations("adminUi");

  if (!editor) {
    return <div className="h-9 rounded-t-lg border border-white/12 border-b-0 bg-black/50" />;
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(t("richEditor.linkPrompt"), prev ?? t("richEditor.linkDefault"));
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 rounded-t-lg border border-white/12 border-b-0 bg-black/50 px-2 py-1.5">
      <button
        type="button"
        className={toolBtn}
        data-active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </button>
      <button
        type="button"
        className={toolBtn}
        data-active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </button>
      <button
        type="button"
        className={toolBtn}
        data-active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        U
      </button>
      <span className="mx-1 w-px self-stretch bg-white/15" aria-hidden />
      <button
        type="button"
        className={toolBtn}
        data-active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type="button"
        className={toolBtn}
        data-active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </button>
      <span className="mx-1 w-px self-stretch bg-white/15" aria-hidden />
      <button
        type="button"
        className={toolBtn}
        data-active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        {t("richEditor.bulletList")}
      </button>
      <button
        type="button"
        className={toolBtn}
        data-active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        {t("richEditor.orderedList")}
      </button>
      <button
        type="button"
        className={toolBtn}
        data-active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        “”
      </button>
      <span className="mx-1 w-px self-stretch bg-white/15" aria-hidden />
      <button type="button" className={toolBtn} onClick={() => setLink()}>
        {t("richEditor.link")}
      </button>
      <span className="mx-1 w-px self-stretch bg-white/15" aria-hidden />
      <button type="button" className={toolBtn} onClick={() => editor.chain().focus().undo().run()}>
        {t("richEditor.undo")}
      </button>
      <button type="button" className={toolBtn} onClick={() => editor.chain().focus().redo().run()}>
        {t("richEditor.redo")}
      </button>
    </div>
  );
}

function EmojiStrip({ editor }: { editor: Editor | null }) {
  const t = useTranslations("adminUi");

  if (!editor) return null;
  return (
    <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto border border-white/10 border-t-0 bg-black/40 px-2 py-2">
      <span className="w-full text-[10px] font-medium uppercase tracking-wider text-white/45">
        {t("richEditor.emoji")}
      </span>
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          className="rounded px-1.5 py-0.5 text-lg leading-none transition hover:bg-white/10"
          onClick={() => editor.chain().focus().insertContent(e).run()}
          aria-label={t("richEditor.insertEmoji", { emoji: e })}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function AdminBlogRichEditor({ value, onChange, placeholder }: Props) {
  const t = useTranslations("adminUi");
  const ph = placeholder ?? t("richEditor.defaultPlaceholder");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Placeholder.configure({ placeholder: ph }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] px-3 py-2 text-sm leading-relaxed text-white outline-none focus:outline-none [&_a]:text-brand-primary [&_a]:underline [&_blockquote]:border-s-2 [&_blockquote]:border-white/25 [&_blockquote]:ps-3 [&_blockquote]:text-white/80 [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const cur = editor.getHTML();
    if (value !== cur) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="admin-blog-editor overflow-hidden rounded-b-lg rounded-t-none border border-white/12 bg-black/35">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <EmojiStrip editor={editor} />
    </div>
  );
}
