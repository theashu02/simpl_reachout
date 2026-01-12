import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailAccount extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  provider: 'google' | 'outlook' | 'zoho' | 'custom';

  config?: {
    imapHost?: string;
    imapPort?: number;
    smtpHost?: string;
    smtpPort?: number;
    secure?: boolean; // TLS/SSL
  };

  // Credentials
  credentials: {
    username?: string; 
    encryptedPassword?: string;
  };

  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailAccountSchema = new Schema<IEmailAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  provider: { type: String, enum: ['google', 'outlook', 'zoho', 'custom'], required: true },

  config: {
    imapHost: String,
    imapPort: Number,
    smtpHost: String,
    smtpPort: Number,
    secure: { type: Boolean, default: true }
  },

  credentials: {
    username: String,
    encryptedPassword: { type: String, select: false }
  },

  isVerified: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

EmailAccountSchema.index({ userId: 1, email: 1 }, { unique: true });

export const EmailAccount = mongoose.models.EmailAccount || mongoose.model<IEmailAccount>('EmailAccounts', EmailAccountSchema);