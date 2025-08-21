import mongoose, { Schema } from "mongoose";

const shortlistSchema = new mongoose.Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "Undergraduate",
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    shortlistedBy: {
      type: String, // Email or name of company user who shortlisted
      required: true,
    },
    shortlistedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String, // Optional notes about why they were shortlisted
      default: "",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one shortlist entry per application
shortlistSchema.index({ applicationId: 1 }, { unique: true });

// Index for efficient queries
shortlistSchema.index({ jobId: 1, companyId: 1 });
shortlistSchema.index({ companyId: 1 });

const ShortlistModel =
  mongoose.models.Shortlist || mongoose.model("Shortlist", shortlistSchema);
export default ShortlistModel;
