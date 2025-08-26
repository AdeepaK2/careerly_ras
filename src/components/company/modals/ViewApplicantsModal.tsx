"use client";
import React, { useState, useEffect } from "react";
import ApplicantDetailDrawer from "../ApplicationDetailDrawer";
import {
  X,
  Download,
  Star,
  StarOff,
  User,
  FileText,
  Calendar,
  Mail,
} from "lucide-react";

interface Application {
  _id: string;
  applicantId: {
    _id: string;
    firstName: string;
    lastName: string;
    universityEmail: string;
    education: {
      degreeProgramme: string;
    };
  };
  cv: string;
  coverLetter: string;
  specialRequirements?: string;
  appliedAt: string;
  status: string;
}

interface ViewApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export default function ViewApplicantsModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
}: ViewApplicantsModalProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [shortlisting, setShortlisting] = useState<string | null>(null);
  const [shortlistedApplicants, setShortlistedApplicants] = useState<
    Set<string>
  >(new Set());
  const [message, setMessage] = useState<string>("");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchApplications();
      fetchShortlistedApplicants();
    }
  }, [isOpen, jobId]);

  // Add ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch(`/api/job/${jobId}/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
      } else {
        setMessage("Failed to fetch applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setMessage("Error fetching applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlistedApplicants = async () => {
    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch(`/api/job/${jobId}/shortlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const shortlistedIds = new Set<string>(
          data.data.map((item: any) => item.applicationId._id)
        );
        setShortlistedApplicants(shortlistedIds);
      }
    } catch (error) {
      console.error("Error fetching shortlisted applicants:", error);
    }
  };

  const handleShortlist = async (applicationId: string) => {
    setShortlisting(applicationId);
    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch(
        `/api/application/${applicationId}/shortlist`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shortlistedBy: "Company User",
            notes: "",
            priority: "medium",
          }),
        }
      );
      if (response.ok) {
        setShortlistedApplicants((prev) => new Set(prev).add(applicationId));
        setMessage("Applicant shortlisted successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to shortlist applicant");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Shortlist error:", error);
      setMessage("Error shortlisting applicant");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setShortlisting(null);
    }
  };

  const handleRemoveShortlist = async (applicationId: string) => {
    setShortlisting(applicationId);
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
        setShortlistedApplicants((prev) => {
          const newSet = new Set(prev);
          newSet.delete(applicationId);
          return newSet;
        });
        setMessage("Removed from shortlist successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to remove from shortlist");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Remove shortlist error:", error);
      setMessage("Error removing from shortlist");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setShortlisting(null);
    }
  };

  const downloadCV = async (cvUrl: string, applicantName: string) => {
    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch(
        `/api/file/download?url=${encodeURIComponent(cvUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      } else {
        setMessage("Failed to download CV");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      setMessage("Failed to download CV");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const openApplicantDrawer = (app: Application) => {
    setSelectedApplication(app);
  };

  const closeApplicantDrawer = () => {
    setSelectedApplication(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Job Applicants</h2>
              <p className="text-indigo-100 text-sm mt-1">{jobTitle}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-indigo-200 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-blue-700 text-sm flex items-center">
              <svg
                className="h-4 w-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {message}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <span className="mt-4 text-gray-600">
                Loading applications...
              </span>
            </div>
          ) : applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Applicant
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Degree
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Applied Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr
                      key={application._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.applicantId.firstName}{" "}
                              {application.applicantId.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {application.applicantId.universityEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.applicantId.education.degreeProgramme}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status === "pending"
                              ? "bg-blue-100 text-blue-800"
                              : application.status === "reviewed"
                              ? "bg-purple-100 text-purple-800"
                              : application.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {application.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openApplicantDrawer(application)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View Details
                          </button>
                          <button
                            onClick={() =>
                              downloadCV(
                                application.cv,
                                `${application.applicantId.firstName}_${application.applicantId.lastName}`
                              )
                            }
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            CV
                          </button>
                          {shortlistedApplicants.has(application._id) ? (
                            <button
                              onClick={() =>
                                handleRemoveShortlist(application._id)
                              }
                              disabled={shortlisting === application._id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                            >
                              {shortlisting === application._id ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-700"
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
                                  Removing...
                                </>
                              ) : (
                                <>
                                  <StarOff className="h-3 w-3 mr-1" />
                                  Remove
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleShortlist(application._id)}
                              disabled={shortlisting === application._id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-colors"
                            >
                              {shortlisting === application._id ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-yellow-700"
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
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Star className="h-3 w-3 mr-1" />
                                  Shortlist
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Applications Yet
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                No candidates have applied for this position yet. Check back
                later or promote your job listing to attract more applicants.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Applicant Detail Drawer */}
      <ApplicantDetailDrawer
        isOpen={!!selectedApplication}
        onClose={closeApplicantDrawer}
        application={selectedApplication}
        onDownloadCV={downloadCV}
        onShortlist={handleShortlist}
        onRemoveShortlist={handleRemoveShortlist}
        isShortlisted={shortlistedApplicants.has(
          selectedApplication?._id || ""
        )}
        shortlisting={shortlisting}
      />
    </div>
  );
}
