import mongoose, { Schema, model, models } from "mongoose";

const MenuPreviewLocaleSchema = new Schema(
  {
    sub: { type: String, default: "" },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
    cta: { type: String, default: "" },
    gridAria: { type: String, default: "" },
  },
  { _id: false },
);

const MenuPreviewSectionSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    imageSrcs: { type: [String], default: () => [] },
    en: { type: MenuPreviewLocaleSchema, default: () => ({}) },
    ar: { type: MenuPreviewLocaleSchema, default: () => ({}) },
    de: { type: MenuPreviewLocaleSchema, default: () => ({}) },
  },
  { timestamps: true },
);

const MenuPreviewSectionSettings =
  models.MenuPreviewSectionSettings ??
  model("MenuPreviewSectionSettings", MenuPreviewSectionSettingsSchema);

export default MenuPreviewSectionSettings;
