import * as XLSX from "xlsx";
import type { MenuPageCmsDocument } from "@/lib/cms/menu-page-cms-types";
import type { LocalizedString } from "@/lib/menu-page-i18n";

export const MENU_EXCEL_SHEET = "Menu";
export const MENU_EXCEL_INSTRUCTIONS_SHEET = "Instructions";

/** Header row for the menu template (one row = one dish). */
export const MENU_EXCEL_HEADERS = [
  "category_key",
  "category_title_en",
  "category_title_ar",
  "category_title_de",
  "dish_name_en",
  "dish_name_ar",
  "dish_name_de",
  "dish_desc_en",
  "dish_desc_ar",
  "dish_desc_de",
  "price",
] as const;

function cellStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(v);
  }
  return String(v).trim();
}

function slugCategoryId(key: string): string {
  const s = key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!s) return "";
  if (/^[0-9]/.test(s)) return `cat-${s}`;
  return s.slice(0, 64);
}

function newCategoryId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function groupKey(
  categoryKey: string,
  title: LocalizedString,
): string {
  if (categoryKey) return `key:${categoryKey}`;
  return `title:${title.en}|${title.ar}|${title.de}`;
}

export function buildMenuExcelTemplateBuffer(): Buffer {
  const wb = XLSX.utils.book_new();

  const menuAoA: string[][] = [MENU_EXCEL_HEADERS.slice()];
  const menuSheet = XLSX.utils.aoa_to_sheet(menuAoA);
  menuSheet["!cols"] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 28 },
    { wch: 28 },
    { wch: 28 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, menuSheet, MENU_EXCEL_SHEET);

  const instructions: string[][] = [
    ["How to use this template"],
    [""],
    ["• One row = one dish. Repeat category columns for every dish in that category."],
    ["• category_key: optional stable id (e.g. drinks). Same key = same category."],
    ["• category_title_*: category name in EN / AR / DE (at least one language)."],
    ["• dish_name_* / dish_desc_*: dish name and description per language. Dish name fields are optional."],
    ["• price: number only (e.g. 12.50). Shown with € on the website."],
    ["• Images are not imported from Excel. Imported dishes use the default site image; replace them later in the admin UI if needed."],
    ["• Fill your menu rows, then import in the admin panel."],
    [""],
    ["Language columns are optional for dish names; fill only the languages you need."],
  ];
  const instrSheet = XLSX.utils.aoa_to_sheet(instructions);
  instrSheet["!cols"] = [{ wch: 88 }];
  XLSX.utils.book_append_sheet(wb, instrSheet, MENU_EXCEL_INSTRUCTIONS_SHEET);

  return Buffer.from(
    XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as ArrayBuffer,
  );
}

export type MenuExcelParseResult =
  | { ok: true; pricingColumns: MenuPageCmsDocument["pricingColumns"] }
  | { ok: false; errorKey: string };

/**
 * Parses the Menu sheet into pricing columns. Hero / hero background are unchanged by the caller.
 */
export function parseMenuExcelBuffer(
  buffer: ArrayBuffer,
  defaultItemImage: string,
): MenuExcelParseResult {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet =
    wb.Sheets[MENU_EXCEL_SHEET] ??
    wb.Sheets[wb.SheetNames[0] ?? ""] ??
    null;
  if (!sheet) {
    return { ok: false, errorKey: "excelNoSheet" };
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  if (rows.length === 0) {
    return { ok: false, errorKey: "excelEmpty" };
  }

  const defaultImage = defaultItemImage.trim() || "/images/IMG_8417.JPG.jpeg";

  type Group = {
    id: string;
    title: LocalizedString;
    items: MenuPageCmsDocument["pricingColumns"][number]["items"];
  };

  const groups = new Map<string, Group>();
  const order: string[] = [];

  for (const row of rows) {
    const norm: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      norm[k.trim().toLowerCase().replace(/\s+/g, "_")] = cellStr(v);
    }

    const categoryKey = cellStr(norm.category_key);
    const title: LocalizedString = {
      en: cellStr(norm.category_title_en),
      ar: cellStr(norm.category_title_ar),
      de: cellStr(norm.category_title_de),
    };
    const name: LocalizedString = {
      en: cellStr(norm.dish_name_en),
      ar: cellStr(norm.dish_name_ar),
      de: cellStr(norm.dish_name_de),
    };
    const desc: LocalizedString = {
      en: cellStr(norm.dish_desc_en),
      ar: cellStr(norm.dish_desc_ar),
      de: cellStr(norm.dish_desc_de),
    };
    const rawPrice = cellStr(norm.price);
    const price = rawPrice || "0.00";
    const image = defaultImage;

    const hasCategory =
      categoryKey || title.en || title.ar || title.de;
    const hasDish =
      name.en || name.ar || name.de || desc.en || desc.ar || desc.de || rawPrice;

    if (!hasCategory && !hasDish) continue;

    if (!hasDish) continue;

    if (!title.en && !title.ar && !title.de) {
      return { ok: false, errorKey: "excelMissingCategoryTitle" };
    }

    const gk = groupKey(categoryKey, title);
    let group = groups.get(gk);
    if (!group) {
      const id = categoryKey ? slugCategoryId(categoryKey) || newCategoryId() : newCategoryId();
      group = { id, title, items: [] };
      groups.set(gk, group);
      order.push(gk);
    } else {
      group.title = {
        en: title.en || group.title.en,
        ar: title.ar || group.title.ar,
        de: title.de || group.title.de,
      };
    }

    group.items.push({
      image,
      price,
      name,
      desc,
    });
  }

  if (order.length === 0) {
    return { ok: false, errorKey: "excelEmpty" };
  }

  const pricingColumns = order.map((gk) => {
    const g = groups.get(gk)!;
    return {
      id: g.id,
      title: g.title,
      items: g.items,
    };
  });

  return { ok: true, pricingColumns };
}

/** Export current menu rows to xlsx (same columns as template). */
export function buildMenuExcelFromDocument(doc: MenuPageCmsDocument): Buffer {
  const rows: string[][] = [];
  for (const col of doc.pricingColumns) {
    for (const it of col.items) {
      rows.push([
        col.id,
        col.title.en,
        col.title.ar,
        col.title.de,
        it.name.en,
        it.name.ar,
        it.name.de,
        it.desc.en,
        it.desc.ar,
        it.desc.de,
        it.price,
      ]);
    }
  }
  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([MENU_EXCEL_HEADERS.slice(), ...rows]);
  XLSX.utils.book_append_sheet(wb, sheet, MENU_EXCEL_SHEET);
  return Buffer.from(
    XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as ArrayBuffer,
  );
}
