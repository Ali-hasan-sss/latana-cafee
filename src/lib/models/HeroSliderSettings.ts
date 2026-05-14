import mongoose, { Schema, model, models } from "mongoose";

const HeroSlideLocaleSchema = new Schema(
  {
    title: { type: String, default: "" },
    text: { type: String, default: "" },
  },
  { _id: false },
);

const HeroSlideSchema = new Schema(
  {
    imageSrc: { type: String, required: true },
    order: { type: Number, default: 0 },
    en: { type: HeroSlideLocaleSchema, default: () => ({}) },
    ar: { type: HeroSlideLocaleSchema, default: () => ({}) },
    de: { type: HeroSlideLocaleSchema, default: () => ({}) },
  },
  { timestamps: false },
);

const HeroSliderSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    slides: { type: [HeroSlideSchema], default: [] },
  },
  { timestamps: true },
);

const HeroSliderSettings =
  models.HeroSliderSettings ??
  model("HeroSliderSettings", HeroSliderSettingsSchema);

export default HeroSliderSettings;
