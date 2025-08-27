"use client";

import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Building2,
  Calendar,
  MapPin,
  Users,
  Briefcase,
  Globe,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface AdminPostedJob {
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
  companyId?: string;
  customCompanyName?: string;
  companyWebsite?: string;
  originalAdLink?: string;
  postedByAdmin: boolean;
  adminId: string;
  adminUsername: string;
  status: "active" | "closed" | "pending";
  applicantsCount: number;
  posted_date: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPostedJobsTab() {
  const [jobs, setJobs] = useState<AdminPostedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<AdminPostedJob | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Edit form states
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    jobType: "",
    category: "",
    workPlaceType: "",
    location: "",
    deadline: "",
    qualifiedDegrees: [] as string[],
    skillsRequired: [] as string[],
    salaryRange: { min: 0, max: 0 },
    customCompanyName: "",
    companyWebsite: "",
    originalAdLink: "",
  });

  useEffect(() => {
    fetchAdminPostedJobs();
  }, []);

  const fetchAdminPostedJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_access_token");
      const response = await fetch("/api/admin/posted-jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        setMessage("Failed to fetch admin posted jobs");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching admin posted jobs:", error);
      setMessage("Network error occurred");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("admin_access_token");
      const response = await fetch(`/api/admin/posted-jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("Job deleted successfully");
        setMessageType("success");
        setJobs(jobs.filter((job) => job._id !== jobId));
        setShowDeleteModal(false);
        setSelectedJob(null);
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to delete job");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error occurred");
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";

    try {
      setActionLoading(true);
      const token = localStorage.getItem("admin_access_token");
      const response = await fetch(`/api/admin/posted-jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMessage(
          `Job ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully`
        );
        setMessageType("success");
        setJobs(
          jobs.map((job) =>
            job._id === jobId ? { ...job, status: newStatus } : job
          )
        );
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to update job status");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error occurred");
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditJob = (job: AdminPostedJob) => {
    setEditForm({
      title: job.title,
      description: job.description,
      jobType: job.jobType,
      category: job.category,
      workPlaceType: job.workPlaceType,
      location: job.location,
      deadline: job.deadline.split("T")[0], // Format for date input
      qualifiedDegrees: job.qualifiedDegrees,
      skillsRequired: job.skillsRequired,
      salaryRange: job.salaryRange || { min: 0, max: 0 },
      customCompanyName: job.customCompanyName || "",
      companyWebsite: job.companyWebsite || "",
      originalAdLink: job.originalAdLink || "",
    });
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedJob) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("admin_access_token");
      const response = await fetch(
        `/api/admin/posted-jobs/${selectedJob._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editForm,
            deadline: new Date(editForm.deadline).toISOString(),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage("Job updated successfully");
        setMessageType("success");

        // Update the job in the list
        setJobs(
          jobs.map((job) =>
            job._id === selectedJob._id ? { ...job, ...data.job } : job
          )
        );

        setShowEditModal(false);
        setSelectedJob(null);

        // Refresh the jobs list to get updated data
        fetchAdminPostedJobs();
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to update job");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error occurred");
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayFieldChange = (
    field: "qualifiedDegrees" | "skillsRequired",
    value: string
  ) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setEditForm((prev) => ({
      ...prev,
      [field]: items,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <XCircle className="w-3 h-3 mr-1" />
            Closed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getCompanyDisplay = (job: AdminPostedJob) => {
    return job.customCompanyName || job.companyId || "Unknown Company";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading admin posted jobs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Admin Posted Jobs
          </h2>
          <p className="text-gray-600 mt-1">Manage jobs posted by admin team</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Building2 className="w-4 h-4" />
          <span>{jobs.length} jobs posted by admins</span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Admin Posted Jobs
          </h3>
          <p className="text-gray-600">
            No jobs have been posted by admins yet. Start by creating a new job
            posting.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {job.title}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {job.jobType}
                          </span>
                        </div>
                        {job.companyWebsite && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Globe className="w-3 h-3 mr-1" />
                            <a
                              href={job.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Company Website
                            </a>
                          </div>
                        )}
                        {job.originalAdLink && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <LinkIcon className="w-3 h-3 mr-1" />
                            <a
                              href={job.originalAdLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Original Ad
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getCompanyDisplay(job)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {job.adminUsername}
                      </div>
                      <div className="text-sm text-gray-500">Admin</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(job.posted_date)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Deadline: {formatDate(job.deadline)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {job.applicantsCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditJob(job)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Job"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusToggle(job._id, job.status)
                          }
                          disabled={actionLoading}
                          className={`${
                            job.status === "active"
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          title={
                            job.status === "active"
                              ? "Deactivate Job"
                              : "Activate Job"
                          }
                        >
                          {job.status === "active" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showDetailsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedJob.title}
                </h3>
                <p className="text-gray-700 font-medium">
                  {getCompanyDisplay(selectedJob)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Job Information
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Type:</strong>{" "}
                    {selectedJob.jobType}
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Category:</strong>{" "}
                    {selectedJob.category}
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Work Place:</strong>{" "}
                    {selectedJob.workPlaceType}
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Location:</strong>{" "}
                    {selectedJob.location}
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Deadline:</strong>{" "}
                    {formatDate(selectedJob.deadline)}
                  </p>
                  {selectedJob.salaryRange && (
                    <p className="text-gray-700">
                      <strong className="text-gray-900">Salary:</strong> $
                      {selectedJob.salaryRange.min.toLocaleString()} - $
                      {selectedJob.salaryRange.max.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Admin Information
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Posted by:</strong>{" "}
                    {selectedJob.adminUsername}
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Posted date:</strong>{" "}
                    {formatDate(selectedJob.posted_date)}
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Status:</strong>{" "}
                    {getStatusBadge(selectedJob.status)}
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Applicants:</strong>{" "}
                    {selectedJob.applicantsCount}
                  </p>
                  {selectedJob.companyWebsite && (
                    <p className="text-gray-700">
                      <strong className="text-gray-900">
                        Company Website:
                      </strong>
                      <a
                        href={selectedJob.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </p>
                  )}
                  {selectedJob.originalAdLink && (
                    <p className="text-gray-700">
                      <strong className="text-gray-900">Original Ad:</strong>
                      <a
                        href={selectedJob.originalAdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Job Description
              </h4>
              <div className="text-sm text-gray-800 whitespace-pre-line bg-gray-50 p-4 rounded-lg border">
                {selectedJob.description}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Qualified Degrees
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.qualifiedDegrees.map((degree, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {degree}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Skills Required
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Job
              </h3>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "
              <strong className="text-gray-900">{selectedJob.title}</strong>"?
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedJob._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Job</h3>
                <p className="text-gray-700 font-medium">{selectedJob.title}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    handleEditFormChange("title", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  required
                />
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.customCompanyName}
                    onChange={(e) =>
                      handleEditFormChange("customCompanyName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={editForm.companyWebsite}
                    onChange={(e) =>
                      handleEditFormChange("companyWebsite", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Job Type *
                  </label>
                  <select
                    value={editForm.jobType}
                    onChange={(e) =>
                      handleEditFormChange("jobType", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    required
                  >
                    <option value="">Select Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      handleEditFormChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    placeholder="e.g., Software Development"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Work Place Type *
                  </label>
                  <select
                    value={editForm.workPlaceType}
                    onChange={(e) =>
                      handleEditFormChange("workPlaceType", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    required
                  >
                    <option value="">Select Work Place Type</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Location and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) =>
                      handleEditFormChange("location", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    value={editForm.deadline}
                    onChange={(e) =>
                      handleEditFormChange("deadline", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Salary Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={editForm.salaryRange.min}
                    onChange={(e) =>
                      handleEditFormChange("salaryRange", {
                        ...editForm.salaryRange,
                        min: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    placeholder="Minimum salary"
                  />
                  <input
                    type="number"
                    value={editForm.salaryRange.max}
                    onChange={(e) =>
                      handleEditFormChange("salaryRange", {
                        ...editForm.salaryRange,
                        max: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    placeholder="Maximum salary"
                  />
                </div>
              </div>

              {/* Original Ad Link */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Original Advertisement Link
                </label>
                <input
                  type="url"
                  value={editForm.originalAdLink}
                  onChange={(e) =>
                    handleEditFormChange("originalAdLink", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  placeholder="https://example.com/job-posting"
                />
              </div>

              {/* Qualified Degrees */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Qualified Degrees *
                </label>
                <input
                  type="text"
                  value={editForm.qualifiedDegrees.join(", ")}
                  onChange={(e) =>
                    handleArrayFieldChange("qualifiedDegrees", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  placeholder="Bachelor's Degree, Master's Degree (separate with commas)"
                  required
                />
              </div>

              {/* Skills Required */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Skills Required *
                </label>
                <input
                  type="text"
                  value={editForm.skillsRequired.join(", ")}
                  onChange={(e) =>
                    handleArrayFieldChange("skillsRequired", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  placeholder="JavaScript, React, Node.js (separate with commas)"
                  required
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    handleEditFormChange("description", e.target.value)
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-gray-900"
                  placeholder="Provide a detailed description of the job responsibilities, requirements, and benefits..."
                  required
                />
              </div>
            </form>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
