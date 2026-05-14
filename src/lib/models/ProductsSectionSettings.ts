import mongoose, { Schema, model, models } from "mongoose";

const ProductsLocaleBlockSchema = new Schema(
  {
    sub: { type: String, default: "" },
    title: { type: String, default: "" },
    lead: { type: String, default: "" },
  },
  { _id: false },
);

const ProductItemLocaleCopySchema = new Schema(
  {
    name: { type: String, default: "" },
    desc: { type: String, default: "" },
  },
  { _id: false },
);

const ProductTabItemSchema = new Schema(
  {
    itemKey: { type: String, required: true },
    imageSrc: { type: String, default: "" },
    price: { type: String, default: "" },
    en: { type: ProductItemLocaleCopySchema, default: () => ({}) },
    ar: { type: ProductItemLocaleCopySchema, default: () => ({}) },
    de: { type: ProductItemLocaleCopySchema, default: () => ({}) },
  },
  { _id: false },
);

const ProductTabLabelSchema = new Schema(
  {
    label: { type: String, default: "" },
  },
  { _id: false },
);

const ProductTabSchema = new Schema(
  {
    id: { type: String, required: true },
    en: { type: ProductTabLabelSchema, default: () => ({}) },
    ar: { type: ProductTabLabelSchema, default: () => ({}) },
    de: { type: ProductTabLabelSchema, default: () => ({}) },
    items: { type: [ProductTabItemSchema], default: () => [] },
  },
  { _id: false },
);

const ProductsSectionSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    en: { type: ProductsLocaleBlockSchema, default: () => ({}) },
    ar: { type: ProductsLocaleBlockSchema, default: () => ({}) },
    de: { type: ProductsLocaleBlockSchema, default: () => ({}) },
    tabs: { type: [ProductTabSchema], default: () => [] },
  },
  { timestamps: true },
);

const ProductsSectionSettings =
  models.ProductsSectionSettings ?? model("ProductsSectionSettings", ProductsSectionSettingsSchema);

export default ProductsSectionSettings;
