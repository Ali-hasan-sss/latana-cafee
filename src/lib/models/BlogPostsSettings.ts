import mongoose, { Schema, model, models } from "mongoose";

const BlogPostLocaleBlockSchema = new Schema(
  {
    title: { type: String, default: "" },
    date: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
  },
  { _id: false },
);

const BlogPostSchema = new Schema(
  {
    id: { type: String, required: true },
    slug: { type: String, required: true },
    publishedAt: { type: String, default: "" },
    comments: { type: Number, default: 0 },
    coverImageSrc: { type: String, default: "" },
    images: { type: [String], default: () => [] },
    en: { type: BlogPostLocaleBlockSchema, default: () => ({}) },
    ar: { type: BlogPostLocaleBlockSchema, default: () => ({}) },
    de: { type: BlogPostLocaleBlockSchema, default: () => ({}) },
  },
  { _id: false },
);

const BlogPostsSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    posts: { type: [BlogPostSchema], default: () => [] },
  },
  { timestamps: true },
);

const BlogPostsSettings =
  models.BlogPostsSettings ?? model("BlogPostsSettings", BlogPostsSettingsSchema);

export default BlogPostsSettings;
