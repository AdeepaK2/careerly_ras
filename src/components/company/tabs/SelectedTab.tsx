"use client";

import React, { useState, useEffect } from "react";

interface SelectedCandidate {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    jobType: string;
    location: string;
  };
  applicantId: {
    _id: string;
    name: string;
    nameWithInitials: string;
    universityEmail: string;
    education: {
      degreeProgramme: string;
      faculty: string;
    };
    skills?: string[];
  };
  applicationId: {
    _id: string;
    status: string;
    appliedAt: string;
    coverLetter?: string;
    cv?: string;
  };
  shortlistedAt: string;
}

interface EmailData {
  to: string;
  subject: string;
  message: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  type: 'appointment' | 'interview' | 'custom';
}

export default function SelectedTab() {
  const [selectedCandidates, setSelectedCandidates] = useState<SelectedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedCandidate, setSelectedCandidate] = useState<SelectedCandidate | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState<EmailData>({
    to: "",
    subject: "",
    message: "",
    candidateId: "",
    candidateName: "",
    jobTitle: "",
    type: 'custom'
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSelectedCandidates();
  }, []);

  const fetchSelectedCandidates = async () => {
    try {
      const token = localStorage.getItem("company_accessToken");
      
      if (!token) {
        console.error('No company authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/company/shortlist', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('All shortlisted candidates:', data.data);
        console.log('Application statuses:', data.data.map((c: any) => ({
          name: c.applicantId?.name || 'Unknown',
          status: c.applicationId?.status || 'No status',
          applicationId: c.applicationId?._id || 'No ID'
        })));
        
        // Filter only selected candidates
        const selected = data.data.filter((candidate: SelectedCandidate) => 
          candidate.applicationId.status === 'selected'
        );
        console.log('Filtered selected candidates:', selected);
        setSelectedCandidates(selected);
      }
    } catch (error) {
      console.error('Error fetching selected candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = (candidate: SelectedCandidate, type: 'appointment' | 'interview' | 'custom') => {
    const candidateName = candidate.applicantId?.name || 'Candidate';
    const jobTitle = candidate.jobId?.title || 'Position';
    const jobLocation = candidate.jobId?.location || 'TBD';
    const jobType = candidate.jobId?.jobType || 'TBD';
    
    const templates = {
      appointment: {
        subject: `Job Offer - Appointment Letter for ${jobTitle}`,
        message: `Dear ${candidateName},

Congratulations! We are pleased to inform you that you have been selected for the position of ${jobTitle} at our company.

We would like to schedule an appointment to discuss the terms of your employment and provide you with your official appointment letter.

Please reply to this email with your availability for the coming week so we can arrange a suitable time.

Details of the position:
- Job Title: ${jobTitle}
- Location: ${jobLocation}
- Job Type: ${jobType}

We look forward to welcoming you to our team!

Best regards,
HR Team`
      },
      interview: {
        subject: `Final Interview - ${jobTitle} Position`,
        message: `Dear ${candidateName},

We are pleased to inform you that you have progressed to the final stage of our selection process for the ${jobTitle} position.

We would like to invite you for a final interview to discuss your role and answer any questions you may have.

Interview Details:
- Position: ${jobTitle}
- Date: [Please specify date]
- Time: [Please specify time]
- Location/Platform: [Please specify location or video call link]
- Duration: Approximately 1 hour

Please confirm your availability by replying to this email.

If you have any questions, please don't hesitate to contact us.

Best regards,
[Your Name]
HR Team`
      }
    };

    let emailSubject = '';
    let emailMessage = '';

    if (type === 'custom') {
      emailSubject = `Regarding your application for ${jobTitle}`;
      emailMessage = `Dear ${candidateName},

[Please write your message here]

Best regards,
HR Team`;
    } else {
      emailSubject = templates[type].subject;
      emailMessage = templates[type].message;
    }

    setEmailData({
      to: candidate.applicantId?.universityEmail || '',
      subject: emailSubject,
      message: emailMessage,
      candidateId: candidate._id,
      candidateName: candidateName,
      jobTitle: jobTitle,
      type
    });
    setShowEmailModal(true);
  };

  const sendEmail = async () => {
    setSending(true);
    try {
      const token = localStorage.getItem("company_accessToken");
      
      if (!token) {
        alert('Authentication error. Please login again.');
        return;
      }

      const response = await fetch('/api/company/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message,
          applicationId: selectedCandidates.find(c => c._id === emailData.candidateId)?.applicationId._id
        })
      });

      if (response.ok) {
        alert('Email sent successfully!');
        setShowEmailModal(false);
        setEmailData({
          to: "",
          subject: "",
          message: "",
          candidateId: "",
          candidateName: "",
          jobTitle: "",
          type: 'custom'
        });
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const statusOptions = [
    "All",
    "Interview Scheduled", 
    "Appointment Letter Sent",
    "Offer Accepted"
  ];

  const filteredCandidates = filterStatus === "All" 
    ? selectedCandidates 
    : selectedCandidates.filter(candidate => 
        getDisplayStatus(candidate.applicationId.status) === filterStatus
      );

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case 'selected':
        return 'Interview Scheduled';
      case 'offered':
        return 'Appointment Letter Sent';
      case 'accepted':
        return 'Offer Accepted';
      default:
        return 'Interview Scheduled';
    }
  };

  const getStatusColor = (status: string) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Appointment Letter Sent":
        return "bg-green-100 text-green-800";
      case "Offer Accepted":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading selected candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selected Candidates
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your selected candidates and send appointment letters ({filteredCandidates.length} candidates)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button 
            onClick={fetchSelectedCandidates}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Selected</p>
              <p className="text-2xl font-bold text-gray-900">{selectedCandidates.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Interview Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedCandidates.filter(c => getDisplayStatus(c.applicationId.status) === 'Interview Scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">📧</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Letters Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedCandidates.filter(c => getDisplayStatus(c.applicationId.status) === 'Appointment Letter Sent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Offers Accepted</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedCandidates.filter(c => getDisplayStatus(c.applicationId.status) === 'Offer Accepted').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <div
            key={candidate._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {candidate.applicantId?.nameWithInitials || candidate.applicantId?.name?.substring(0, 2).toUpperCase() || 'UN'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {candidate.applicantId?.name || 'Unknown Name'}
                    </h3>
                    <p className="text-sm text-gray-600">{candidate.applicantId?.universityEmail || 'No email'}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium rounded-full px-2 py-1 ${getStatusColor(candidate.applicationId.status)}`}>
                  {getDisplayStatus(candidate.applicationId.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Job Position</p>
                  <p className="text-sm text-gray-600">{candidate.jobId?.title || 'Unknown Position'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Education</p>
                  <p className="text-sm text-gray-600">
                    {candidate.applicantId?.education?.degreeProgramme || 'Unknown Degree'}
                  </p>
                  <p className="text-xs text-gray-500">{candidate.applicantId?.education?.faculty || 'Unknown Faculty'}</p>
                </div>

                {candidate.applicantId?.skills && candidate.applicantId.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.applicantId.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.applicantId.skills.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{candidate.applicantId.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Selected on {formatDate(candidate.shortlistedAt)}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleSendEmail(candidate, 'appointment')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      📧 Send Appointment Letter
                    </button>
                    
                    <button
                      onClick={() => handleSendEmail(candidate, 'interview')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      📞 Schedule Final Interview
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCandidate(candidate)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleSendEmail(candidate, 'custom')}
                        className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
                      >
                        Custom Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCandidates.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {filterStatus === "All" ? "No selected candidates" : `No candidates with status: ${filterStatus}`}
          </h3>
          <p className="text-gray-500 mb-6">
            {filterStatus === "All" 
              ? "Selected candidates will appear here after you mark them as 'Selected' in the shortlist"
              : "Try selecting a different status filter"}
          </p>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {selectedCandidate.applicantId?.nameWithInitials || selectedCandidate.applicantId?.name?.substring(0, 2).toUpperCase() || 'UN'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedCandidate.applicantId?.name || 'Unknown Name'}
                    </h3>
                    <p className="text-gray-600">{selectedCandidate.jobId?.title || 'Unknown Position'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Email:</span> {selectedCandidate.applicantId?.universityEmail || 'No email'}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                <p className="text-sm text-gray-700">{selectedCandidate.applicantId?.education?.degreeProgramme || 'Unknown Degree'}</p>
                <p className="text-sm text-gray-600">{selectedCandidate.applicantId?.education?.faculty || 'Unknown Faculty'}</p>
              </div>

              {selectedCandidate.applicantId?.skills && selectedCandidate.applicantId.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.applicantId.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.applicationId?.coverLetter && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                  <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedCandidate.applicationId.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Applied:</span>
                    <span className="ml-2 text-gray-600">{formatDate(selectedCandidate.applicationId?.appliedAt || new Date().toISOString())}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Selected:</span>
                    <span className="ml-2 text-gray-600">{formatDate(selectedCandidate.shortlistedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSendEmail(selectedCandidate, 'appointment');
                  setSelectedCandidate(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Send Appointment Letter
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
                To: {emailData.candidateName} ({emailData.jobTitle})
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={12}
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={sending || !emailData.to.trim() || !emailData.subject.trim() || !emailData.message.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
