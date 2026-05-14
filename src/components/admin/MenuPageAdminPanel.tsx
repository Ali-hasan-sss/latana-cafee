"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { saveMenuPageSettings } from "@/app/actions/menu-page-settings-admin";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { AdminModal } from "@/components/admin/AdminModal";
import { MenuPageHero } from "@/components/sections/MenuPageHero";
import { MenuPricingSection } from "@/components/sections/MenuPricingSection";
import type { MenuPageCmsDocument } from "@/lib/cms/menu-page-cms-types";
import type { LocalizedString } from "@/lib/menu-page-i18n";

type Props = {
  initial: MenuPageCmsDocument;
  defaultItemImage: string;
};

function newItem(image: string): MenuPageCmsDocument["pricingColumns"][number]["items"][number] {
  return {
    image,
    price: "0.00",
    name: { en: "", ar: "", de: "" },
    desc: { en: "", ar: "", de: "" },
  };
}

function emptyTitles(): LocalizedString {
  return { en: "", ar: "", de: "" };
}

export function MenuPageAdminPanel({ initial, defaultItemImage }: Props) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const [draft, setDraft] = useState<MenuPageCmsDocument>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<"en" | "ar" | "de">("en");
  const [catModalId, setCatModalId] = useState<string | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryTitles, setNewCategoryTitles] = useState<LocalizedString>(() => emptyTitles());
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);
  const [itemModal, setItemModal] = useState<{ colId: string; index: number } | null>(null);
  const [addItemColId, setAddItemColId] = useState<string | null>(null);
  const [newItemForm, setNewItemForm] = useState(() => newItem(defaultItemImage));
  const [addItemError, setAddItemError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(initial);
    setOk(false);
  }, [initial]);

  const catModalCol = useMemo(
    () => (catModalId ? draft.pricingColumns.find((c) => c.id === catModalId) : null),
    [catModalId, draft.pricingColumns],
  );

  const itemModalData = useMemo(() => {
    if (!itemModal) return null;
    const col = draft.pricingColumns.find((c) => c.id === itemModal.colId);
    const item = col?.items[itemModal.index];
    if (!col || !item) return null;
    return { col, item };
  }, [draft.pricingColumns, itemModal]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setOk(false);
    const res = await saveMenuPageSettings(draft);
    setSaving(false);
    if (!res.ok) {
      if (res.errorKey) {
        setError(t(`panels.menuPage.errors.${res.errorKey}`));
      } else {
        setError(res.error ?? t("common.saveFailed"));
      }
      return;
    }
    setOk(true);
    router.refresh();
  }, [draft, router, t]);

  const updateColumn = (colId: string, patch: Partial<MenuPageCmsDocument["pricingColumns"][number]>) => {
    setDraft((d) => ({
      ...d,
      pricingColumns: d.pricingColumns.map((c) => (c.id === colId ? { ...c, ...patch } : c)),
    }));
  };

  const openAddCategoryModal = () => {
    setError(null);
    setAddCategoryError(null);
    setNewCategoryTitles(emptyTitles());
    setAddCategoryOpen(true);
  };

  const confirmAddCategory = () => {
    if (!newCategoryTitles.en.trim() && !newCategoryTitles.ar.trim() && !newCategoryTitles.de.trim()) {
      setAddCategoryError(t("panels.menuPage.errors.categoryTitle"));
      return;
    }
    setAddCategoryError(null);
    const id = typeof crypto !== "undefined" ? crypto.randomUUID() : `cat-${Date.now()}`;
    setDraft((d) => ({
      ...d,
      pricingColumns: [
        ...d.pricingColumns,
        {
          id,
          title: {
            en: newCategoryTitles.en.trim(),
            ar: newCategoryTitles.ar.trim(),
            de: newCategoryTitles.de.trim(),
          },
          items: [],
        },
      ],
    }));
    setAddCategoryOpen(false);
    setNewCategoryTitles(emptyTitles());
    setAddCategoryError(null);
  };

  const deleteCategory = (colId: string) => {
    if (!window.confirm(t("panels.menuPage.deleteCategoryConfirm"))) return;
    setDraft((d) => ({ ...d, pricingColumns: d.pricingColumns.filter((c) => c.id !== colId) }));
  };

  const moveCategory = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= draft.pricingColumns.length) return;
    setDraft((d) => {
      const cols = [...d.pricingColumns];
      const tmp = cols[index]!;
      cols[index] = cols[j]!;
      cols[j] = tmp;
      return { ...d, pricingColumns: cols };
    });
  };

  const openAddItemModal = (colId: string) => {
    setError(null);
    setAddItemError(null);
    setNewItemForm(newItem(defaultItemImage));
    setAddItemColId(colId);
  };

  const confirmAddItem = () => {
    if (!addItemColId) return;
    const img = newItemForm.image.trim();
    if (!img) {
      setAddItemError(t("panels.menuPage.errors.itemImage"));
      return;
    }
    setAddItemError(null);
    const payload = {
      ...newItemForm,
      image: img,
      price: (newItemForm.price ?? "").trim() || "0.00",
      name: {
        en: (newItemForm.name.en ?? "").trim(),
        ar: (newItemForm.name.ar ?? "").trim(),
        de: (newItemForm.name.de ?? "").trim(),
      },
      desc: {
        en: (newItemForm.desc.en ?? "").trim(),
        ar: (newItemForm.desc.ar ?? "").trim(),
        de: (newItemForm.desc.de ?? "").trim(),
      },
    };
    setDraft((d) => ({
      ...d,
      pricingColumns: d.pricingColumns.map((c) =>
        c.id === addItemColId ? { ...c, items: [...c.items, payload] } : c,
      ),
    }));
    setAddItemColId(null);
    setNewItemForm(newItem(defaultItemImage));
    setAddItemError(null);
  };

  const deleteItem = (colId: string, itemIndex: number) => {
    if (!window.confirm(t("panels.menuPage.deleteItemConfirm"))) return;
    setDraft((d) => ({
      ...d,
      pricingColumns: d.pricingColumns.map((c) =>
        c.id === colId ? { ...c, items: c.items.filter((_, i) => i !== itemIndex) } : c,
      ),
    }));
  };

  const moveItem = (colId: string, itemIndex: number, dir: -1 | 1) => {
    setDraft((d) => ({
      ...d,
      pricingColumns: d.pricingColumns.map((c) => {
        if (c.id !== colId) return c;
        const j = itemIndex + dir;
        if (j < 0 || j >= c.items.length) return c;
        const items = [...c.items];
        const tmp = items[itemIndex]!;
        items[itemIndex] = items[j]!;
        items[j] = tmp;
        return { ...c, items };
      }),
    }));
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-white">{t("panels.menuPage.title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.menuPage.lead")}</p>
      </div>

      <section className="rounded-xl border border-white/10 bg-black/20 p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">{t("panels.menuPage.heroSection")}</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="max-w-md">
            <AdminFileUpload
              label={t("panels.menuPage.heroBgLabel")}
              value=""
              onChange={(url) => setDraft((d) => ({ ...d, heroBackground: url }))}
              hint={t("panels.menuPage.heroBgHint")}
            />
            {draft.heroBackground ? (
              <p className="mt-2 text-[10px] text-white/40">{draft.heroBackground}</p>
            ) : null}
          </div>
          <div className="space-y-4">
            {(["title", "breadcrumbHome", "breadcrumbCurrent"] as const).map((field) => (
              <div key={field} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  {t(`panels.menuPage.heroField.${field}`)}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["en", "ar", "de"] as const).map((loc) => (
                    <label key={loc} className="block text-xs">
                      <span className="text-white/45">{loc.toUpperCase()}</span>
                      <input
                        type="text"
                        value={draft.hero[field][loc]}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            hero: {
                              ...d.hero,
                              [field]: { ...d.hero[field], [loc]: e.target.value },
                            },
                          }))
                        }
                        className="mt-1 w-full rounded border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white/80">{t("panels.menuPage.categoriesSection")}</h2>
        <button
          type="button"
          onClick={openAddCategoryModal}
          className="rounded-lg border border-brand-primary/60 bg-brand-primary/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary transition hover:bg-brand-primary/25"
        >
          {t("panels.menuPage.addCategory")}
        </button>
      </div>

      <div className="space-y-6">
        {draft.pricingColumns.map((col, ci) => (
          <div
            key={col.id}
            className="rounded-xl border border-white/10 bg-black/20 p-4 md:p-5"
          >
            <div className="flex flex-col gap-3 border-b border-white/10 pb-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">{col.id}</p>
                <p className="mt-1 truncate text-sm font-medium text-white">
                  {col.title.en || col.title.ar || col.title.de || t("common.dash")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalId(col.id)}
                  className="rounded border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/5"
                >
                  {t("panels.menuPage.editCategory")}
                </button>
                <button
                  type="button"
                  onClick={() => openAddItemModal(col.id)}
                  className="rounded border border-brand-primary/50 px-2 py-1 text-xs text-brand-primary hover:bg-brand-primary/10"
                >
                  {t("panels.menuPage.addItem")}
                </button>
                <button
                  type="button"
                  disabled={ci === 0}
                  onClick={() => moveCategory(ci, -1)}
                  className="rounded border border-white/15 px-2 py-1 text-xs disabled:opacity-30"
                >
                  {t("common.up")}
                </button>
                <button
                  type="button"
                  disabled={ci === draft.pricingColumns.length - 1}
                  onClick={() => moveCategory(ci, 1)}
                  className="rounded border border-white/15 px-2 py-1 text-xs disabled:opacity-30"
                >
                  {t("common.down")}
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory(col.id)}
                  className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-white/10">
              {col.items.map((it, ii) => (
                <li key={`${col.id}-${ii}`} className="flex flex-wrap items-center gap-3 py-3">
                  <div
                    className="h-14 w-16 shrink-0 rounded border border-white/10 bg-cover bg-center"
                    style={{ backgroundImage: it.image ? `url(${it.image})` : undefined }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {it.name.en || it.name.ar || it.name.de || "—"}
                    </p>
                    <p className="text-xs text-brand-primary">€{it.price}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setItemModal({ colId: col.id, index: ii })}
                      className="rounded border border-white/15 px-2 py-1 text-[11px] text-white/80 hover:bg-white/5"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      type="button"
                      disabled={ii === 0}
                      onClick={() => moveItem(col.id, ii, -1)}
                      className="rounded border border-white/15 px-2 py-1 text-[11px] disabled:opacity-30"
                    >
                      {t("common.up")}
                    </button>
                    <button
                      type="button"
                      disabled={ii === col.items.length - 1}
                      onClick={() => moveItem(col.id, ii, 1)}
                      className="rounded border border-white/15 px-2 py-1 text-[11px] disabled:opacity-30"
                    >
                      {t("common.down")}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(col.id, ii)}
                      className="rounded border border-red-500/35 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/10"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {col.items.length === 0 ? (
              <p className="mt-2 text-xs text-amber-300/90">{t("panels.menuPage.emptyCategory")}</p>
            ) : null}
          </div>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="text-sm text-emerald-400" role="status">
          {t("panels.menuPage.saved")}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-[#212529] transition hover:brightness-110 disabled:opacity-50"
        >
          {saving ? t("shared.saving") : t("panels.menuPage.save")}
        </button>
      </div>

      <section className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">{t("panels.menuPage.previewTitle")}</h2>
          <div className="flex gap-1">
            {(["en", "ar", "de"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setPreviewLocale(loc)}
                className={`rounded px-2 py-1 text-[11px] font-semibold uppercase ${
                  previewLocale === loc
                    ? "bg-brand-primary text-[#212529]"
                    : "border border-white/15 text-white/70 hover:bg-white/5"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-[min(85vh,900px)] overflow-y-auto rounded-lg border border-white/10 bg-[#0a0a0a]">
          <div className="[&_section.menu-page-slider]:min-h-[42vh]">
            <MenuPageHero data={draft.hero} bg={draft.heroBackground} locale={previewLocale} />
          </div>
          <MenuPricingSection columns={draft.pricingColumns} locale={previewLocale} />
        </div>
      </section>

      <AdminModal
        open={addCategoryOpen}
        onClose={() => {
          setAddCategoryOpen(false);
          setNewCategoryTitles(emptyTitles());
          setAddCategoryError(null);
        }}
        title={t("panels.menuPage.addCategoryModalTitle")}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setAddCategoryOpen(false);
                setNewCategoryTitles(emptyTitles());
                setAddCategoryError(null);
              }}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/5"
            >
              {t("shared.cancel")}
            </button>
            <button
              type="button"
              onClick={confirmAddCategory}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110"
            >
              {t("shared.save")}
            </button>
          </div>
        }
      >
        {addCategoryError ? (
          <p className="mb-3 text-sm text-red-400" role="alert">
            {addCategoryError}
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          {(["en", "ar", "de"] as const).map((loc) => (
            <label key={loc} className="block text-xs">
              <span className="text-white/50">
                {t("panels.menuPage.categoryTitle")} ({loc})
              </span>
              <input
                type="text"
                value={newCategoryTitles[loc]}
                onChange={(e) =>
                  setNewCategoryTitles((prev) => ({ ...prev, [loc]: e.target.value }))
                }
                className="mt-1 w-full rounded border border-white/15 bg-black/40 px-2 py-2 text-sm text-white"
              />
            </label>
          ))}
        </div>
      </AdminModal>

      <AdminModal
        open={!!catModalCol}
        onClose={() => setCatModalId(null)}
        title={t("panels.menuPage.categoryModalTitle")}
        footer={
          <button
            type="button"
            onClick={() => setCatModalId(null)}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529]"
          >
            {t("panels.menuPage.modalDone")}
          </button>
        }
      >
        {catModalCol ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {(["en", "ar", "de"] as const).map((loc) => (
              <label key={loc} className="block text-xs">
                <span className="text-white/50">{t("panels.menuPage.categoryTitle")} ({loc})</span>
                <input
                  type="text"
                  value={catModalCol.title[loc]}
                  onChange={(e) =>
                    updateColumn(catModalCol.id, {
                      title: { ...catModalCol.title, [loc]: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded border border-white/15 bg-black/40 px-2 py-2 text-sm text-white"
                />
              </label>
            ))}
          </div>
        ) : null}
      </AdminModal>

      <AdminModal
        open={!!itemModalData}
        onClose={() => setItemModal(null)}
        title={t("panels.menuPage.itemModalTitle")}
        panelMaxClassName="max-w-2xl"
        footer={
          <button
            type="button"
            onClick={() => setItemModal(null)}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529]"
          >
            {t("panels.menuPage.modalDone")}
          </button>
        }
      >
        {itemModal && itemModalData ? (
          <div className="space-y-4">
            <AdminFileUpload
              key={`${itemModal.colId}-${itemModal.index}-${itemModalData.item.image}`}
              label={t("shared.image")}
              value=""
              onChange={(url) => {
                const { colId, index } = itemModal;
                setDraft((d) => ({
                  ...d,
                  pricingColumns: d.pricingColumns.map((c) =>
                    c.id === colId
                      ? {
                          ...c,
                          items: c.items.map((it, i) => (i === index ? { ...it, image: url } : it)),
                        }
                      : c,
                  ),
                }));
              }}
            />
            <label className="block text-xs">
              <span className="text-white/50">{t("panels.menuPage.price")}</span>
              <input
                type="text"
                value={itemModalData.item.price}
                onChange={(e) => {
                  const v = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    pricingColumns: d.pricingColumns.map((c) =>
                      c.id === itemModal.colId
                        ? {
                            ...c,
                            items: c.items.map((it, i) =>
                              i === itemModal.index ? { ...it, price: v } : it,
                            ),
                          }
                        : c,
                    ),
                  }));
                }}
                className="mt-1 w-full rounded border border-white/15 bg-black/40 px-2 py-2 text-sm text-white"
              />
            </label>
            {(["name", "desc"] as const).map((field) => (
              <div key={field} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase text-white/40">
                  {field === "name" ? t("shared.title") : t("shared.text")}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["en", "ar", "de"] as const).map((loc) => (
                    <label key={loc} className="block text-xs">
                      <span className="text-white/45">{loc}</span>
                      {field === "desc" ? (
                        <textarea
                          value={itemModalData.item.desc[loc]}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((d) => ({
                              ...d,
                              pricingColumns: d.pricingColumns.map((c) =>
                                c.id === itemModal.colId
                                  ? {
                                      ...c,
                                      items: c.items.map((it, i) =>
                                        i === itemModal.index
                                          ? { ...it, desc: { ...it.desc, [loc]: v } }
                                          : it,
                                      ),
                                    }
                                  : c,
                              ),
                            }));
                          }}
                          rows={3}
                          className="mt-1 w-full rounded border border-white/15 bg-black/40 px-2 py-2 text-sm text-white"
                        />
                      ) : (
                        <input
                          type="text"
                          value={itemModalData.item.name[loc]}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((d) => ({
                              ...d,
                              pricingColumns: d.pricingColumns.map((c) =>
                                c.id === itemModal.colId
                                  ? {
                                      ...c,
                                      items: c.items.map((it, i) =>
                                        i === itemModal.index
                                          ? { ...it, name: { ...it.name, [loc]: v } }
                                          : it,
                                      ),
                                    }
                                  : c,
                              ),
                            }));
                          }}
                          className="mt-1 w-full rounded border border-white/15 bg-black/40 px-2 py-2 text-sm text-white"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </AdminModal>

      <AdminModal
        open={!!addItemColId}
        onClose={() => {
          setAddItemColId(null);
          setNewItemForm(newItem(defaultItemImage));
          setAddItemError(null);
        }}
        title={t("panels.menuPage.addItemModalTitle")}
        panelMaxClassName="max-w-2xl"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setAddItemColId(null);
                setNewItemForm(newItem(defaultItemImage));
                setAddItemError(null);
              }}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/5"
            >
              {t("shared.cancel")}
            </button>
            <button
              type="button"
              onClick={confirmAddItem}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[#212529] transition hover:brightness-110"
            >
              {t("shared.save")}
            </button>
          </div>
        }
      >
        {addItemColId ? (
          <div className="space-y-4">
            {addItemError ? (
              <p className="text-sm text-red-400" role="alert">
                {addItemError}
              </p>
            ) : null}
            <AdminFileUpload
              key={`add-item-${addItemColId}-${newItemForm.image}`}
              label={t("shared.image")}
              value=""
              onChange={(url) => setNewItemForm((f) => ({ ...f, image: url }))}
            />
            <label className="block text-xs">
              <span className="text-white/50">{t("panels.menuPage.price")}</span>
              <input
                type="text"
                value={newItemForm.price}
                onChange={(e) => setNewItemForm((f) => ({ ...f, price: e.target.value }))}
                className="mt-1 w-full rounded border border-white/15 bg-black/40 px-2 py-2 text-sm text-white"
              />
            </label>
            {(["name", "desc"] as const).map((field) => (
              <div key={field} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase text-white/40">
                  {field === "name" ? t("shared.title") : t("shared.text")}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["en", "ar", "de"] as const).map((loc) => (
                    <label key={loc} className="block text-xs">
                      <span className="text-white/45">{loc}</span>
                      {field === "desc" ? (
                        <textarea
                          value={newItemForm.desc[loc]}
                          onChange={(e) =>
                            setNewItemForm((f) => ({
                              ...f,
                              desc: { ...f.desc, [loc]: e.target.value },
                            }))
                          }
                          rows={3}
                          className="mt-1 w-full rounded border border-white/15 bg-black/40 px-2 py-2 text-sm text-white"
                        />
                      ) : (
                        <input
                          type="text"
                          value={newItemForm.name[loc]}
                          onChange={(e) =>
                            setNewItemForm((f) => ({
                              ...f,
                              name: { ...f.name, [loc]: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded border border-white/15 bg-black/40 px-2 py-2 text-sm text-white"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
