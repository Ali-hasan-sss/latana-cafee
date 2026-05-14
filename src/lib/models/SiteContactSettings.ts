import mongoose, { Schema, model, models } from "mongoose";

const LocaleBlockSchema = new Schema(
  {
    address: { type: String, default: "" },
    hours: { type: String, default: "" },
  },
  { _id: false },
);

const SocialSchema = new Schema(
  {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    tiktok: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    youtube: { type: String, default: "" },
    x: { type: String, default: "" },
  },
  { _id: false },
);

const SiteContactSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    mapLat: { type: Number, default: null },
    mapLng: { type: Number, default: null },
    mapEmbedSrc: { type: String, default: "" },
    en: { type: LocaleBlockSchema, default: () => ({}) },
    ar: { type: LocaleBlockSchema, default: () => ({}) },
    de: { type: LocaleBlockSchema, default: () => ({}) },
    social: { type: SocialSchema, default: () => ({}) },
  },
  { timestamps: true },
);

const SiteContactSettings =
  models.SiteContactSettings ?? model("SiteContactSettings", SiteContactSettingsSchema);

export default SiteContactSettings;
