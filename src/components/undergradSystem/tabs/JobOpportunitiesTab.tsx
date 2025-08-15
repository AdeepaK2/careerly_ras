"use client";

import { useState, useEffect } from "react";
import { useAuthenticatedRequest } from "@/hooks/useAuthenticatedRequest";




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

export default function JobOpportunitiesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);

  const { makeAuthenticatedRequest } = useAuthenticatedRequest();

  const makeRequest = async (url: string, options: RequestInit = {}) => {
    const response = await makeAuthenticatedRequest(url, options);
    return await response.json();
  };

  useEffect(() => {
    fetchjobs();
  }, []);

  const fetchjobs = async () => {
    try {
      const response = await makeRequest("/api/job/undergrad", {
        method: "GET",
      });
      console.log("Response Data:", response.jobs);

      if (response.jobs && Array.isArray(response.jobs)) {
        setJobs(response.jobs);
      } else {
        throw new Error("Failed to fetch job opportunities");
      }
    } catch (error) {
      console.error("Error fetching job opportunities:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format salary
  const formatSalary = (salaryRange?: { min?: number; max?: number }) => {
    if (!salaryRange) return "Salary not specified";
    const { min, max } = salaryRange;
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
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
      job.companyId.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      job.skillsRequired.some((skill) =>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#8243ff] via-[#6c2bd9] to-[#5a1fc7] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        {/* Elegant Overlay Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/5 to-white/10"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>

        {/* Floating Animation Elements */}
        <div
          className="absolute top-4 left-1/4 w-6 h-6 bg-white/20 rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "2s" }}
        ></div>
        <div
          className="absolute bottom-4 right-1/3 w-4 h-4 bg-white/15 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Main Content */}
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

            {/* Elegant Stats Badge */}
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
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-[#8243ff] outline-none transition-all duration-300 group-hover:border-[#8243ff]/50 bg-gradient-to-r from-white to-gray-50/30"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl group-hover:scale-110 transition-transform duration-300">
                🔍
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#8243ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
            </div>
          </div>

          {/* Filter Buttons */}
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

      {/* Results Count */}
      <div className="flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-transparent rounded-lg p-4 hover:from-[#8243ff]/5 hover:to-transparent transition-all duration-300">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-semibold text-[#8243ff]">
            {filteredJobs.length}
          </span>{" "}
          job opportunities
        </p>
        <button className="text-[#8243ff] hover:text-[#6c2bd9] font-medium flex items-center space-x-1 group transition-all duration-300 hover:scale-105">
          <span>Sort by: Newest</span>
          <span className="group-hover:translate-y-1 transition-transform duration-300">
            ⬇️
          </span>
        </button>
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
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#8243ff]/2 via-transparent to-[#8243ff]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Company Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-[#8243ff] to-[#6c2bd9] rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {job.logo || "🏢"}
                    </div>

                    {/* Job Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-[#8243ff] transition-colors duration-300">
                            {job.title}
                          </h3>
                          <p className="text-[#8243ff] font-medium mb-2 group-hover:text-[#6c2bd9] transition-colors duration-300">
                            {job.companyId?.companyName || "Unko=nown Company"}
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

                          {/* Skills */}
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

                        {/* Urgent Badge */}
                        {job.urgent && (
                          <span className="bg-gradient-to-r from-red-100 to-orange-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium animate-pulse ml-4 shrink-0">
                            🔥 Urgent
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <button
                          className="bg-gradient-to-r from-[#8243ff] to-[#6c2bd9] hover:from-[#6c2bd9] hover:to-[#5a1fc7] text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                          disabled={job.status !== "active"}
                        >
                          Apply Now
                        </button>
                        <button className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-[#8243ff]/10 hover:to-[#8243ff]/5 text-gray-700 hover:text-[#8243ff] px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-[#8243ff]/20">
                          Save Job
                        </button>
                        <button className="text-[#8243ff] hover:text-[#6c2bd9] font-medium group-hover:translate-x-1 transition-all duration-300">
                          View Details →
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

      {/* Load More Button */}
      {filteredJobs.length > 0 && (
        <div className="text-center pt-6">
          <button className="bg-gradient-to-r from-[#8243ff] to-[#6c2bd9] hover:from-[#6c2bd9] hover:to-[#5a1fc7] text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative overflow-hidden group">
            <span className="relative z-10">Load More Jobs</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      )}
    </div>
  );
}
