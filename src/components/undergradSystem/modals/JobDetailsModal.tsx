"use client";

import React from "react";
import {
  MdBusiness,
  MdLocationOn,
  MdWork,
  MdAttachMoney,
  MdCalendarToday,
  MdPeople,
  MdDescription,
  MdBuild,
  MdSchool,
  MdCategory,
  MdAnalytics,
  MdAccessTime,
  MdClose,
  MdFavorite,
  MdSave
} from 'react-icons/md';
import {
  FaFire,
  FaHeart,
  FaRegHeart,
  FaMoneyBillWave
} from 'react-icons/fa';
import { HiAcademicCap } from 'react-icons/hi';
import { GiSkills } from 'react-icons/gi';

interface CompanyProfile {
  _id: string;
  companyName: string;
}

interface AdditionalSection {
  title: string;
  bulletPoints: string[];
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
  customSections?: AdditionalSection[];
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
                {job.logo || <MdBusiness className="w-8 h-8 text-white" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{job.title}</h2>
                <p className="text-purple-100 text-lg">
                  {job.companyId?.companyName}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-purple-200">
                  <span className="flex items-center space-x-1">
                    <MdLocationOn className="w-4 h-4" />
                    <span>{job.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MdWork className="w-4 h-4" />
                    <span>{job.jobType}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MdBusiness className="w-4 h-4" />
                    <span>{job.workPlaceType}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl font-bold"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          {/* Urgent Badge */}
          {job.urgent && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                <FaFire className="w-4 h-4" />
                Urgent Hiring
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
                <FaMoneyBillWave className="w-5 h-5 text-purple-800" />
                <h4 className="font-semibold text-purple-800">Salary Range</h4>
              </div>
              <p className="text-purple-700">{formatSalary(job.salaryRange)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <MdCalendarToday className="w-5 h-5 text-purple-800" />
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
                <MdPeople className="w-5 h-5 text-purple-800" />
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
              Job Description
            </h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>

          {/* Additional Sections */}
          {job.customSections && job.customSections.length > 0 && (
            <div className="space-y-4">
              {job.customSections.map((section, sectionIndex) => (
                <div key={`${section.title}-${sectionIndex}`} className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {section.title}
                  </h3>
                  {section.bulletPoints && section.bulletPoints.length > 0 ? (
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      {section.bulletPoints.map((point, pointIndex) => (
                        <li key={`${section.title}-${pointIndex}`}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No details provided for this section.</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills Required */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
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
                Category
              </h3>
              <span className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-lg font-medium">
                {job.category}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
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
            <p className="text-gray-600 text-sm flex items-center">
              <MdAccessTime className="w-4 h-4 mr-2" />
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
              className={`flex-1 px-6 py-3 rounded-lg font-medium cursor-pointer ${
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
              className={`px-6 py-3 rounded-lg font-medium border cursor-pointer ${
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
                <span className="flex items-center space-x-1">
                  <FaHeart className="w-4 h-4" />
                  <span>Saved</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1">
                  <FaRegHeart className="w-4 h-4" />
                  <span>Save Job</span>
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer"
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