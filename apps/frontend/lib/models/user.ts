import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    image: { type: String },
    walletAddress: { type: String, unique: true, sparse: true },
    provider: { type: String },
    providerAccountId: { type: String },
    lastLoginAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export type AppUser = InferSchemaType<typeof userSchema>;
export type AppUserModel = Model<AppUser>;

export const UserModel: AppUserModel = models.User || model("User", userSchema);
