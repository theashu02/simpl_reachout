import mongoose, { Schema, Document } from "mongoose";

export interface ICompanyDetail {
  company_name: string;
  exists: boolean;
  domain: string;
  url?: string;
  confidence?: number;
  title?: string;
  description?: string;
  verified: boolean;
  source?: string;
  linkedin_url?: string;
  logo_url?: string;
}

export interface IUserCompanyDetails extends Document {
  userId: string;
  email: string;
  companies: ICompanyDetail[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanyDetailSchema = new Schema<ICompanyDetail>(
  {
    company_name: { type: String, required: true, trim: true },
    exists: { type: Boolean, default: false },
    domain: { type: String, required: true, lowercase: true, trim: true },
    url: { type: String, trim: true },
    confidence: { type: Number, min: 0, max: 100 },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    source: { type: String, default: "unknown", lowercase: true, trim: true },
    linkedin_url: { type: String, trim: true },
    logo_url: { type: String, trim: true },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const UserCompanyDetailsSchema = new Schema<IUserCompanyDetails>(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    companies: { type: [CompanyDetailSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "userCompanyDetails",
  }
);

UserCompanyDetailsSchema.index({ userId: 1 });
UserCompanyDetailsSchema.index({ email: 1 });
UserCompanyDetailsSchema.index({ "companies.domain": 1 });

export const UserCompanyDetails = mongoose.models.UserCompanyDetails || mongoose.model<IUserCompanyDetails>("UserCompanyDetails", UserCompanyDetailsSchema);
