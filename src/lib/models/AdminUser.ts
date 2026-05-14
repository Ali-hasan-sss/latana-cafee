import mongoose, { Schema, model, models } from "mongoose";

const AdminUserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

const AdminUser = models.AdminUser ?? model("AdminUser", AdminUserSchema);

export default AdminUser;
