import mongoose, { Schema, Document } from "mongoose";

export interface ICompanyDetail extends Document {
  userId: mongoose.Types.ObjectId;
  company_name: string;
  exists: boolean;
  domain: string;
  url?: string;
  confidence?: number;
  title?: string;
  description?: string;
  verified?: boolean;
  source?: string;
  linkedin_url?: string;
  logo_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyDetailSchema = new Schema<ICompanyDetail>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company_name: { type: String, required: true, trim: true },
    exists: { type: Boolean, default: false },
    domain: { type: String, required: true, lowercase: true, trim: true },
    url: { type: String, trim: true },
    confidence: { type: Number, min: 0, max: 100 },
    title: { type: String },
    description: { type: String },
    verified: { type: Boolean, default: false },
    source: { type: String, default: "unknown", lowercase: true, trim: true },
    linkedin_url: { type: String, trim: true },
    logo_url: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

CompanyDetailSchema.index({ userId: 1, domain: 1 }, { unique: true });

export const CompanyDetail = mongoose.models.CompanyDetail || mongoose.model<ICompanyDetail>("CompanyDetail", CompanyDetailSchema);
