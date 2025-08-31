import mongoose, { Mongoose, Schema } from "mongoose";
import JobModel from "./job";

const applicationSchema = new mongoose.Schema({
  jobId: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: "Job",
  },
  applicantId: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: "Undergraduate",
  },
  applicantDegree: {
    required: true,
    type: String,
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
  },
  // Application documents and details
  cv: {
    type: String, // URL/path to uploaded CV file
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
  },
  specialRequirements: {
    type: String, // Any special requirements or additional information
    required: false,
  },
  skills: {
    type: [String],
    required: false,
  },
  status: {
    type: String,
    enum: ["applied", "shortlisted", "interview_called", "interviewed", "selected", "offered", "accepted", "rejected"],
    default: "applied",
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  interviewCall: {
    type: {
      date: { type: Date, required: true },
      time: { type: String, required: true },
      location: { type: String, required: true },
    },
    required: false,
  },
});

const ApplicationModel =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
export default ApplicationModel;
