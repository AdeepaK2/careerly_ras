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
  AlertTriangle,
  CheckCircle,
  XCircle,
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
  reported: boolean;
  reportReason?: string;
  reportDescription?: string;
  reportedBy?: string;
  reportedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNote?: string;
}

export default function ReportedJobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "remove" | "">("");
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    fetchReportedJobs();
  }, []);

  const fetchReportedJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_access_token");
      const response = await fetch("/api/admin/job/reported", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        setMessage("Failed to fetch reported jobs");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching reported jobs:", error);
      setMessage("Error fetching reported jobs");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const handleAction = (job: Job, action: "approve" | "remove") => {
    setSelectedJob(job);
    setActionType(action);
    setActionNote("");
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedJob || !actionType) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("admin_access_token");
      const response = await fetch("/api/admin/job/reported", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: selectedJob._id,
          action: actionType,
          adminNote: actionNote,
        }),
      });

      if (response.ok) {
        setMessage(`Job ${actionType}d successfully`);
        setMessageType("success");
        setShowActionModal(false);
        fetchReportedJobs(); // Refresh the list
      } else {
        const data = await response.json();
        setMessage(data.error || `Failed to ${actionType} job`);
        setMessageType("error");
      }
    } catch (error) {
      console.error(`Error ${actionType}ing job:`, error);
      setMessage(`Error ${actionType}ing job`);
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCompanyName = (job: Job) => {
    if (job.postedByAdmin) {
      return job.customCompanyName || "External Company";
    }
    return job.companyId?.companyName || "Unknown Company";
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
          <button
            onClick={() => setMessage("")}
            className="ml-4 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Reported Jobs
              </h2>
              <p className="text-gray-600 mt-1">
                Job postings that have been reported by users and require
                moderation
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Total: {jobs.length} reports
            </div>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No reported jobs
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no reported job postings requiring review.
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
                    Report Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported
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
                        <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
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
                      <div className="text-sm text-gray-900">
                        {job.reportReason || "No reason specified"}
                      </div>
                      {job.reportDescription && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {job.reportDescription}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {job.reportedAt
                          ? formatDate(job.reportedAt)
                          : "Unknown"}
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(job)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction(job, "approve")}
                          className="text-green-600 hover:text-green-900"
                          title="Approve (Remove Report)"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction(job, "remove")}
                          className="text-red-600 hover:text-red-900"
                          title="Remove Job"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
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
                  Reported Job Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-orange-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        This job has been reported
                      </p>
                      <p className="text-sm text-orange-700 mt-1">
                        <strong>Reason:</strong>{" "}
                        {selectedJob.reportReason || "No reason specified"}
                      </p>
                      {selectedJob.reportDescription && (
                        <p className="text-sm text-orange-700 mt-1">
                          <strong>Description:</strong>{" "}
                          {selectedJob.reportDescription}
                        </p>
                      )}
                      <p className="text-xs text-orange-600 mt-1">
                        Reported on{" "}
                        {selectedJob.reportedAt
                          ? formatDate(selectedJob.reportedAt)
                          : "Unknown date"}
                      </p>
                    </div>
                  </div>
                </div>

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

              <div className="mt-6 flex justify-between">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleAction(selectedJob, "approve");
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve Job
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleAction(selectedJob, "remove");
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove Job
                  </button>
                </div>
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

      {/* Action Confirmation Modal */}
      {showActionModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === "approve" ? "Approve Job" : "Remove Job"}
                </h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {actionType === "approve"
                    ? "This will remove the report and make the job active again."
                    : "This will permanently close the job posting."}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Note (Optional)
                  </label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder={`Add a note about this ${actionType} action...`}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`px-4 py-2 text-white rounded-md ${
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Processing..."
                    : `${actionType === "approve" ? "Approve" : "Remove"} Job`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
