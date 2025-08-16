"use client";

import React from "react";

interface CompanyProfile {
  _id: string;
  companyName: string;
}

interface JobOpportunity {
  _id: string;
  title: string;
  description: string;
  jobType: "Full-time" | "Part-time" | "Internship";
  category:
    | "Architecture"
    | "Business"
    | "Engineering"
    | "Information Technology"
    | "Medicine"
    | "Design"
    | "Management"
    | "Other";
  workPlaceType: "On-site" | "Remote" | "Hybrid";
  location: string;
  salaryRange?: {
    min?: number;
    max?: number;
  };
  deadline: string;
  logo?: string;
  urgent: boolean;
  qualifiedDegrees: string[];
  skillsRequired: string[];
  companyId: CompanyProfile;
  status: "active" | "closed" | "pending";
  applicantsCount: number;
  posted_date: string;
  createdAt: string;
  updatedAt: string;
}

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobOpportunity | null;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  isJobSaved: boolean;
  isJobApplied: boolean;
  isSaving: boolean;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  job,
  onApply,
  onSave,
  isJobSaved,
  isJobApplied,
  isSaving,
}) => {
  if (!isOpen || !job) return null;

  const formatSalary = (salaryRange?: { min?: number; max?: number }) => {
    if (!salaryRange) return "Salary not specified";
    const { min, max } = salaryRange;
    if (min && max)
      return `LKR ${min.toLocaleString()} - LKR ${max.toLocaleString()}`;
    if (min) return `From LKR ${min.toLocaleString()}`;
    if (max) return `Up to LKR ${max.toLocaleString()}`;
    return "Salary not specified";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };

  const getTimeRemaining = (deadlineString: string) => {
    try {
      const deadline = new Date(deadlineString);
      const now = new Date();
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "Deadline passed";
      if (diffDays === 0) return "Deadline today";
      if (diffDays === 1) return "1 day remaining";
      return `${diffDays} days remaining`;
    } catch {
      return "Deadline not available";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#8243ff] to-purple-600 text-white rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                {job.logo || "🏢"}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{job.title}</h2>
                <p className="text-purple-100 text-lg">
                  {job.companyId?.companyName}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-purple-200">
                  <span className="flex items-center space-x-1">
                    <span>📍</span>
                    <span>{job.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>💼</span>
                    <span>{job.jobType}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>🏢</span>
                    <span>{job.workPlaceType}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Urgent Badge */}
          {job.urgent && (
            <div className="mt-3">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                🔥 Urgent Hiring
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">💰</span>
                <h4 className="font-semibold text-purple-800">Salary Range</h4>
              </div>
              <p className="text-purple-700">{formatSalary(job.salaryRange)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">📅</span>
                <h4 className="font-semibold text-purple-800">
                  Application Deadline
                </h4>
              </div>
              <p className="text-purple-700">{formatDate(job.deadline)}</p>
              <p className="text-xs text-purple-600 mt-1">
                {getTimeRemaining(job.deadline)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">👥</span>
                <h4 className="font-semibold text-purple-800">Applicants</h4>
              </div>
              <p className="text-purple-700">
                {job.applicantsCount} people applied
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Job Description
            </h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🛠️</span>
              Skills Required
            </h3>
            <div className="flex flex-wrap gap-3">
              {job.skillsRequired?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-[#8243ff] rounded-full text-sm font-medium hover:from-[#8243ff] hover:to-[#6c2bd9] hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Qualified Degrees */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🎓</span>
              Qualified Degrees
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {job.qualifiedDegrees?.map((degree, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg"
                >
                  <p className="text-purple-800 font-medium text-sm">
                    {degree}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Job Category & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">🏷️</span>
                Category
              </h3>
              <span className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-lg font-medium">
                {job.category}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Status
              </h3>
              <span
                className={`px-4 py-2 rounded-lg font-medium ${
                  job.status === "active"
                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                    : job.status === "closed"
                    ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                    : "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
                }`}
              >
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Posted Date */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">Posted on:</span>{" "}
              {formatDate(job.posted_date)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onApply(job._id)}
              disabled={job.status !== "active" || isJobApplied}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                isJobApplied
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : job.status !== "active"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#8243ff] to-purple-600 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
              }`}
            >
              {isJobApplied ? "Applied ✓" : "Apply Now"}
            </button>

            <button
              onClick={() => onSave(job._id)}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 border ${
                isJobSaved
                  ? "bg-gradient-to-r from-[#8243ff] to-purple-600 text-white border-[#8243ff]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#8243ff] hover:text-[#8243ff]"
              }`}
            >
              {isSaving ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span>Saving...</span>
                </span>
              ) : isJobSaved ? (
                "Saved ❤️"
              ) : (
                "Save Job"
              )}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
