import mongoose, { Schema, model, models } from "mongoose";

const GallerySettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    pool: { type: [String], default: () => [] },
    homeTeaser: { type: [String], default: () => [] },
  },
  { timestamps: true },
);

const GallerySettings = models.GallerySettings ?? model("GallerySettings", GallerySettingsSchema);

export default GallerySettings;
