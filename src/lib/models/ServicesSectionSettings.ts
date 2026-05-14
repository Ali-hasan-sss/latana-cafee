import mongoose, { Schema, model, models } from "mongoose";

const ServicesLocaleSectionSchema = new Schema(
  {
    sub: { type: String, default: "" },
    title: { type: String, default: "" },
    lead: { type: String, default: "" },
  },
  { _id: false },
);

const ServiceItemLocaleSchema = new Schema(
  {
    title: { type: String, default: "" },
    text: { type: String, default: "" },
  },
  { _id: false },
);

const ServiceItemSchema = new Schema(
  {
    id: { type: String, required: true },
    icon: { type: String, default: "" },
    en: { type: ServiceItemLocaleSchema, default: () => ({}) },
    ar: { type: ServiceItemLocaleSchema, default: () => ({}) },
    de: { type: ServiceItemLocaleSchema, default: () => ({}) },
  },
  { _id: false },
);

const ServicesSectionSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    en: { type: ServicesLocaleSectionSchema, default: () => ({}) },
    ar: { type: ServicesLocaleSectionSchema, default: () => ({}) },
    de: { type: ServicesLocaleSectionSchema, default: () => ({}) },
    items: { type: [ServiceItemSchema], default: () => [] },
  },
  { timestamps: true },
);

const ServicesSectionSettings =
  models.ServicesSectionSettings ?? model("ServicesSectionSettings", ServicesSectionSettingsSchema);

export default ServicesSectionSettings;
