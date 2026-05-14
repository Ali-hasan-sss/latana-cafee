import mongoose, { Schema, model, models } from "mongoose";

const AboutLocaleSchema = new Schema(
  {
    sub: { type: String, default: "" },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
  },
  { _id: false },
);

const AboutSectionSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    imageSrc: { type: String, default: "" },
    en: { type: AboutLocaleSchema, default: () => ({}) },
    ar: { type: AboutLocaleSchema, default: () => ({}) },
    de: { type: AboutLocaleSchema, default: () => ({}) },
  },
  { timestamps: true },
);

const AboutSectionSettings =
  models.AboutSectionSettings ?? model("AboutSectionSettings", AboutSectionSettingsSchema);

export default AboutSectionSettings;
