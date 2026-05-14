import type { MenuPreviewLocaleBlock, MenuPreviewSectionDocument } from "./menu-preview-section-types";
import { getAssets } from "@/lib/data";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import de from "../../../messages/de.json";

type MenuMsg = {
  sub?: string;
  title?: string;
  text?: string;
  cta?: string;
  gridAria?: string;
};

function block(lang: MenuMsg): MenuPreviewLocaleBlock {
  return {
    sub: lang.sub ?? "",
    title: lang.title ?? "",
    text: lang.text ?? "",
    cta: lang.cta ?? "",
    gridAria: lang.gridAria ?? "",
  };
}

function fourImagesFromAssets(): string[] {
  const { menuPreview } = getAssets();
  const list = [...menuPreview].map((s) => String(s ?? "").trim()).slice(0, 4);
  while (list.length < 4) {
    list.push("");
  }
  return list.slice(0, 4);
}

export function getFallbackMenuPreviewSectionDocument(): MenuPreviewSectionDocument {
  return {
    imageSrcs: fourImagesFromAssets(),
    en: block(en.menuSection as MenuMsg),
    ar: block(ar.menuSection as MenuMsg),
    de: block(de.menuSection as MenuMsg),
  };
}
