"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deleteProductsSectionTab, reorderProductsTabs } from "@/app/actions/products-section-admin";
import { ProductsHeadingsForm } from "@/components/admin/ProductsHeadingsForm";
import { ProductsTabAddForm } from "@/components/admin/ProductsTabAddForm";
import { ProductsTabItemForm } from "@/components/admin/ProductsTabItemForm";
import { ProductsTabLabelsForm } from "@/components/admin/ProductsTabLabelsForm";
import type { ProductTabItemDocument, ProductsSectionDocument } from "@/lib/cms/products-section-types";

const ITEM_ORDER: ProductTabItemDocument["itemKey"][] = ["one", "two", "three"];

type Props = {
  initialProducts: ProductsSectionDocument;
};

type ItemTarget = { tabId: string; item: ProductTabItemDocument };

export function ProductsSectionAdminPanel({ initialProducts }: Props) {
  const t = useTranslations("adminUi");
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<ProductsSectionDocument>(initialProducts);
  const [headingsOpen, setHeadingsOpen] = useState(false);
  const [addTabOpen, setAddTabOpen] = useState(false);
  const [labelsTabId, setLabelsTabId] = useState<string | null>(null);
  const [itemTarget, setItemTarget] = useState<ItemTarget | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);

  useEffect(() => {
    setSnapshot(initialProducts);
  }, [initialProducts]);

  const onSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  const headings: Pick<ProductsSectionDocument, "en" | "ar" | "de"> = {
    en: snapshot.en,
    ar: snapshot.ar,
    de: snapshot.de,
  };

  const labelsTab = labelsTabId ? snapshot.tabs.find((tab) => tab.id === labelsTabId) : null;

  const itemIndex = itemTarget ? ITEM_ORDER.indexOf(itemTarget.item.itemKey) + 1 : 0;

  const moveTab = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= snapshot.tabs.length) return;
    setReorderError(null);
    const ids = snapshot.tabs.map((tab) => tab.id);
    const tmp = ids[index]!;
    ids[index] = ids[next]!;
    ids[next] = tmp;
    const res = await reorderProductsTabs(ids);
    if (!res.ok) {
      setReorderError(res.error ?? t("common.couldNotReorder"));
      return;
    }
    onSaved();
  };

  const handleDeleteTab = async (tabId: string) => {
    if (!window.confirm(t("shared.deleteTabConfirm"))) return;
    const res = await deleteProductsSectionTab(tabId);
    if (!res.ok) {
      alert(res.error ?? t("common.deleteFailed"));
      return;
    }
    onSaved();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">{t("panels.products.title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-white/55">{t("panels.products.lead")}</p>
      </div>

      {reorderError ? (
        <p className="text-sm text-red-400" role="alert">
          {reorderError}
        </p>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/80">{t("panels.products.headingsSection")}</h2>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {t("shared.headingsEn")}
            </p>
            <p className="truncate text-sm font-medium text-white">
              {snapshot.en.title || t("common.dash")}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-white/50">
              {snapshot.en.lead || t("common.dash")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHeadingsOpen(true)}
            className="shrink-0 rounded-lg border border-brand-primary/60 bg-brand-primary/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary transition hover:bg-brand-primary/25"
          >
            {t("common.edit")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white/80">{t("panels.products.tabsSection")}</h2>
        <button
          type="button"
          disabled={snapshot.tabs.length >= 4}
          onClick={() => setAddTabOpen(true)}
          className="rounded-lg border border-brand-primary/60 bg-brand-primary/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary transition hover:bg-brand-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("panels.products.addTab")}
        </button>
      </div>

      <div className="space-y-6">
        {snapshot.tabs.map((tab, tabIndex) => (
          <div
            key={tab.id}
            className="overflow-hidden rounded-xl border border-white/10 bg-black/20 p-4 md:p-5"
          >
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">{tab.id}</p>
                <p className="mt-1 text-sm font-medium text-white">{tab.en.label || tab.id}</p>
                <p className="mt-0.5 text-xs text-white/45" dir="rtl">
                  {tab.ar.label || t("common.dash")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={tabIndex === 0}
                  onClick={() => void moveTab(tabIndex, -1)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/5 disabled:opacity-35"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={tabIndex >= snapshot.tabs.length - 1}
                  onClick={() => void moveTab(tabIndex, 1)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/5 disabled:opacity-35"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setLabelsTabId(tab.id)}
                  className="rounded-lg border border-brand-primary/50 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary/20"
                >
                  {t("panels.products.editTabLabels")}
                </button>
                <button
                  type="button"
                  disabled={snapshot.tabs.length <= 1}
                  onClick={() => void handleDeleteTab(tab.id)}
                  className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {t("panels.products.deleteTab")}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-3 text-xs font-medium text-white/50">{t("panels.products.productsThree")}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {tab.items.map((item) => (
                  <div
                    key={`${tab.id}-${item.itemKey}`}
                    className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-black/30"
                  >
                    <div
                      className="h-28 bg-cover bg-center sm:h-32"
                      style={{ backgroundImage: `url(${item.imageSrc})` }}
                      role="img"
                      aria-label={item.en.name}
                    />
                    <div className="flex flex-1 flex-col p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                        {item.itemKey}
                      </p>
                      <p className="line-clamp-2 text-sm font-medium text-white">
                        {item.en.name || t("common.dash")}
                      </p>
                      <p className="mt-1 text-xs text-brand-primary">€{item.price || t("common.dash")}</p>
                      <div className="mt-3 flex flex-1 items-end">
                        <button
                          type="button"
                          onClick={() => setItemTarget({ tabId: tab.id, item })}
                          className="w-full rounded-lg border border-brand-primary/60 bg-brand-primary/15 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary transition hover:bg-brand-primary/25"
                        >
                          {t("panels.products.editProduct")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductsHeadingsForm
        open={headingsOpen}
        onClose={() => setHeadingsOpen(false)}
        initial={headings}
        onSaved={onSaved}
      />

      <ProductsTabAddForm open={addTabOpen} onClose={() => setAddTabOpen(false)} onSaved={onSaved} />

      {labelsTabId && labelsTab ? (
        <ProductsTabLabelsForm
          open
          onClose={() => setLabelsTabId(null)}
          tabId={labelsTab.id}
          initial={{ en: labelsTab.en.label, ar: labelsTab.ar.label, de: labelsTab.de.label }}
          onSaved={onSaved}
        />
      ) : null}

      {itemTarget ? (
        <ProductsTabItemForm
          open
          onClose={() => setItemTarget(null)}
          tabId={itemTarget.tabId}
          productIndex={itemIndex}
          initial={itemTarget.item}
          onSaved={onSaved}
        />
      ) : null}
    </div>
  );
}
