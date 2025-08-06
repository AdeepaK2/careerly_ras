"use client";

import React, { useState, useEffect } from "react";

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  applications: number;
  status: string;
  postedDate: string;
  description?: string;
  requirements?: string[];
  salary?: string;
}

export default function JobPostingTab() {
  const [activeJobForm, setActiveJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([
    {
      id: 1,
      title: "Software Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      applications: 24,
      status: "Active",
      postedDate: "2024-01-15",
      description:
        "We are looking for a passionate Software Engineer to join our team.",
      requirements: [
        "Bachelor's in Computer Science",
        "3+ years experience",
        "React/Node.js",
      ],
      salary: "$80,000 - $120,000",
    },
    {
      id: 2,
      title: "Marketing Manager",
      department: "Marketing",
      location: "New York",
      type: "Full-time",
      applications: 18,
      status: "Active",
      postedDate: "2024-01-10",
      description: "Lead our marketing initiatives and drive brand awareness.",
      requirements: [
        "MBA preferred",
        "5+ years marketing experience",
        "Leadership skills",
      ],
      salary: "$70,000 - $100,000",
    },
    {
      id: 3,
      title: "UI/UX Designer",
      department: "Design",
      location: "San Francisco",
      type: "Contract",
      applications: 32,
      status: "Closed",
      postedDate: "2024-01-05",
      description: "Create beautiful and intuitive user experiences.",
      requirements: [
        "Portfolio required",
        "Figma/Adobe expertise",
        "User research skills",
      ],
      salary: "$60,000 - $90,000",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    description: "",
    requirements: "",
    salary: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: JobPosting = {
      id: jobs.length + 1,
      title: formData.title,
      department: formData.department,
      location: formData.location,
      type: formData.type,
      applications: 0,
      status: "Active",
      postedDate: new Date().toISOString().split("T")[0],
      description: formData.description,
      requirements: formData.requirements.split(",").map((req) => req.trim()),
      salary: formData.salary,
    };

    setJobs([...jobs, newJob]);
    setActiveJobForm(false);
    setFormData({
      title: "",
      department: "",
      location: "",
      type: "",
      description: "",
      requirements: "",
      salary: "",
    });
  };

  const deleteJob = (id: number) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const toggleJobStatus = (id: number) => {
    setJobs(
      jobs.map((job) =>
        job.id === id
          ? { ...job, status: job.status === "Active" ? "Closed" : "Active" }
          : job
      )
    );
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
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-effect p-6 rounded-lg shadow-lg card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-[#8243ff] to-purple-600 rounded-lg shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter((job) => job.status === "Active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-effect p-6 rounded-lg shadow-lg card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.reduce((sum, job) => sum + job.applications, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-effect p-6 rounded-lg shadow-lg card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  jobs.filter(
                    (job) =>
                      new Date(job.postedDate).getMonth() ===
                      new Date().getMonth()
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="glass-effect p-6 rounded-lg shadow-lg card-hover">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  jobs.reduce((sum, job) => sum + job.applications, 0) /
                    jobs.length
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="glass-effect rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Job Postings ({jobs.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location & Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-white/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {job.department}
                      </div>
                      <div className="text-xs text-gray-500">
                        Posted: {job.postedDate}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{job.location}</div>
                    <div className="text-sm text-gray-600">{job.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {job.applications}
                      </span>
                      <div className="ml-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleJobStatus(job.id)}
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                        job.status === "Active"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {job.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-[#8243ff] hover:text-purple-700 font-medium text-sm px-3 py-1 rounded-md hover:bg-purple-50 transition-colors">
                        View ({job.applications})
                      </button>
                      <button
                        onClick={() => setEditingJob(job)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Delete
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
          <div className="glass-effect rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#8243ff] to-purple-600 text-white rounded-t-lg">
              <h3 className="text-xl font-bold">Post New Job</h3>
              <p className="text-purple-100 text-sm">
                Fill in the details to create a new job posting
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="e.g. Remote, New York, San Francisco"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                  placeholder="e.g. $80,000 - $120,000"
                />
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
                  Requirements (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                  placeholder="Bachelor's degree, 3+ years experience, React expertise, etc."
                />
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
                  className="px-6 py-3 bg-gradient-to-r from-[#8243ff] to-purple-600 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
