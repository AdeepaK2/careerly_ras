"use client";

import React, { useState, useEffect } from "react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  position: string;
  university: string;
  major: string;
  gpa: string;
  skills: string[];
  status: string;
  appliedDate: string;
  avatar: string;
  resume?: string;
  portfolio?: string;
  notes?: string;
}

export default function SelectedTab() {
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      position: "Software Engineer",
      university: "MIT",
      major: "Computer Science",
      gpa: "3.8",
      skills: ["React", "Node.js", "Python", "TypeScript"],
      status: "Interview Scheduled",
      appliedDate: "2024-01-20",
      avatar: "SJ",
      notes: "Strong technical background, excellent communication skills.",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      position: "UI/UX Designer",
      university: "Stanford University",
      major: "Design",
      gpa: "3.9",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      status: "Offer Extended",
      appliedDate: "2024-01-18",
      avatar: "MC",
      notes: "Outstanding portfolio, innovative design thinking.",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      position: "Marketing Manager",
      university: "Harvard University",
      major: "Business Administration",
      gpa: "3.7",
      skills: [
        "Digital Marketing",
        "Analytics",
        "Strategy",
        "Content Creation",
      ],
      status: "Background Check",
      appliedDate: "2024-01-15",
      avatar: "ER",
      notes: "Great leadership potential, proven track record.",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  const statusOptions = [
    "All",
    "Interview Scheduled",
    "Offer Extended",
    "Background Check",
    "Hired",
    "Rejected",
  ];

  const filteredCandidates =
    filterStatus === "All"
      ? selectedCandidates
      : selectedCandidates.filter(
          (candidate) => candidate.status === filterStatus
        );

  const updateCandidateStatus = (id: number, newStatus: string) => {
    setSelectedCandidates((candidates) =>
      candidates.map((candidate) =>
        candidate.id === id ? { ...candidate, status: newStatus } : candidate
      )
    );
  };

  const scheduleInterview = (candidate: Candidate) => {
    // Simulate scheduling interview
    updateCandidateStatus(candidate.id, "Interview Scheduled");
  };

  const extendOffer = (candidate: Candidate) => {
    // Simulate extending offer
    updateCandidateStatus(candidate.id, "Offer Extended");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Offer Extended":
        return "bg-green-100 text-green-800";
      case "Background Check":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">
            Selected Candidates
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your top candidate selections ({filteredCandidates.length}{" "}
            candidates)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="bg-gradient-to-r from-[#8243ff] to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export List
          </button>
        </div>
      </div>

      {/* Enhanced Stats */}
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Selected</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedCandidates.length}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Interviews Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  selectedCandidates.filter(
                    (c) => c.status === "Interview Scheduled"
                  ).length
                }
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Offers Extended</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  selectedCandidates.filter(
                    (c) => c.status === "Offer Extended"
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
              <p className="text-sm text-gray-600">In Process</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  selectedCandidates.filter(
                    (c) =>
                      c.status === "Background Check" ||
                      c.status === "Interview Scheduled"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Candidate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="glass-effect rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#8243ff] to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {candidate.avatar}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                  </div>
                </div>
                <select
                  value={candidate.status}
                  onChange={(e) =>
                    updateCandidateStatus(candidate.id, e.target.value)
                  }
                  className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer transition-colors ${getStatusColor(
                    candidate.status
                  )}`}
                >
                  {statusOptions.slice(1).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Position
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {candidate.position}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      GPA
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {candidate.gpa}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    University
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate.university}
                  </p>
                  <p className="text-xs text-gray-600">{candidate.major}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-md font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {candidate.notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-700 italic">
                      {candidate.notes}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="bg-gradient-to-r from-[#8243ff] to-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 font-medium shadow-md"
                    >
                      View Profile
                    </button>
                    {candidate.status === "Interview Scheduled" ? (
                      <button
                        onClick={() => extendOffer(candidate)}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-md"
                      >
                        Extend Offer
                      </button>
                    ) : (
                      <button
                        onClick={() => scheduleInterview(candidate)}
                        className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium"
                      >
                        Schedule Interview
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCandidates.length === 0 && (
        <div className="glass-effect rounded-lg shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-white"
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {filterStatus === "All"
              ? "No selected candidates"
              : `No candidates with status: ${filterStatus}`}
          </h3>
          <p className="text-gray-500 mb-6">
            {filterStatus === "All"
              ? "Start reviewing applications to select top candidates"
              : "Try selecting a different status filter"}
          </p>
          <button className="bg-gradient-to-r from-[#8243ff] to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
            Browse Applications
          </button>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#8243ff] to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {selectedCandidate.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedCandidate.name}
                    </h3>
                    <p className="text-purple-100">
                      {selectedCandidate.position}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Email:</span>{" "}
                      {selectedCandidate.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Applied:</span>{" "}
                      {selectedCandidate.appliedDate}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Academic Background
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">University:</span>{" "}
                      {selectedCandidate.university}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Major:</span>{" "}
                      {selectedCandidate.major}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">GPA:</span>{" "}
                      {selectedCandidate.gpa}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Skills & Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex px-3 py-1 text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCandidate.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedCandidate.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => scheduleInterview(selectedCandidate)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => extendOffer(selectedCandidate)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
                >
                  Extend Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
