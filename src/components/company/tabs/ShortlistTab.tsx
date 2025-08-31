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
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
    applicationId: "",
    applicantName: "",
  });

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

  const handleSendEmail = (applicant: ShortlistedApplicant, type: 'interview' | 'selected' | 'custom') => {
    const templates = {
      interview: {
        subject: `Interview Invitation - ${applicant.jobId.title}`,
        message: `Dear ${applicant.applicantId.firstName} ${applicant.applicantId.lastName},

We are pleased to inform you that your application for the ${applicant.jobId.title} position has been reviewed and we would like to invite you for an interview.

Interview Details:
- Position: ${applicant.jobId.title}
- Date: [Please specify date]
- Time: [Please specify time]
- Location/Platform: [Please specify location or video call link]

Please confirm your availability by replying to this email.

We look forward to meeting with you.

Best regards,
[Your Company Name]`
      },
      selected: {
        subject: `Congratulations - Job Offer for ${applicant.jobId.title}`,
        message: `Dear ${applicant.applicantId.firstName} ${applicant.applicantId.lastName},

Congratulations! We are delighted to offer you the position of ${applicant.jobId.title} at our company.

After careful consideration of your qualifications and interview performance, we believe you would be an excellent addition to our team.

Please find the detailed job offer attached to this email. We would like to hear from you by [date] regarding your acceptance of this offer.

If you have any questions, please don't hesitate to reach out.

Welcome to the team!

Best regards,
[Your Company Name]`
      },
      custom: {
        subject: `Regarding your application for ${applicant.jobId.title}`,
        message: `Dear ${applicant.applicantId.firstName} ${applicant.applicantId.lastName},

[Your custom message here]

Best regards,
[Your Company Name]`
      }
    };

    setEmailData({
      to: applicant.applicantId.universityEmail,
      subject: templates[type].subject,
      message: templates[type].message,
      applicationId: applicant.applicationId._id,
      applicantName: `${applicant.applicantId.firstName} ${applicant.applicantId.lastName}`,
    });
    setShowEmailModal(true);
  };

  const sendEmail = async () => {
    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch("/api/company/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message,
          applicationId: emailData.applicationId,
        }),
      });

      if (response.ok) {
        alert("Email sent successfully!");
        setShowEmailModal(false);
        setEmailData({
          to: "",
          subject: "",
          message: "",
          applicationId: "",
          applicantName: "",
        });
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email. Please try again.");
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string, statusType: string) => {
    const confirmMessage = statusType === 'interview' 
      ? "Mark this candidate as 'Interview Called'?" 
      : "Mark this candidate as 'Selected'?";
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setUpdatingStatus(applicationId);

    try {
      const token = localStorage.getItem("company_accessToken");
      const response = await fetch(`/api/application/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: newStatus
        }),
      });

      if (response.ok) {
        // Update the local state
        setShortlisted((prev) =>
          prev.map((item) =>
            item.applicationId._id === applicationId
              ? {
                  ...item,
                  applicationId: {
                    ...item.applicationId,
                    status: newStatus,
                  },
                }
              : item
          )
        );
        alert(`Candidate marked as ${statusType === 'interview' ? 'Interview Called' : 'Selected'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to update status: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    } finally {
      setUpdatingStatus(null);
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
      case "interview_called":
        return "bg-purple-100 text-purple-700";
      case "offered":
      case "selected":
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
          <h2 className="text-xl font-semibold text-gray-900">
            Shortlisted Candidates
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {shortlisted.length} candidates
          </p>
        </div>
      </div>

      {/* Shortlisted Candidates */}
      {shortlisted.length > 0 ? (
        <div className="space-y-4">
          {shortlisted.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {/* Basic Info */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {item.applicantId.firstName} {item.applicantId.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.applicantId.universityEmail}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.jobId.title}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${getStatusColor(
                    item.applicationId.status
                  )}`}
                >
                  {item.applicationId.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    downloadCV(
                      item.applicationId.cv,
                      `${item.applicantId.firstName}_${item.applicantId.lastName}`
                    )
                  }
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                >
                  Download CV
                </button>

                <button
                  onClick={() => setSelectedApplicant(item)}
                  className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleSendEmail(item, 'interview')}
                  className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                >
                  Interview Email
                </button>
                
                <button
                  onClick={() => handleSendEmail(item, 'selected')}
                  className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                >
                  Selection Email
                </button>
                
                <button
                  onClick={() => updateApplicationStatus(item.applicationId._id, 'interview_called', 'interview')}
                  disabled={updatingStatus === item.applicationId._id || item.applicationId.status === 'interview_called' || item.applicationId.status === 'selected'}
                  className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors disabled:opacity-50"
                >
                  Mark Interview
                </button>
                
                <button
                  onClick={() => updateApplicationStatus(item.applicationId._id, 'selected', 'selected')}
                  disabled={updatingStatus === item.applicationId._id || item.applicationId.status === 'selected'}
                  className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                  Mark Selected
                </button>

                <button
                  onClick={() =>
                    handleRemoveFromShortlist(item.applicationId._id)
                  }
                  disabled={removing === item.applicationId._id}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {removing === item.applicationId._id ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No shortlisted candidates yet.</p>
        </div>
      )}

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedApplicant.applicantId.firstName}{" "}
                {selectedApplicant.applicantId.lastName}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedApplicant.jobId.title}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Cover Letter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Cover Letter
                </h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedApplicant.applicationId.coverLetter}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedApplicant.applicantId.skills?.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                <p className="text-sm text-gray-700">
                  {selectedApplicant.applicantId.education.degreeProgramme}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
              <p className="text-sm text-gray-600">
                To: {emailData.applicantName}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* To Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="recipient@example.com"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email subject"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={8}
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email message"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailData({
                    to: "",
                    subject: "",
                    message: "",
                    applicationId: "",
                    applicantName: "",
                  });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={!emailData.to.trim() || !emailData.subject.trim() || !emailData.message.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
