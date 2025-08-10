import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  // Basic company information
  companyName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Contact information
  businessEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 100
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // Company details
  industry: {
    type: String,
    required: true,
    trim: true
  },
  companySize: {
    type: String,
    required: true,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  foundedYear: {
    type: Number,
    required: true,
    min: 1800,
    max: new Date().getFullYear()
  },
  
  // Address
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    province: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Company profile
  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logoUrl: {
    type: String,
    trim: true
  },
  
  // Contact person
  contactPerson: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Verification and status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationPriority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  verificationRequestedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: Date,
  verificationNotes: [{
    note: String,
    addedBy: String, // Admin ID or identifier
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verificationDocuments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['business_registration', 'tax_certificate', 'incorporation_certificate', 'other']
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Security
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lockedUntil: Date
  },
  
  // Refresh tokens for JWT
  refreshTokens: [{
    token: String,
    expiresAt: Date
  }],
  
  // Activity tracking
  lastLogin: Date,
  
  // Job posting limits
  jobPostingLimits: {
    maxActiveJobs: {
      type: Number,
      default: 10
    },
    currentActiveJobs: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes (businessEmail and registrationNumber already have unique indexes from field definitions)
companySchema.index({ isVerified: 1 });
companySchema.index({ isActive: 1 });

// Virtual for is account locked
companySchema.virtual('isLocked').get(function() {
  return !!(this.loginAttempts?.lockedUntil && this.loginAttempts.lockedUntil > new Date());
});

// Instance methods
companySchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.loginAttempts?.lockedUntil && this.loginAttempts.lockedUntil < new Date()) {
    return this.updateOne({
      $unset: {
        'loginAttempts.lockedUntil': 1,
      },
      $set: {
        'loginAttempts.count': 1
      }
    });
  }
  
  const updates: any = { $inc: { 'loginAttempts.count': 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if ((this.loginAttempts?.count || 0) + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'loginAttempts.lockedUntil': new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }
  
  return this.updateOne(updates);
};

companySchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: {
      'loginAttempts.count': 1,
      'loginAttempts.lockedUntil': 1
    }
  });
};

companySchema.methods.addRefreshToken = async function(token: string, expiresAt: Date) {
  // Remove expired tokens
  this.refreshTokens = this.refreshTokens.filter((rt: any) => rt.expiresAt > new Date());
  
  // Add new token
  this.refreshTokens.push({ token, expiresAt });
  
  // Keep only the latest 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  return this.save();
};

companySchema.methods.removeRefreshToken = async function(token: string) {
  this.refreshTokens = this.refreshTokens.filter((rt: any) => rt.token !== token);
  return this.save();
};

const CompanyModel = mongoose.models.Company || mongoose.model('Company', companySchema);

export default CompanyModel;
