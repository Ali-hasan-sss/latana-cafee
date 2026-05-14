import mongoose, { Schema, model, models } from "mongoose";

const CounterLocaleSectionSchema = new Schema(
  {
    sub: { type: String, default: "" },
    title: { type: String, default: "" },
    lead: { type: String, default: "" },
  },
  { _id: false },
);

const CounterItemLocaleLabelSchema = new Schema(
  {
    label: { type: String, default: "" },
  },
  { _id: false },
);

const CounterItemSchema = new Schema(
  {
    id: { type: String, required: true },
    value: { type: Number, default: 0 },
    suffix: { type: String, default: "" },
    en: { type: CounterItemLocaleLabelSchema, default: () => ({}) },
    ar: { type: CounterItemLocaleLabelSchema, default: () => ({}) },
    de: { type: CounterItemLocaleLabelSchema, default: () => ({}) },
  },
  { _id: false },
);

const CounterSectionSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    bgImageSrc: { type: String, default: "" },
    en: { type: CounterLocaleSectionSchema, default: () => ({}) },
    ar: { type: CounterLocaleSectionSchema, default: () => ({}) },
    de: { type: CounterLocaleSectionSchema, default: () => ({}) },
    items: { type: [CounterItemSchema], default: () => [] },
  },
  { timestamps: true },
);

const CounterSectionSettings =
  models.CounterSectionSettings ?? model("CounterSectionSettings", CounterSectionSettingsSchema);

export default CounterSectionSettings;
