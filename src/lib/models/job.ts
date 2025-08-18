import mongoose, { Schema } from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    // job details
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Architecture",
        "Business",
        "Engineering",
        "Information Technology",
        "Medicine",
        "Design",
        "Management",
        "Other"
      ],
      required: true,
    },
    workPlaceType: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    salaryRange: {
      min: Number,
      max: Number,
    },
    deadline: {
      type: Date,
      required: true,
    },
    logo: {
      type: String,
    },
    urgent: {
      type: Boolean,  
      default: true,
    },

    // job requiremnets
    qualifiedDegrees: {
      type: [String],
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
      required: true,
    },
    skillsRequired: {
      type: [String],
    },

    // Company info
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "CompanyModel",
      required: true,
    },

    // status of the job
    status: {
      type: String,
      enum: ["active", "closed", "pending"],
      default: "active", // Changed from "pending" to "active" - jobs go live immediately
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },

    // metadata
    posted_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Single-field indexes
jobSchema.index({ companyId: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });

// Compound indexes for combined searches
jobSchema.index({ category: 1, location: 1 });
jobSchema.index({ companyId: 1, category: 1 });
jobSchema.index({ "salaryRange.min": 1, "salaryRange.max": 1 });

//text index for title
jobSchema.index({ title: "text" });

//instance methods
jobSchema.methods.getCompanyInfo = async function (
  fields = "companyName contactPerson.email contactPerson.phone"
) {
  await this.populate("companyId", fields);
  return this.companyId;
};

const JobModel = mongoose.models.Job || mongoose.model("Job", jobSchema);

export default JobModel;
