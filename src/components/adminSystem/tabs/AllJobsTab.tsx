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
  Search,
  Filter,
  User,
  Shield,
  Edit,
  RefreshCw,
  RotateCcw,
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

type FilterOptions = {
  search: string;
  postedBy: "all" | "company" | "admin";
  status: "all" | "active" | "expired" | "closed";
  jobType: "all" | "Full-time" | "Part-time" | "Internship";
  category: string;
};

type EditFormData = {
  title: string;
  customCompanyName: string;
  description: string;
  jobType: string;
  category: string;
  workPlaceType: string;
  location: string;
  deadline: string;
  salaryMin: string;
  salaryMax: string;
  qualifiedDegrees: string;
  skillsRequired: string;
  companyWebsite: string;
  originalAdLink: string;
  status: string;
};

export default function AllJobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    customCompanyName: "",
    description: "",
    jobType: "",
    category: "",
    workPlaceType: "",
    location: "",
    deadline: "",
    salaryMin: "",
    salaryMax: "",
    qualifiedDegrees: "",
    skillsRequired: "",
    companyWebsite: "",
    originalAdLink: "",
    status: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    postedBy: "all",
    status: "all",
    jobType: "all",
    category: "all",
  });

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

  useEffect(() => {
    fetchAllJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_access_token");

      // Fetch from the unified jobs endpoint
      const response = await fetch("/api/admin/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setMessage("");
        setMessageType("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(
          `Failed to fetch jobs: ${errorData.error || "Unknown error"}`
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setMessage("Error fetching jobs");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];
    const currentDate = new Date();

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.category.toLowerCase().includes(searchLower) ||
          getCompanyName(job).toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower)
      );
    }

    // Posted by filter
    if (filters.postedBy !== "all") {
      filtered = filtered.filter((job) =>
        filters.postedBy === "admin" ? job.postedByAdmin : !job.postedByAdmin
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((job) => {
        const isExpired = new Date(job.deadline) < currentDate;
        switch (filters.status) {
          case "active":
            return job.status === "active" && !isExpired;
          case "expired":
            return isExpired;
          case "closed":
            return job.status === "closed";
          default:
            return true;
        }
      });
    }

    // Job type filter
    if (filters.jobType !== "all") {
      filtered = filtered.filter((job) => job.jobType === filters.jobType);
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((job) => job.category === filters.category);
    }

    setFilteredJobs(filtered);
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title,
      customCompanyName: job.customCompanyName || "",
      description: job.description,
      jobType: job.jobType,
      category: job.category,
      workPlaceType: job.workPlaceType,
      location: job.location,
      deadline: job.deadline.split("T")[0],
      salaryMin: job.salaryRange?.min?.toString() || "",
      salaryMax: job.salaryRange?.max?.toString() || "",
      qualifiedDegrees: job.qualifiedDegrees.join(", "),
      skillsRequired: job.skillsRequired.join(", "),
      companyWebsite: job.companyWebsite || "",
      originalAdLink: job.originalAdLink || "",
      status: job.status,
    });
    setShowEditModal(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("admin_access_token");

      // Prepare the data for API
      const updatedJobData = {
        title: editFormData.title,
        customCompanyName: editFormData.customCompanyName,
        description: editFormData.description,
        jobType: editFormData.jobType,
        category: editFormData.category,
        workPlaceType: editFormData.workPlaceType,
        location: editFormData.location,
        deadline: editFormData.deadline,
        salaryRange:
          editFormData.salaryMin && editFormData.salaryMax
            ? {
                min: parseInt(editFormData.salaryMin),
                max: parseInt(editFormData.salaryMax),
              }
            : undefined,
        qualifiedDegrees: editFormData.qualifiedDegrees
          .split(",")
          .map((deg: string) => deg.trim())
          .filter((deg: string) => deg),
        skillsRequired: editFormData.skillsRequired
          .split(",")
          .map((skill: string) => skill.trim())
          .filter((skill: string) => skill),
        companyWebsite: editFormData.companyWebsite,
        originalAdLink: editFormData.originalAdLink,
        status: editFormData.status,
      };

      const response = await fetch(`/api/admin/job/${editingJob._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedJobData),
      });

      if (response.ok) {
        setMessage("Job updated successfully!");
        setMessageType("success");
        setShowEditModal(false);
        setEditingJob(null);
        setEditFormData({
          title: "",
          customCompanyName: "",
          description: "",
          jobType: "",
          category: "",
          workPlaceType: "",
          location: "",
          deadline: "",
          salaryMin: "",
          salaryMax: "",
          qualifiedDegrees: "",
          skillsRequired: "",
          companyWebsite: "",
          originalAdLink: "",
          status: "",
        });
        // Refresh the jobs list
        fetchAllJobs();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(
          `Failed to update job: ${errorData.error || "Unknown error"}`
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      setMessage("Error updating job");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      postedBy: "all",
      status: "all",
      jobType: "all",
      category: "all",
    });
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

  const getJobStatus = (job: Job) => {
    const currentDate = new Date();
    const isExpired = new Date(job.deadline) < currentDate;

    if (isExpired) return "Expired";
    if (job.status === "closed") return "Closed";
    if (job.status === "active") return "Active";
    return job.status;
  };

  const getStatusColor = (job: Job) => {
    const status = getJobStatus(job);
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Expired":
        return "bg-red-100 text-red-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                All Job Postings
              </h2>
              <p className="mt-1 text-sm text-gray-900">
                Manage all job postings with advanced filtering options
              </p>
            </div>
            <div className="text-sm text-gray-900">
              Showing: {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* Posted By */}
            <div>
              <select
                value={filters.postedBy}
                onChange={(e) => handleFilterChange("postedBy", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
              >
                <option value="all">All Posters</option>
                <option value="company">Company Posted</option>
                <option value="admin">Admin Posted</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange("jobType", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Clear All Filters</span>
            </button>
            <button
              onClick={fetchAllJobs}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No jobs found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Posted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Type & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 bg-white">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {job.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {job.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getCompanyName(job)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          job.postedByAdmin
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {job.postedByAdmin ? "Admin" : "Company"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {job.jobType}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                        {job.location}
                      </div>
                      <div className="text-sm text-gray-600">
                        {job.workPlaceType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          job
                        )}`}
                      >
                        {getJobStatus(job)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(job.deadline)}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          getDaysUntilDeadline(job.deadline) <= 7
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {getDaysUntilDeadline(job.deadline) > 0
                          ? `${getDaysUntilDeadline(job.deadline)} days left`
                          : `${Math.abs(
                              getDaysUntilDeadline(job.deadline)
                            )} days ago`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {job.applicantsCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleViewDetails(job)}
                          className="text-purple-600 hover:text-purple-800 px-3 py-1 rounded-md hover:bg-purple-50 flex items-center space-x-1"
                          title="View Full Details"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-xs font-medium">View Full</span>
                        </button>
                        {job.postedByAdmin && (
                          <button
                            onClick={() => handleEditJob(job)}
                            className="text-green-600 hover:text-green-800 px-3 py-1 rounded-md hover:bg-green-50 flex items-center space-x-1"
                            title="Edit Job"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="text-xs font-medium">Edit</span>
                          </button>
                        )}
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
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(
                      selectedJob
                    )}`}
                  >
                    {getJobStatus(selectedJob)}
                  </span>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Posted By
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedJob.postedByAdmin
                      ? `Admin (${selectedJob.adminUsername || "Unknown"})`
                      : "Company"}
                  </p>
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
                      className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
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

      {/* Edit Job Modal */}
      {showEditModal && editingJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl"
            style={{ maxHeight: "90vh" }}
          >
            <div
              className="flex flex-col"
              style={{ height: "90vh", maxHeight: "90vh" }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                  Edit Job - {editingJob.title}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form
                  id="edit-job-form"
                  onSubmit={handleSaveJob}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={editFormData.title || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.customCompanyName || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            customCompanyName: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Job Description
                    </label>
                    <textarea
                      rows={4}
                      value={editFormData.description || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Job Type
                      </label>
                      <select
                        value={editFormData.jobType || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            jobType: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                        required
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        value={editFormData.category || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                        required
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Work Place Type
                      </label>
                      <select
                        value={editFormData.workPlaceType || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            workPlaceType: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                        required
                      >
                        <option value="On-site">On-site</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editFormData.location || `"`}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={editFormData.deadline || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            deadline: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                        required
                      />
                    </div>
                  </div>

                  {editingJob.salaryRange && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Minimum Salary
                        </label>
                        <input
                          type="number"
                          defaultValue={editingJob.salaryRange.min}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Maximum Salary
                        </label>
                        <input
                          type="number"
                          defaultValue={editingJob.salaryRange.max}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Qualified Degrees (comma-separated)
                    </label>
                    <input
                      type="text"
                      defaultValue={editingJob.qualifiedDegrees.join(", ")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Skills Required (comma-separated)
                    </label>
                    <input
                      type="text"
                      defaultValue={editingJob.skillsRequired.join(", ")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Company Website
                    </label>
                    <input
                      type="url"
                      defaultValue={editingJob.companyWebsite || ""}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Original Ad Link
                    </label>
                    <input
                      type="url"
                      defaultValue={editingJob.originalAdLink || ""}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={editFormData.status || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-200 p-6 flex-shrink-0">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="edit-job-form"
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-md text-white ${
                      isSubmitting
                        ? "bg-purple-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
