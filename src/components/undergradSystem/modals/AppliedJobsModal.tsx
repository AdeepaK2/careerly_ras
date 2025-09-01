'use client';

import React from 'react';

interface Company {
  _id: string;
  companyName: string;
}

interface Job {
  _id: string;
  title: string;
  companyId: Company;
  location: string;
  jobType: string;
  salaryRange?: {
    min?: number;
    max?: number;
  };
}

interface Application {
  _id: string;
  jobId: Job;
  status: "applied" | "interviewed" | "interview_called" | "selected" | "rejected";
  appliedAt: string;
  interviewCall: boolean;
  expectingSalary?: number;
  coverLetter?: string;
}

interface AppliedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliedJobs: Application[];
  onRefresh: () => void;
}

export default function AppliedJobsModal({ isOpen, onClose, appliedJobs, onRefresh }: AppliedJobsModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shortlisted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "interview_called":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "selected":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "interviewed":
        return "⏳";
      case "applied":
        return "📋";
      case "interview_called":
        return "🎯";
      case "selected":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "📄";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Date not available";
    }
  };

  const formatSalary = (salaryRange?: { min?: number; max?: number }) => {
    if (!salaryRange) return "Not specified";
    const { min, max } = salaryRange;
    if (min && max) return `LKR ${min.toLocaleString()} - LKR ${max.toLocaleString()}`;
    if (min) return `From LKR ${min.toLocaleString()}`;
    if (max) return `Up to LKR ${max.toLocaleString()}`;
    return "Not specified";
  };

  const groupedJobs = appliedJobs.reduce((acc, application) => {
    const status = application.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(application);
    return acc;
  }, {} as Record<string, Application[]>);

  const statusOrder = ["applied","interview_called","interviewed", "selected", "rejected"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#8243ff] to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <span className="mr-3">📄</span>
                My Applications
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Track your job application status and progress
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onRefresh}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-purple-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {appliedJobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Applications Yet
              </h3>
              <p className="text-gray-500">
                Start applying to jobs to see your applications here
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {statusOrder.map((status) => {
                  const count = groupedJobs[status]?.length || 0;
                  const statusDisplay = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <div key={status} className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-2xl">{getStatusIcon(status)}</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs font-medium">{statusDisplay}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Applications by Status */}
              {statusOrder.map((status) => {
                const applications = groupedJobs[status];
                if (!applications || applications.length === 0) return null;

                const statusDisplay = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

                return (
                  <div key={status} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2 text-xl">{getStatusIcon(status)}</span>
                      {statusDisplay} ({applications.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div
                          key={application._id}
                          className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-xl font-semibold text-gray-800 mb-1">
                                    {application.jobId.title}
                                  </h4>
                                  <p className="text-[#8243ff] font-medium mb-2">
                                    {application.jobId.companyId?.companyName || "Company Name"}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                                  {getStatusIcon(application.status)} {application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span>📍</span>
                                  <span>{application.jobId.location}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span>💼</span>
                                  <span>{application.jobId.jobType}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span>💰</span>
                                  <span>{formatSalary(application.jobId.salaryRange)}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Applied on: </span>
                                  <span className="text-gray-600">{formatDate(application.appliedAt)}</span>
                                </div>
                                {application.expectingSalary && (
                                  <div>
                                    <span className="font-medium text-gray-700">Expected Salary: </span>
                                    <span className="text-gray-600">LKR {application.expectingSalary.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>

                              {application.coverLetter && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                  <h5 className="font-medium text-gray-700 mb-2">Cover Letter:</h5>
                                  <p className="text-sm text-gray-600 line-clamp-3">
                                    {application.coverLetter}
                                  </p>
                                </div>
                              )}

                              {application.interviewCall && (
                                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                  <div className="flex items-center space-x-2 text-purple-800">
                                    <span>📞</span>
                                    <span className="font-medium">Interview Scheduled!</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}