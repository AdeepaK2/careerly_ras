"use client";

import { useState, useEffect } from "react";

interface ShortlistedApplicant {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    category: string;
    location: string;
    jobType: string;
  };
  applicantId: {
    _id: string;
    firstName: string;
    lastName: string;
    universityEmail: string;
    education: {
      degreeProgramme: string;
    };
    skills: string[];
  };
  applicationId: {
    _id: string;
    cv: string;
    coverLetter: string;
    appliedAt: string;
    status: string;
  };
  shortlistedAt: string;
  shortlistedBy: string;
  priority: string;
  notes: string;
}

export default function ShortlistTab() {
  const [shortlisted, setShortlisted] = useState<ShortlistedApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] =
    useState<ShortlistedApplicant | null>(null);

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const fetchShortlisted = async () => {
    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch("/api/company/shortlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShortlisted(data.data);
      } else {
        console.error("Failed to fetch shortlisted applicants");
      }
    } catch (error) {
      console.error("Error fetching shortlisted:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShortlist = async (applicationId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this candidate from the shortlist?"
      )
    ) {
      return;
    }

    setRemoving(applicationId);

    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch(
        `/api/application/${applicationId}/shortlist`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setShortlisted((prev) =>
          prev.filter((item) => item.applicationId._id !== applicationId)
        );
        alert("Candidate removed from shortlist successfully");
      } else {
        alert("Failed to remove candidate from shortlist");
      }
    } catch (error) {
      console.error("Error removing from shortlist:", error);
      alert("Error removing candidate from shortlist");
    } finally {
      setRemoving(null);
    }
  };

  const downloadCV = async (cvUrl: string, applicantName: string) => {
    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch(cvUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${applicantName}_CV.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      alert("Failed to download CV");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-700";
      case "under_review":
        return "bg-yellow-100 text-yellow-700";
      case "interviewed":
        return "bg-purple-100 text-purple-700";
      case "offered":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8243ff]"></div>
        <span className="ml-2">Loading shortlisted candidates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Shortlisted Candidates
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your top candidate selections
          </p>
        </div>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
          <span className="font-medium">{shortlisted.length}</span> candidates
          shortlisted
        </div>
      </div>

      {/* Shortlisted Candidates */}
      {shortlisted.length > 0 ? (
        <div className="grid gap-6">
          {shortlisted.map((item) => (
            <div
              key={item._id}
              className="glass-effect p-6 rounded-lg border hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Applicant Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {item.applicantId.firstName} {item.applicantId.lastName}
                      </h3>
                      <p className="text-gray-600">
                        {item.applicantId.universityEmail}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.applicantId.education.degreeProgramme}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(
                          item.priority
                        )}`}
                      >
                        {item.priority.toUpperCase()} PRIORITY
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          item.applicationId.status
                        )}`}
                      >
                        {item.applicationId.status
                          .replace("_", " ")
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Job Title:
                        </span>
                        <p className="text-sm text-gray-900">
                          {item.jobId.title}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Category:
                        </span>
                        <p className="text-sm text-gray-900">
                          {item.jobId.category}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Location:
                        </span>
                        <p className="text-sm text-gray-900">
                          {item.jobId.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {item.applicantId.skills &&
                    item.applicantId.skills.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">
                          Skills:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.applicantId.skills
                            .slice(0, 5)
                            .map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          {item.applicantId.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{item.applicantId.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Applied:</span>
                      <span className="ml-1">
                        {new Date(
                          item.applicationId.appliedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Shortlisted:</span>
                      <span className="ml-1">
                        {new Date(item.shortlistedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {" "}
                        by {item.shortlistedBy}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <span className="text-sm font-medium text-yellow-800">
                        Notes:
                      </span>
                      <p className="text-sm text-yellow-700 mt-1">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      downloadCV(
                        item.applicationId.cv,
                        `${item.applicantId.firstName}_${item.applicantId.lastName}`
                      )
                    }
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    📄 Download CV
                  </button>

                  <button
                    onClick={() => setSelectedApplicant(item)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    👁️ View Details
                  </button>
                </div>

                <button
                  onClick={() =>
                    handleRemoveFromShortlist(item.applicationId._id)
                  }
                  disabled={removing === item.applicationId._id}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {removing === item.applicationId._id
                    ? "Removing..."
                    : "🗑️ Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Shortlisted Candidates
          </h3>
          <p className="text-gray-600 mb-6">
            Start shortlisting candidates from your job applications to see them
            here.
          </p>
          <div className="text-sm text-gray-500">
            Go to <span className="font-medium">Job Posting</span> → View
            applications → Click <span className="font-medium">Shortlist</span>
          </div>
        </div>
      )}

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#8243ff] to-purple-600 text-white">
              <h3 className="text-xl font-bold">
                {selectedApplicant.applicantId.firstName}{" "}
                {selectedApplicant.applicantId.lastName}
              </h3>
              <p className="text-purple-100 text-sm">
                {selectedApplicant.jobId.title}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Cover Letter */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Cover Letter
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedApplicant.applicationId.coverLetter}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.applicantId.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                <p className="text-gray-700">
                  {selectedApplicant.applicantId.education.degreeProgramme}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
