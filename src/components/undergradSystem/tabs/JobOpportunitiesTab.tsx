"use client";

import { useState, useEffect } from "react";
import { useAuthenticatedRequest } from "@/hooks/useAuthenticatedRequest";
import JobDetailsModal from "../modals/JobDetailsModal";
import ApplyJobModal from "../modals/ApplyJobModal";

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

interface ApplicationFormData {
  cv: File | null;
  coverLetter: string;
  specialRequirements?: string;
}

export default function JobOpportunitiesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savingJob, setSavingJob] = useState<string | null>(null);
  const [applyingJob, setApplyingJob] = useState<string | null>(null);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // state for tracking sort order
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Modal states
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] =
    useState<JobOpportunity | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Message states for application form
  const [applicationMessage, setApplicationMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const { makeAuthenticatedRequest } = useAuthenticatedRequest();

  const makeRequest = async (url: string, options: RequestInit = {}) => {
    const response = await makeAuthenticatedRequest(url, options);
    return await response.json();
  };

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
    fetchAppliedJobs();
  }, [showAllJobs]);

  const fetchJobs = async (isLoadMore = false) => {

    const currentPage = isLoadMore ? page + 1 : 1;
    if (isLoadMore) {
      setIsFetchingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const endpoint = showAllJobs ? "/api/job/undergrad/all" : `/api/job/undergrad?page=${currentPage}&limit=10`;
      const response = await makeRequest(endpoint, {
        method: "GET",
      });
      console.log("Response Data:", response.jobs);

      if (response.jobs && Array.isArray(response.jobs)) {
        const sortedJobs = sortJobsByDate(response.jobs, sortOrder);
        if (isLoadMore) {
          setJobs((prevJobs) => [...prevJobs, ...sortedJobs]);
        } else {
          setJobs(sortedJobs);
        }
        setPage(currentPage);
        setHasMore(response.jobs.length === 10);
      } else {
        throw new Error("Failed to fetch job opportunities");
      }
    } catch (error) {
      console.error("Error fetching job opportunities:", error);
      setJobs([]);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await makeRequest("/api/job/undergrad/saved", {
        method: "GET",
      });

      if (response.success) {
        const savedJobs = response.data.savedJobs.map((job: any) => job.jobId._id);
        setSavedJobs(new Set(savedJobs));
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await makeRequest("/api/application/applied", {
        method: "GET",
      });

      if (response.success) {
        const appliedJobs = response.data.map((job: any) => job.jobId._id);
        console.log("Applied Jobs:", appliedJobs);
        setAppliedJobs(new Set(appliedJobs));
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };


  const handleSortClick = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);
    const sortedJobs = sortJobsByDate(jobs, newSortOrder);
    setJobs(sortedJobs);
  };

  const handleSaveJob = async (jobId: string) => {
    const isSaved = savedJobs.has(jobId);
    setSavingJob(jobId);

    try {
      const response = await makeRequest(`/api/job/${jobId}/save`, {
        method: isSaved ? "DELETE" : "POST",
      });

      if (response.success || !response.error) {
        if (isSaved) {
          setSavedJobs((prev) => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        } else {
          setSavedJobs((prev) => new Set(prev).add(jobId));
        }
      } else {
        console.error("Failed to save/unsave job:", response.error);
        alert(response.error || "Failed to save job");
      }
    } catch (error) {
      console.error("Error saving/unsaving job:", error);
      alert("Failed to save job. Please try again.");
    } finally {
      setSavingJob(null);
    }
  };

  const handleApplyClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowApplicationForm(true);
    setApplicationMessage({ type: null, text: "" });
  };

  const handleApplicationSubmit = async (formData: ApplicationFormData) => {
    if (!selectedJobId) return;
    setApplicationMessage({ type: null, text: "" });
    setApplyingJob(selectedJobId);

    try {
      // First, upload the CV file if provided
      let cvUrl = "";
      if (formData.cv) {
        const cvFormData = new FormData();
        cvFormData.append("file", formData.cv);
        cvFormData.append("folderPath", "applications/cv");

        const uploadResponse = await makeAuthenticatedRequest("/api/file/upload", {
          method: "POST",
          body: cvFormData,
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || "Failed to upload CV");
        }
        cvUrl = uploadResult.data.url;
      }

      // Then submit the application
      const applicationData = {
        cv: cvUrl,
        coverLetter: formData.coverLetter,
        specialRequirements: formData.specialRequirements || "",
      };

      const response = await makeRequest(`/api/job/${selectedJobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (response.success) {
        setAppliedJobs((prev) => new Set(prev).add(selectedJobId));
        setApplicationMessage({
          type: "success",
          text: "Application submitted successfully!",
        });

        setJobs((prev) =>
          prev.map((job) =>
            job._id === selectedJobId
              ? { ...job, applicantsCount: job.applicantsCount + 1 }
              : job
          )
        );

        setTimeout(() => {
          setShowApplicationForm(false);
        }, 2000);
      } else {
        setApplicationMessage({
          type: "error",
          text:
            response.error || "Failed to submit application. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setApplicationMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to submit application. Please check your connection and try again.",
      });
    } finally {
      setApplyingJob(null);
    }
  };

  // Handle view details click
  const handleViewDetailsClick = (job: JobOpportunity) => {
    setSelectedJobForDetails(job);
    setShowJobDetails(true);
  };

  // Handle apply from details modal
  const handleApplyFromDetails = (jobId: string) => {
    setShowJobDetails(false);
    handleApplyClick(jobId);
  };

  // Handle view all jobs with warning
  const handleViewAllJobs = () => {
    if (!showAllJobs) {
      setShowWarningModal(true);
    } else {
      setShowAllJobs(false);
      setLoading(true);
    }
  };

  const confirmViewAllJobs = () => {
    setShowWarningModal(false);
    setShowAllJobs(true);
    setLoading(true);
  };

  // Helper function to sort jobs by date
  const sortJobsByDate = (jobsToSort: JobOpportunity[],order: "asc" | "desc") => {
    return [...jobsToSort].sort((a, b) => {
      const dateA = new Date(a.posted_date).getTime();
      const dateB = new Date(b.posted_date).getTime();
      return order === "desc" ? dateB - dateA : dateA - dateB;
    });
  };

  // Helper function to format salary
  const formatSalary = (salaryRange?: { min?: number; max?: number }) => {
    if (!salaryRange) return "Salary not specified";
    const { min, max } = salaryRange;
    if (min && max)
      return `LKR ${min.toLocaleString()} - LKR ${max.toLocaleString()}`;
    if (min) return `From LKR ${min.toLocaleString()}`;
    if (max) return `Up to LKR ${max.toLocaleString()}`;
    return "Salary not specified";
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    } catch {
      return "Recently posted";
    }
  };

  const filters = [
    { id: "all", label: "All Jobs", count: jobs.length },
    {
      id: "full-time",
      label: "Full-time",
      count: jobs.filter((job) => job.jobType === "Full-time").length,
    },
    {
      id: "internship",
      label: "Internship",
      count: jobs.filter((job) => job.jobType === "Internship").length,
    },
    {
      id: "part-time",
      label: "Part-time",
      count: jobs.filter((job) => job.jobType === "Part-time").length,
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyId?.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      job.skillsRequired?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "all" ||
      job.jobType.toLowerCase().replace(" ", "-").toLowerCase() ===
        selectedFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#8243ff] via-[#6c2bd9] to-[#5a1fc7] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/5 to-white/10"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>

        <div
          className="absolute top-4 left-1/4 w-6 h-6 bg-white/20 rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "2s" }}
        ></div>
        <div
          className="absolute bottom-4 right-1/3 w-4 h-4 bg-white/15 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent flex items-center">
                Job Opportunities
                <span className="ml-3 text-3xl animate-bounce">🎯</span>
              </h1>
              <p className="text-purple-100 text-lg font-medium hover:text-white transition-colors duration-300">
                Discover your next career opportunity
              </p>
              <div className="mt-3 flex items-center space-x-4 text-sm text-purple-200">
                <span className="flex items-center space-x-1 group hover:text-white transition-colors duration-300 cursor-pointer">
                  <span className="group-hover:scale-125 transition-transform duration-300 animate-pulse">
                    ✨
                  </span>
                  <span>Curated for you</span>
                </span>
                <span className="flex items-center space-x-1 group hover:text-white transition-colors duration-300 cursor-pointer">
                  <span className="group-hover:scale-125 transition-transform duration-300 animate-pulse">
                    🚀
                  </span>
                  <span>Updated daily</span>
                </span>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/25 hover:scale-110 transition-all duration-300 group">
              <div className="text-center">
                <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300 animate-pulse">
                  {jobs.length}
                </div>
                <div className="text-xs text-purple-200 font-medium group-hover:text-white transition-colors duration-300">
                  Available Jobs
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-[#8243ff] outline-none transition-all duration-300 group-hover:border-[#8243ff]/50 bg-gradient-to-r from-white to-gray-50/30 text-black placeholder:text-gray-500"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl group-hover:scale-110 transition-transform duration-300">
                🔍
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#8243ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedFilter === filter.id
                    ? "bg-gradient-to-r from-[#8243ff] to-[#6c2bd9] text-white shadow-md"
                    : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-[#8243ff]/10 hover:to-[#8243ff]/5 hover:text-[#8243ff] hover:shadow-md"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-transparent rounded-lg p-4 hover:from-[#8243ff]/5 hover:to-transparent transition-all duration-300">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-semibold text-[#8243ff]">
            {filteredJobs.length}
          </span>{" "}
          job opportunities
          {showAllJobs && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              ⚠️ All Jobs (Including Non-Matching Degrees)
            </span>
          )}
        </p>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleViewAllJobs}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              showAllJobs
                ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700"
                : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
            }`}
          >
            {showAllJobs ? "Show Matching Jobs Only" : "View All Jobs"}
          </button>
          <button
          onClick={handleSortClick}
          className="text-[#8243ff] hover:text-[#6c2bd9] font-medium flex items-center space-x-1 group transition-all duration-300 hover:scale-105"
        >
          <span>Sort by: {sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          <span className="group-hover:translate-y-1 transition-transform duration-300">
            {sortOrder === "desc" ? "⬇️" : "⬆️"}
          </span>
        </button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <div
              key={job._id}
              className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-102 group"
            >
              <div className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8243ff]/2 via-transparent to-[#8243ff]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#8243ff] to-[#6c2bd9] rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {job.logo || "🏢"}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-[#8243ff] transition-colors duration-300">
                            {job.title}
                          </h3>
                          <p className="text-[#8243ff] font-medium mb-2 group-hover:text-[#6c2bd9] transition-colors duration-300">
                            {job.companyId?.companyName || "Unknown Company"}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3 flex-wrap">
                            <span className="flex items-center space-x-1 group-hover:scale-105 transition-transform duration-300">
                              <span>📍</span>
                              <span>{job.location}</span>
                            </span>
                            <span className="flex items-center space-x-1 group-hover:scale-105 transition-transform duration-300">
                              <span>💼</span>
                              <span>{job.jobType}</span>
                            </span>
                            <span className="flex items-center space-x-1 group-hover:scale-105 transition-transform duration-300">
                              <span>🏢</span>
                              <span>{job.workPlaceType}</span>
                            </span>
                            <span className="flex items-center space-x-1 group-hover:scale-105 transition-transform duration-300">
                              <span>💰</span>
                              <span>{formatSalary(job.salaryRange)}</span>
                            </span>
                            <span className="flex items-center space-x-1 group-hover:scale-105 transition-transform duration-300">
                              <span>🕒</span>
                              <span>{formatDate(job.posted_date)}</span>
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3 group-hover:text-gray-800 transition-colors duration-300 line-clamp-3">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skillsRequired?.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-[#8243ff] rounded-full text-sm font-medium hover:from-[#8243ff] hover:to-[#6c2bd9] hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {job.urgent && (
                          <span className="bg-gradient-to-r from-red-100 to-orange-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium animate-pulse ml-4 shrink-0">
                            🔥 Urgent
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleApplyClick(job._id)}
                          disabled={
                            job.status !== "active" || appliedJobs.has(job._id)
                          }
                          className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                            appliedJobs.has(job._id)
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : job.status !== "active"
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#8243ff] to-[#6c2bd9] hover:from-[#6c2bd9] hover:to-[#5a1fc7] text-white"
                          }`}
                        >
                          {appliedJobs.has(job._id) ? "Applied ✓" : "Apply Now"}
                        </button>
                        <button
                          onClick={() => handleSaveJob(job._id)}
                          disabled={savingJob === job._id}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 border ${
                            savedJobs.has(job._id)
                              ? "bg-gradient-to-r from-[#8243ff] to-[#6c2bd9] text-white border-[#8243ff] hover:from-[#6c2bd9] hover:to-[#5a1fc7]"
                              : "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-[#8243ff]/10 hover:to-[#8243ff]/5 text-gray-700 hover:text-[#8243ff] border-gray-200 hover:border-[#8243ff]/20"
                          }`}
                        >
                          {savingJob === job._id ? (
                            <span className="flex items-center space-x-1">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
                            </span>
                          ) : savedJobs.has(job._id) ? (
                            "Saved ❤️"
                          ) : (
                            "Save Job"
                          )}
                        </button>
                        <button
                          onClick={() => handleViewDetailsClick(job)}
                          className="text-[#8243ff] hover:text-[#6c2bd9] font-medium group-hover:translate-x-1 transition-all duration-300 flex items-center space-x-1"
                        >
                          <span>View Details</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? `No jobs match your search for "${searchTerm}"`
                : "No job opportunities available at the moment"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-[#8243ff] hover:text-[#6c2bd9] font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={showJobDetails}
        onClose={() => setShowJobDetails(false)}
        job={selectedJobForDetails}
        onApply={handleApplyFromDetails}
        onSave={handleSaveJob}
        isJobSaved={
          selectedJobForDetails
            ? savedJobs.has(selectedJobForDetails._id)
            : false
        }
        isJobApplied={
          selectedJobForDetails
            ? appliedJobs.has(selectedJobForDetails._id)
            : false
        }
        isSaving={
          selectedJobForDetails
            ? savingJob === selectedJobForDetails._id
            : false
        }
      />

      {/* Apply Job Modal */}
      <ApplyJobModal
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
        onSubmit={handleApplicationSubmit}
        isSubmitting={applyingJob === selectedJobId}
        message={applicationMessage}
      />

      {/* Warning Modal for View All Jobs */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4 transform transition-all duration-300 scale-100 animate-bounce-in">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                View All Jobs Warning
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                You're about to view all jobs, including those that may not match your degree program. 
                These jobs might have different qualification requirements that don't align with your academic background.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Recommendation:</strong> Focus on jobs matching your degree for better application success rates.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmViewAllJobs}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-300"
                >
                  Continue Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && filteredJobs.length > 0 && (
        <div className="text-center pt-6">
          <button
            onClick={() => fetchJobs(true)}
            disabled={isFetchingMore}
            className="bg-gradient-to-r from-[#8243ff] to-[#6c2bd9] hover:from-[#6c2bd9] hover:to-[#5a1fc7] text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <span className="relative z-10">
              {isFetchingMore ? "Loading..." : "Load More Jobs"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      )}
    </div>
  );
}
