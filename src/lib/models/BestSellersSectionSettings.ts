import mongoose, { Schema, model, models } from "mongoose";

const BestSellersLocaleSectionSchema = new Schema(
  {
    sub: { type: String, default: "" },
    title: { type: String, default: "" },
    lead: { type: String, default: "" },
  },
  { _id: false },
);

const BestSellerItemLocaleCopySchema = new Schema(
  {
    name: { type: String, default: "" },
    desc: { type: String, default: "" },
  },
  { _id: false },
);

const BestSellerItemSchema = new Schema(
  {
    id: { type: String, required: true },
    imageSrc: { type: String, default: "" },
    price: { type: String, default: "" },
    en: { type: BestSellerItemLocaleCopySchema, default: () => ({}) },
    ar: { type: BestSellerItemLocaleCopySchema, default: () => ({}) },
    de: { type: BestSellerItemLocaleCopySchema, default: () => ({}) },
  },
  { _id: false },
);

const BestSellersSectionSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    en: { type: BestSellersLocaleSectionSchema, default: () => ({}) },
    ar: { type: BestSellersLocaleSectionSchema, default: () => ({}) },
    de: { type: BestSellersLocaleSectionSchema, default: () => ({}) },
    items: { type: [BestSellerItemSchema], default: () => [] },
  },
  { timestamps: true },
);

const BestSellersSectionSettings =
  models.BestSellersSectionSettings ??
  model("BestSellersSectionSettings", BestSellersSectionSettingsSchema);

export default BestSellersSectionSettings;
