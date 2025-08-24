"use client";

import React, { useState, useEffect } from "react";
import ViewApplicantsModal from "@/components/company/modals/ViewApplicantsModal";

interface JobPosting {
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
  companyId: string;
  status: "active" | "closed" | "pending";
  applicantsCount: number;
  posted_date: string;
  salaryRange?: {
    min: number;
    max: number;
  };
}

export default function JobPostingTab() {
  const [activeJobForm, setActiveJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Modal state for viewing applicants
  const [viewApplicantsModal, setViewApplicantsModal] = useState<{
    isOpen: boolean;
    jobId: string;
    jobTitle: string;
  }>({
    isOpen: false,
    jobId: "",
    jobTitle: "",
  });

  // Form data structure matching our job model
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobType: "",
    category: "",
    workPlaceType: "",
    location: "",
    deadline: "",
    qualifiedDegrees: [] as string[],
    skillsRequired: [] as string[],
    salaryRange: {
      min: 0,
      max: 0,
    },
  });

  const jobTypes = ["Full-time", "Part-time", "Internship"];
  const categories = [
    "Architecture",
    "Business",
    "Engineering",
    "Information Technology",
    "Medicine",
    "Design",
    "Management",
    "Other",
  ];
  const workPlaceTypes = ["On-site", "Remote", "Hybrid"];
  const degrees = [
    "Bachelor of Architecture Honours",
    "Bachelor of Landscape Architecture Honours",
    "Bachelor of Design Honours",
    "BSc (Hons) Town & Country Planning",
    "BSc (Hons) Quantity Surveying",
    "BSc (Hons) Facilities Management",
    "Bachelor of Business Science Honours",
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
    "BSc (Hons) Information Technology",
    "BSc (Hons) Information Technology & Management",
    "BSc (Hons) Artificial Intelligence",
    "Bachelor of Information Technology External Degree",
    "Bachelor of Medicine and Bachelor of Surgery",
  ];

  // Fetch existing jobs
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch("/api/job/company", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Client-side validation
    if (formData.qualifiedDegrees.length === 0) {
      setMessage("Please select at least one qualified degree");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("company_accessToken");

      const response = await fetch("/api/job/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Job posted successfully!");
        setActiveJobForm(false);
        // Reset form
        setFormData({
          title: "",
          description: "",
          jobType: "",
          category: "",
          workPlaceType: "",
          location: "",
          deadline: "",
          qualifiedDegrees: [],
          skillsRequired: [],
          salaryRange: { min: 0, max: 0 },
        });
        // Refresh jobs list
        fetchJobs();
      } else {
        setMessage(result.error || "Failed to post job");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
    // Find the job to get its title for confirmation
    const job = jobs.find((j) => j._id === id);
    const jobTitle = job ? job.title : "this job";

    // Confirm deletion
    if (
      !confirm(
        `Are you sure you want to permanently delete "${jobTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch(`/api/job/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setJobs(jobs.filter((job) => job._id !== id));
        setMessage(`✅ Job "${jobTitle}" deleted successfully`);
        // Clear message after 5 seconds
        setTimeout(() => setMessage(""), 5000);
      } else {
        const errorData = await response.json();
        setMessage(
          `❌ Failed to delete job: ${errorData.error || "Unknown error"}`
        );
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error("Delete job error:", error);
      setMessage("❌ Failed to delete job: Network error");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const toggleJobStatus = async (id: string) => {
    try {
      const job = jobs.find((j) => j._id === id);
      if (!job) return;

      const newStatus = job.status === "active" ? "closed" : "active";
      const action = newStatus === "active" ? "activate" : "close";

      // Confirm status change
      if (
        !confirm(`Are you sure you want to ${action} the job "${job.title}"?`)
      ) {
        return;
      }

      const token = localStorage.getItem("company_accessToken");

      const response = await fetch(`/api/job/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setJobs(
          jobs.map((job) =>
            job._id === id ? { ...job, status: newStatus } : job
          )
        );
        setMessage(`✅ Job "${job.title}" ${action}d successfully`);
        setTimeout(() => setMessage(""), 5000);
      } else {
        const errorData = await response.json();
        setMessage(
          `❌ Failed to ${action} job: ${errorData.error || "Unknown error"}`
        );
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error("Toggle job status error:", error);
      setMessage("❌ Failed to update job status: Network error");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleDegreeChange = (degree: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        qualifiedDegrees: [...prev.qualifiedDegrees, degree],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        qualifiedDegrees: prev.qualifiedDegrees.filter((d) => d !== degree),
      }));
    }
  };

  const handleSkillAdd = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skillsRequired.includes(trimmedSkill)) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, trimmedSkill],
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Job Postings</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your job listings
          </p>
        </div>
        <button
          onClick={() => setActiveJobForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-[#8243ff] to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Post New Job
        </button>
      </div>

      {/* Info Box - Job Management Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          Job Management Actions:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-700">
          <div className="flex items-start space-x-2">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
              Activate
            </span>
            <span>
              Makes the job visible to students and allows new applications
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
              Close
            </span>
            <span>
              Stops new applications but keeps existing applicant data
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
              Delete
            </span>
            <span>
              Permanently removes the job and all applicant data (cannot be
              undone)
            </span>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center justify-between ${
            message.includes("✅")
              ? "bg-green-50 border-green-200 text-green-800"
              : message.includes("❌")
              ? "bg-red-50 border-red-200 text-red-800"
              : message.includes("successfully")
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span className="flex items-center">
            {message.includes("✅") ? (
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {message}
          </span>
          <button
            onClick={() => setMessage("")}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {jobs.filter((job) => job.status === "active").length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Applications
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {jobs.reduce((sum, job) => sum + job.applicantsCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {jobs.filter((job) => job.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Avg Applications
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {jobs.length
                  ? Math.round(
                      jobs.reduce((sum, job) => sum + job.applicantsCount, 0) /
                        jobs.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="glass-effect rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr
                  key={job._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.category} • {job.location}
                      </div>
                      <div className="text-xs text-gray-400">
                        Posted: {new Date(job.posted_date).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{job.jobType}</div>
                    <div className="text-sm text-gray-500">
                      {job.workPlaceType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {job.applicantsCount}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        applicants
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.status === "active"
                          ? "bg-green-100 text-green-800"
                          : job.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleJobStatus(job._id)}
                        title={
                          job.status === "active"
                            ? "Close this job posting (stops new applications)"
                            : "Activate this job posting (allows new applications)"
                        }
                        className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                          job.status === "active"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {job.status === "active" ? "Close" : "Activate"}
                      </button>
                      <button
                        onClick={() => deleteJob(job._id)}
                        title="Permanently delete this job posting (cannot be undone)"
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors duration-200"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() =>
                          setViewApplicantsModal({
                            isOpen: true,
                            jobId: job._id,
                            jobTitle: job.title,
                          })
                        }
                        title="View all applicants for this job"
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors duration-200"
                      >
                        View ({job.applicantsCount})
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Job Form Modal */}
      {activeJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#8243ff] to-purple-600 text-white rounded-t-lg">
              <h3 className="text-xl font-bold">Post New Job</h3>
              <p className="text-purple-100 text-sm">
                Fill in the details to create a new job posting
              </p>
              <div className="mt-2 text-xs text-purple-200">
                Required fields: Title, Category, Job Type, Work Place Type,
                Location, Deadline, Qualified Degrees
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form Progress Indicator */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  Form Completion Status:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div
                    className={`flex items-center ${
                      formData.title ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <span className="mr-1">{formData.title ? "✓" : "○"}</span>{" "}
                    Title
                  </div>
                  <div
                    className={`flex items-center ${
                      formData.category ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <span className="mr-1">
                      {formData.category ? "✓" : "○"}
                    </span>{" "}
                    Category
                  </div>
                  <div
                    className={`flex items-center ${
                      formData.jobType ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <span className="mr-1">{formData.jobType ? "✓" : "○"}</span>{" "}
                    Job Type
                  </div>
                  <div
                    className={`flex items-center ${
                      formData.workPlaceType
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <span className="mr-1">
                      {formData.workPlaceType ? "✓" : "○"}
                    </span>{" "}
                    Work Type
                  </div>
                  <div
                    className={`flex items-center ${
                      formData.location ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <span className="mr-1">
                      {formData.location ? "✓" : "○"}
                    </span>{" "}
                    Location
                  </div>
                  <div
                    className={`flex items-center ${
                      formData.deadline ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <span className="mr-1">
                      {formData.deadline ? "✓" : "○"}
                    </span>{" "}
                    Deadline
                  </div>
                  <div
                    className={`flex items-center ${
                      formData.description ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <span className="mr-1">
                      {formData.description ? "✓" : "○"}
                    </span>{" "}
                    Description
                  </div>
                  <div
                    className={`flex items-center ${
                      formData.qualifiedDegrees.length > 0
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    <span className="mr-1">
                      {formData.qualifiedDegrees.length > 0 ? "✓" : "✗"}
                    </span>{" "}
                    Degrees ({formData.qualifiedDegrees.length})
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    value={formData.jobType}
                    onChange={(e) =>
                      setFormData({ ...formData, jobType: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    required
                  >
                    <option value="">Select Type</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Place Type *
                  </label>
                  <select
                    value={formData.workPlaceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workPlaceType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    required
                  >
                    <option value="">Select Work Place Type</option>
                    {workPlaceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    placeholder="e.g. Colombo, Sri Lanka"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Salary Range (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={formData.salaryRange.min || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salaryRange: {
                            ...formData.salaryRange,
                            min: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={formData.salaryRange.max || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salaryRange: {
                            ...formData.salaryRange,
                            max: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qualified Degrees *
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.qualifiedDegrees.length} selected)
                  </span>
                </label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  {formData.qualifiedDegrees.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected degrees:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.qualifiedDegrees.map((degree) => (
                          <span
                            key={degree}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                          >
                            {degree}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 bg-white p-3 rounded">
                    {degrees.map((degree) => (
                      <label
                        key={degree}
                        className="flex items-start space-x-2 text-sm cursor-pointer hover:bg-blue-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.qualifiedDegrees.includes(degree)}
                          onChange={(e) =>
                            handleDegreeChange(degree, e.target.checked)
                          }
                          className="mt-1 rounded border-gray-300 text-[#8243ff] focus:ring-[#8243ff]"
                        />
                        <span className="leading-5">{degree}</span>
                      </label>
                    ))}
                  </div>
                  {formData.qualifiedDegrees.length === 0 && (
                    <p className="text-red-500 text-xs mt-2">
                      Please select at least one qualified degree
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Skills Required (Optional)
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.skillsRequired.length} skills added)
                  </span>
                </label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  {formData.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skillsRequired.map((skill) => (
                        <span
                          key={skill}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(skill)}
                            className="ml-2 text-green-600 hover:text-green-800 font-bold text-lg leading-none"
                            title="Remove skill"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter to add (e.g., JavaScript, Leadership, etc.)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const skill = e.currentTarget.value.trim();
                        if (skill) {
                          handleSkillAdd(skill);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Press Enter after typing each skill to add it to the
                    list
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveJobForm(false)}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.qualifiedDegrees.length === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    loading || formData.qualifiedDegrees.length === 0
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#8243ff] to-purple-600 text-white hover:from-purple-700 hover:to-purple-800"
                  }`}
                  title={
                    formData.qualifiedDegrees.length === 0
                      ? "Please select at least one qualified degree"
                      : ""
                  }
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Posting Job...
                    </span>
                  ) : (
                    "Post Job"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Applicants Modal */}
      <ViewApplicantsModal
        isOpen={viewApplicantsModal.isOpen}
        onClose={() =>
          setViewApplicantsModal({
            isOpen: false,
            jobId: "",
            jobTitle: "",
          })
        }
        jobId={viewApplicantsModal.jobId}
        jobTitle={viewApplicantsModal.jobTitle}
      />
    </div>
  );
}
