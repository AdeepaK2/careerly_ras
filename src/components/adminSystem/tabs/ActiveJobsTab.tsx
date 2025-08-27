"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  ExternalLink,
  Building2,
  Calendar,
  MapPin,
  Users,
  Briefcase,
  Globe,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  description: string;
  jobType: string;
  category: string;
  workPlaceType: string;
  location: string;
  deadline: string;
  qualifiedDegrees: string[];
  skillsRequired: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
  companyId?: {
    _id: string;
    companyName: string;
    logo?: string;
  };
  customCompanyName?: string;
  companyWebsite?: string;
  originalAdLink?: string;
  postedByAdmin: boolean;
  adminUsername?: string;
  status: "active" | "closed" | "pending";
  applicantsCount: number;
  posted_date: string;
  createdAt: string;
  updatedAt: string;
}

export default function ActiveJobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_access_token");
      console.log(
        "Token from localStorage:",
        token ? "Token exists" : "No token found"
      );

      const response = await fetch("/api/admin/job/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Jobs data:", data);
        setJobs(data.jobs || []);
        setMessage("");
        setMessageType("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log("Error response:", errorData);
        setMessage(
          `Failed to fetch active jobs (${response.status}): ${
            errorData.error || "Unknown error"
          }`
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      setMessage(
        `Error fetching active jobs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCompanyName = (job: Job) => {
    if (job.postedByAdmin) {
      return job.customCompanyName || "External Company";
    }
    return job.companyId?.companyName || "Unknown Company";
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Active Jobs</h2>
              <p className="text-gray-600 mt-1">
                Currently active job postings from companies
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Total: {jobs.length} jobs
            </div>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No active jobs
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no active job postings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {job.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {job.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getCompanyName(job)}
                          </div>
                          {job.postedByAdmin && (
                            <div className="text-xs text-blue-600">
                              Admin Posted
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.jobType}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.workPlaceType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(job.deadline)}
                      </div>
                      <div
                        className={`text-xs ${
                          getDaysUntilDeadline(job.deadline) <= 7
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {getDaysUntilDeadline(job.deadline)} days left
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {job.applicantsCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(job)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showDetailsModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Job Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {selectedJob.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getCompanyName(selectedJob)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Job Type
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedJob.jobType}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedJob.category}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Work Place Type
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedJob.workPlaceType}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedJob.location}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.salaryRange && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Salary Range
                    </label>
                    <p className="text-sm text-gray-900">
                      ${selectedJob.salaryRange.min.toLocaleString()} - $
                      {selectedJob.salaryRange.max.toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Qualified Degrees
                  </label>
                  <div className="mt-1">
                    {selectedJob.qualifiedDegrees.map((degree, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1"
                      >
                        {degree}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedJob.skillsRequired &&
                  selectedJob.skillsRequired.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Skills Required
                      </label>
                      <div className="mt-1">
                        {selectedJob.skillsRequired.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2 mb-1"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Deadline
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedJob.deadline)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Applications
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedJob.applicantsCount}
                    </p>
                  </div>
                </div>

                {selectedJob.originalAdLink && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Original Ad Link
                    </label>
                    <a
                      href={selectedJob.originalAdLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Original Ad
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
