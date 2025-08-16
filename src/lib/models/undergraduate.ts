import mongoose, { Schema } from "mongoose";

const undergraduateSchema = new mongoose.Schema(
  {
    // Basic identification
    index: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    nameWithInitials: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    // University details
    universityEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 100,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    batch: {
      type: String,
      required: true,
      trim: true,
    },

    // Education details
    education: {
      faculty: {
        type: String,
        required: true,
        enum: [
          "Faculty of Architecture",
          "Faculty of Business",
          "Faculty of Engineering",
          "Faculty of Information Technology",
          "Faculty of Medicine",
        ],
        trim: true,
      },
      degreeProgramme: {
        type: String,
        required: true,
        enum: [
          // Faculty of Architecture
          "Bachelor of Architecture Honours",
          "Bachelor of Landscape Architecture Honours",
          "Bachelor of Design Honours",
          "BSc (Hons) Town & Country Planning",
          "BSc (Hons) Quantity Surveying",
          "BSc (Hons) Facilities Management",

          // Faculty of Business
          "Bachelor of Business Science Honours",

          // Faculty of Engineering
          "BSc Engineering (Hons) Chemical & Process Engineering",
          "BSc Engineering (Hons) Civil Engineering",
          "BSc Engineering (Hons) Computer Science & Engineering",
          "BSc Engineering (Hons) Earth Resources Engineering",
          "BSc Engineering (Hons) Electrical Engineering",
          "BSc Engineering (Hons) Electronic & Telecommunication Engineering",
          "BSc Engineering (Hons) Biomedical Engineering",
          "BSc Engineering (Hons) Material Science & Engineering",
          "BSc Engineering (Hons) Mechanical Engineering",
          "BSc Engineering (Hons) Textile & Apparel Engineering",
          "BSc Engineering (Hons) Transport Management & Logistics Engineering",
          "Bachelor of Design Honours in Fashion Design & Product Development",
          "BSc (Hons) Transport and Logistics Management",

          // Faculty of Information Technology
          "BSc (Hons) Information Technology",
          "BSc (Hons) Information Technology & Management",
          "BSc (Hons) Artificial Intelligence",
          "Bachelor of Information Technology External Degree",

          // Faculty of Medicine
          "Bachelor of Medicine and Bachelor of Surgery",
        ],
        trim: true,
      },
    },

    // Personal information
    birthdate: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 15,
    },

    // Profile and status
    profilePicUrl: {
      type: String,
      trim: true,
      default: null,
    },
    cvUrl: {
      type: String,
      trim: true,
      default: null,
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: null,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    jobSearchingStatus: {
      type: String,
      enum: ["active", "passive", "not_searching", "employed"],
      default: "not_searching",
    },
    savedJobs: {
      type: [
        {
          jobId: {
            type: Schema.Types.ObjectId,
            ref: "Job",
          },
          savedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [], 
    },

    // Authentication tokens (for refresh token storage)
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date,
      },
    ],

    // Email verification
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // Password reset
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    // Login tracking
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: any, ret: any) {
        // Remove sensitive fields from JSON output
        ret.password = undefined;
        ret.refreshTokens = undefined;
        ret.emailVerificationToken = undefined;
        ret.passwordResetToken = undefined;
        ret.loginAttempts = undefined;
        ret.lockUntil = undefined;
        return ret;
      },
    },
  }
);

// Indexes for performance
undergraduateSchema.index({ universityEmail: 1 });
undergraduateSchema.index({ index: 1 });
undergraduateSchema.index({ batch: 1 });
undergraduateSchema.index({ "education.faculty": 1 });
undergraduateSchema.index({ jobSearchingStatus: 1 });

// Virtual for account lock status
undergraduateSchema.virtual("isLocked").get(function (this: any) {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Pre-save middleware to update updatedAt
undergraduateSchema.pre("save", function (this: any, next: any) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
undergraduateSchema.methods.addRefreshToken = function (
  this: any,
  token: string,
  expiresAt: Date
) {
  // Remove old expired tokens
  this.refreshTokens = this.refreshTokens.filter(
    (rt: any) => rt.expiresAt > new Date()
  );

  // Add new token
  this.refreshTokens.push({
    token,
    createdAt: new Date(),
    expiresAt,
  });

  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  return this.save();
};

undergraduateSchema.methods.removeRefreshToken = function (
  this: any,
  token: string
) {
  this.refreshTokens = this.refreshTokens.filter(
    (rt: any) => rt.token !== token
  );
  return this.save();
};

undergraduateSchema.methods.clearAllRefreshTokens = function (this: any) {
  this.refreshTokens = [];
  return this.save();
};

undergraduateSchema.methods.incrementLoginAttempts = function (this: any) {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

undergraduateSchema.methods.resetLoginAttempts = function (this: any) {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Create the model
const UndergradModel =
  mongoose.models.Undergraduate ||
  mongoose.model("Undergraduate", undergraduateSchema);

export default UndergradModel;
