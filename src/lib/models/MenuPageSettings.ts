import mongoose, { Schema, model, models } from "mongoose";

const LocalizedStringSchema = new Schema(
  {
    en: { type: String, default: "" },
    ar: { type: String, default: "" },
    de: { type: String, default: "" },
  },
  { _id: false },
);

const MenuPricingItemSchema = new Schema(
  {
    image: { type: String, default: "" },
    price: { type: String, default: "" },
    name: { type: LocalizedStringSchema, default: () => ({}) },
    desc: { type: LocalizedStringSchema, default: () => ({}) },
  },
  { _id: false },
);

const MenuPricingColumnSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: LocalizedStringSchema, default: () => ({}) },
    items: { type: [MenuPricingItemSchema], default: () => [] },
  },
  { _id: false },
);

const MenuPageHeroSchema = new Schema(
  {
    title: { type: LocalizedStringSchema, default: () => ({}) },
    breadcrumbHome: { type: LocalizedStringSchema, default: () => ({}) },
    breadcrumbCurrent: { type: LocalizedStringSchema, default: () => ({}) },
  },
  { _id: false },
);

const MenuPageSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    heroBackground: { type: String, default: "" },
    hero: { type: MenuPageHeroSchema, default: () => ({}) },
    pricingColumns: { type: [MenuPricingColumnSchema], default: () => [] },
  },
  { timestamps: true },
);

const MenuPageSettings = models.MenuPageSettings ?? model("MenuPageSettings", MenuPageSettingsSchema);

export default MenuPageSettings;
