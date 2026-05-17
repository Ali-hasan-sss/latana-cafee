"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { MenuPageCmsDocument } from "@/lib/cms/menu-page-cms-types";

type Props = {
  onImport: (pricingColumns: MenuPageCmsDocument["pricingColumns"]) => void;
};

async function downloadFromApi(url: string, fallbackName: string) {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error("download_failed");
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  const match = cd?.match(/filename="?([^";]+)"?/i);
  const name = match?.[1] ?? fallbackName;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function MenuExcelToolbar({ onImport }: Props) {
  const t = useTranslations("adminUi");
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"template" | "export" | "import" | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOk, setImportOk] = useState(false);

  const btnClass =
    "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/10 disabled:opacity-50";

  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <h3 className="text-sm font-semibold text-white">{t("panels.menuPage.excelTitle")}</h3>
      <p className="mt-1 max-w-3xl text-xs leading-relaxed text-white/50">
        {t("panels.menuPage.excelLead")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          className={btnClass}
          onClick={() => {
            setImportError(null);
            setBusy("template");
            void downloadFromApi("/api/admin/menu-excel/template", "latana-menu-template.xlsx")
              .catch(() => setImportError(t("panels.menuPage.excel.errors.download")))
              .finally(() => setBusy(null));
          }}
        >
          {busy === "template" ? t("panels.menuPage.excel.downloading") : t("panels.menuPage.excel.downloadTemplate")}
        </button>

        <button
          type="button"
          disabled={busy !== null}
          className={btnClass}
          onClick={() => {
            setImportError(null);
            setBusy("export");
            void downloadFromApi("/api/admin/menu-excel/export", "latana-menu-export.xlsx")
              .catch(() => setImportError(t("panels.menuPage.excel.errors.download")))
              .finally(() => setBusy(null));
          }}
        >
          {busy === "export" ? t("panels.menuPage.excel.downloading") : t("panels.menuPage.excel.exportCurrent")}
        </button>

        <button
          type="button"
          disabled={busy !== null}
          className="rounded-lg border border-brand-primary/50 bg-brand-primary/15 px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary/25 disabled:opacity-50"
          onClick={() => {
            setImportError(null);
            inputRef.current?.click();
          }}
        >
          {busy === "import" ? t("panels.menuPage.excel.importing") : t("panels.menuPage.excel.import")}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;

            if (!window.confirm(t("panels.menuPage.excel.importConfirm"))) {
              return;
            }

            setBusy("import");
            setImportError(null);
            setImportOk(false);
            const body = new FormData();
            body.append("file", file);
            void fetch("/api/admin/menu-excel/import", {
              method: "POST",
              credentials: "same-origin",
              body,
            })
              .then(async (res) => {
                const data = (await res.json()) as {
                  ok?: boolean;
                  errorKey?: string;
                  pricingColumns?: MenuPageCmsDocument["pricingColumns"];
                };
                if (!res.ok || !data.ok || !data.pricingColumns) {
                  const key = data.errorKey ?? "parse";
                  setImportError(t(`panels.menuPage.excel.errors.${key}`));
                  return;
                }
                onImport(data.pricingColumns);
                setImportOk(true);
              })
              .catch(() => setImportError(t("panels.menuPage.excel.errors.parse")))
              .finally(() => setBusy(null));
          }}
        />
      </div>

      {importError ? (
        <p className="mt-3 text-xs text-red-400" role="alert">
          {importError}
        </p>
      ) : null}
      {importOk ? (
        <p className="mt-3 text-xs text-emerald-400" role="status">
          {t("panels.menuPage.excel.imported")}
        </p>
      ) : null}
    </div>
  );
}