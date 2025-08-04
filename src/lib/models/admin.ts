import mongoose, { Schema, Document } from 'mongoose';

interface RefreshToken {
  token: string;
  expiresAt: Date;
}

export interface AdminDoc extends Document {
  username: string;
  password: string;
  role: 'superadmin' | 'admin';
  loginAttempts: number;
  lockUntil?: Date;
  refreshTokens: RefreshToken[];
  lastLogin?: Date;
  incrementLoginAttempts: () => Promise<void>;
  resetLoginAttempts: () => Promise<void>;
  isLocked: boolean;
  addRefreshToken: (token: string, expiry: Date) => Promise<void>;
  removeRefreshToken: (token: string) => Promise<void>;
}

const RefreshTokenSchema = new Schema<RefreshToken>(
  {
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },
  { _id: false }
);

const AdminSchema = new Schema<AdminDoc>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin'], required: true, default: 'admin' },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    refreshTokens: { type: [RefreshTokenSchema], default: [] },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

// Virtual for checking lock state
AdminSchema.virtual('isLocked').get(function (this: AdminDoc) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

AdminSchema.methods.incrementLoginAttempts = async function () {
  const LOCK_THRESHOLD = 5;
  const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

  if (this.lockUntil && this.lockUntil > new Date()) {
    // still locked; do nothing
    return;
  }

  this.loginAttempts += 1;
  if (this.loginAttempts >= LOCK_THRESHOLD) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
  }
  await this.save();
};

AdminSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

AdminSchema.methods.addRefreshToken = async function (token: string, expiry: Date) {
  const doc = this as AdminDoc;
  // prune expired first with explicit type
  doc.refreshTokens = doc.refreshTokens.filter((rt: RefreshToken) => rt.expiresAt > new Date());
  doc.refreshTokens.push({ token, expiresAt: expiry });
  await doc.save();
};

AdminSchema.methods.removeRefreshToken = async function (token: string) {
  const doc = this as AdminDoc;
  doc.refreshTokens = doc.refreshTokens.filter((rt: RefreshToken) => rt.token !== token);
  await doc.save();
};

const AdminModel = mongoose.models.Admin || mongoose.model<AdminDoc>('Admin', AdminSchema);
export default AdminModel;
