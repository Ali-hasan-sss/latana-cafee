"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { addBlogPost, deleteBlogPost, reorderBlogPosts } from "@/app/actions/blog-posts-admin";
import { BlogPostEditModal } from "@/components/admin/BlogPostEditModal";
import type { BlogPostDocument, BlogPostsDocument } from "@/lib/cms/blog-cms-types";

type Props = {
  initialPosts: BlogPostsDocument;
};

export function BlogPostsAdminPanel({ initialPosts }: Props) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<BlogPostsDocument>(initialPosts);
  const [editPost, setEditPost] = useState<BlogPostDocument | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  /** Post id created via "Add article" that has not been successfully saved yet — discard on cancel. */
  const pendingDiscardPostIdRef = useRef<string | null>(null);

  useEffect(() => {
    setSnapshot(initialPosts);
  }, [initialPosts]);

  const removePostFromSnapshot = useCallback((id: string) => {
    setSnapshot((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== id) }));
  }, []);

  const onSaved = useCallback(() => {
    pendingDiscardPostIdRef.current = null;
    router.refresh();
  }, [router]);

  const discardPendingIfAny = useCallback(
    (exceptId?: string) => {
      const pending = pendingDiscardPostIdRef.current;
      if (!pending || pending === exceptId) return;
      pendingDiscardPostIdRef.current = null;
      void deleteBlogPost(pending).then((res) => {
        if (res.ok) removePostFromSnapshot(pending);
        router.refresh();
      });
    },
    [removePostFromSnapshot, router],
  );

  const openForEdit = useCallback(
    (p: BlogPostDocument) => {
      discardPendingIfAny(p.id);
      const pending = pendingDiscardPostIdRef.current;
      if (!pending || pending !== p.id) {
        pendingDiscardPostIdRef.current = null;
      }
      setEditPost(p);
    },
    [discardPendingIfAny],
  );

  const handleModalClose = useCallback(() => {
    const id = editPost?.id;
    const pending = pendingDiscardPostIdRef.current;
    pendingDiscardPostIdRef.current = null;
    if (id && pending === id) {
      void deleteBlogPost(id).then((res) => {
        if (res.ok) removePostFromSnapshot(id);
        router.refresh();
      });
    }
    setEditPost(null);
  }, [editPost?.id, removePostFromSnapshot, router]);

  const movePost = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= snapshot.posts.length) return;
    setReorderError(null);
    const ids = snapshot.posts.map((p) => p.id);
    const tmp = ids[index]!;
    ids[index] = ids[next]!;
    ids[next] = tmp;
    const res = await reorderBlogPosts(ids);
    if (!res.ok) {
      setReorderError(res.error ?? t("common.couldNotReorder"));
      return;
    }
    onSaved();
  };

  const handleAdd = async () => {
    discardPendingIfAny();
    const res = await addBlogPost();
    if (!res.ok) {
      alert(res.error ?? t("common.couldNotAdd"));
      return;
    }
    pendingDiscardPostIdRef.current = res.post.id;
    setSnapshot((prev) => ({ ...prev, posts: [...prev.posts, res.post] }));
    setEditPost(res.post);
  };

  const handleDelete = async (p: BlogPostDocument) => {
    const title = p.en.title || p.slug;
    if (!window.confirm(t("panels.blog.deleteConfirm", { title }))) return;
    const res = await deleteBlogPost(p.id);
    if (!res.ok) {
      alert(res.error ?? t("common.deleteFailed"));
      return;
    }
    onSaved();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("panels.blog.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.blog.lead")}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleAdd()}
          className="shrink-0 rounded-lg border border-brand-primary/60 bg-brand-primary/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary transition hover:bg-brand-primary/25"
        >
          {t("panels.blog.addPost")}
        </button>
      </div>

      {reorderError ? (
        <p className="text-sm text-red-400" role="alert">
          {reorderError}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {snapshot.posts.map((p, i) => {
          const cover =
            (p.coverImageSrc ?? "").trim() ||
            (p.images?.[0] ?? "").trim() ||
            "/images/2f0ab6f7-bfb7-44bd-9d16-96419ba2020f.jpg.jpeg";
          const excerpt = (p.en.excerpt ?? "").trim() || t("common.dash");
          return (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-black/30 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            >
              <div
                className="aspect-[16/10] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${cover})` }}
                role="img"
                aria-label=""
              />
              <div className="flex flex-1 flex-col p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">{p.slug}</p>
                <p className="mt-0.5 text-[10px] text-white/35">
                  {Number.isFinite(Date.parse(p.publishedAt))
                    ? new Date(p.publishedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : t("common.dash")}
                </p>
                <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-white">
                  {p.en.title || t("common.dash")}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-white/55">{excerpt}</p>
                <p className="mt-2 text-[10px] text-white/35">
                  {t("common.commentsShort")}: {p.comments}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => void movePost(i, -1)}
                    className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/5 disabled:opacity-35"
                    aria-label={t("common.moveUp")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i >= snapshot.posts.length - 1}
                    onClick={() => void movePost(i, 1)}
                    className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/5 disabled:opacity-35"
                    aria-label={t("common.moveDown")}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => openForEdit(p)}
                    className="flex-1 rounded-lg border border-brand-primary/60 bg-brand-primary/15 px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary/25"
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(p)}
                    className="rounded-lg border border-red-500/35 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <BlogPostEditModal
        open={!!editPost}
        post={editPost}
        onClose={handleModalClose}
        onSaved={onSaved}
      />
    </div>
  );
}
