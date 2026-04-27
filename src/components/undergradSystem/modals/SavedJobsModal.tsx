'use client';

import React from 'react';
import {
  MdSave,
  MdRefresh,
  MdClose,
  MdFolder,
  MdCheckCircle,
  MdAccessTime,
  MdLocationOn,
  MdWork,
  MdBusiness,
  MdWarning,
  MdSchedule,
  MdArchive
} from 'react-icons/md';
import {
  FaFire,
  FaCheck,
  FaMoneyBillWave
} from 'react-icons/fa';

interface Company {
  _id: string;
  companyName: string;
  logo?: string | null;
}

interface SavedJob {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyId?: Company | string | null;
    customCompanyName?: string;
    location: string;
    jobType: string;
    workPlaceType?: string;
    description: string;
    salaryRange?: {
      min?: number;
      max?: number;
    };
    deadline: string;
    skillsRequired: string[];
    status: string;
    urgent: boolean;
    posted_date: string;
  };
  savedAt: string;
  companyName: string;
}

interface SavedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedJobs: SavedJob[];
  onRefresh: () => void;
  onUnsaveJob: (jobId: string) => void;
  onApplyToJob: (jobId: string) => void;
  appliedJobs: Set<string>;
}

export default function SavedJobsModal({ 
  isOpen, 
  onClose, 
  savedJobs, 
  onRefresh, 
  onUnsaveJob,
  onApplyToJob,
  appliedJobs 
}: SavedJobsModalProps) {
  if (!isOpen) return null;

  const getCompanyName = (savedJob: SavedJob) => {
    if (savedJob.companyName?.trim()) {
      return savedJob.companyName;
    }

    if (typeof savedJob.jobId.companyId === 'object' && savedJob.jobId.companyId?.companyName) {
      return savedJob.jobId.companyId.companyName;
    }

    return savedJob.jobId.customCompanyName || 'Company Name';
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

  const getTimeRemaining = (deadlineString: string) => {
    try {
      const deadline = new Date(deadlineString);
      const now = new Date();
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: "Deadline passed", color: "text-red-600" };
      if (diffDays === 0) return { text: "Deadline today", color: "text-red-600" };
      if (diffDays <= 3) return { text: `${diffDays} days left`, color: "text-orange-600" };
      if (diffDays <= 7) return { text: `${diffDays} days left`, color: "text-yellow-600" };
      return { text: `${diffDays} days left`, color: "text-green-600" };
    } catch {
      return { text: "Deadline not available", color: "text-gray-600" };
    }
  };

  const isJobExpired = (deadlineString: string) => {
    try {
      const deadline = new Date(deadlineString);
      const now = new Date();
      return deadline.getTime() < now.getTime();
    } catch {
      return false;
    }
  };

  // Group jobs by status
  const activeJobs = savedJobs.filter(job => 
    job.jobId.status === 'active' && !isJobExpired(job.jobId.deadline)
  );
  const expiredJobs = savedJobs.filter(job => 
    job.jobId.status !== 'active' || isJobExpired(job.jobId.deadline)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-[#8243ff] to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <MdSave className="w-7 h-7 mr-3" />
                Saved Jobs
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Manage your saved job opportunities
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onRefresh}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <MdRefresh className="w-5 h-5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={onClose}
                aria-label="Close saved jobs modal"
                className="text-white hover:text-purple-200 text-2xl font-bold"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {savedJobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4 flex justify-center">
                <MdFolder className="w-20 h-20 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Saved Jobs Yet
              </h3>
              <p className="text-gray-500">
                Start saving jobs to build your personal collection
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
                <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 flex flex-col items-center justify-center text-center">
                  <p className="text-2xl font-bold text-green-700">{activeJobs.length}</p>
                  <div className="flex items-center space-x-2 mb-2 justify-center">
                    <h4 className="font-semibold text-green-800">Active Jobs</h4>
                  </div>
                </div>

                <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 flex flex-col items-center justify-center text-center">
                  <p className="text-2xl font-bold text-green-700">{expiredJobs.length}</p>
                  <div className="flex items-center space-x-2 mb-2 justify-center">
                    <h4 className="font-semibold text-green-800">Expired Jobs</h4>
                  </div>
                </div>
                
                <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 flex flex-col items-center justify-center text-center">
                  <p className="text-2xl font-bold text-blue-700">{savedJobs.length}</p>
                  <div className="flex items-center space-x-2 mb-2 justify-center">
                    <h4 className="font-semibold text-blue-800">Total Saved</h4>
                  </div>
                </div>
              </div>

              {/* Active Jobs Section */}
              {activeJobs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MdCheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Active Jobs ({activeJobs.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {activeJobs.map((savedJob) => (
                      <div
                        key={savedJob._id}
                        className="bg-linear-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-xl font-semibold text-gray-800 mb-1">
                                  {savedJob.jobId.title}
                                </h4>
                                <p className="text-[#8243ff] font-medium mb-2">
                                  {getCompanyName(savedJob)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {savedJob.jobId.urgent && (
                                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                    <FaFire className="w-3 h-3" />
                                    <span>Urgent</span>
                                  </span>
                                )}
                                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                  <FaCheck className="w-3 h-3" />
                                  <span>Active</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MdLocationOn className="w-4 h-4" />
                                <span>{savedJob.jobId.location}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MdWork className="w-4 h-4" />
                                <span>{savedJob.jobId.jobType}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MdBusiness className="w-4 h-4" />
                                <span>{savedJob.jobId.workPlaceType || 'On-site'}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FaMoneyBillWave className="w-4 h-4" />
                                <span>{formatSalary(savedJob.jobId.salaryRange)}</span>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-4 line-clamp-2">
                              {savedJob.jobId.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {savedJob.jobId.skillsRequired?.slice(0, 4).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {savedJob.jobId.skillsRequired?.length > 4 && (
                                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                                  +{savedJob.jobId.skillsRequired.length - 4} more
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <span className="font-medium text-gray-700">Saved on: </span>
                                <span className="text-gray-600">{formatDate(savedJob.savedAt)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Deadline: </span>
                                <span className={getTimeRemaining(savedJob.jobId.deadline).color}>
                                  <MdSchedule className="w-3 h-3 inline mr-1" />
                                  {getTimeRemaining(savedJob.jobId.deadline).text}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => onApplyToJob(savedJob.jobId._id)}
                                disabled={appliedJobs.has(savedJob.jobId._id)}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform cursor-pointer ${
                                  appliedJobs.has(savedJob.jobId._id)
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : "bg-linear-to-r from-[#8243ff] to-[#6c2bd9] hover:from-[#6c2bd9] hover:to-[#5a1fc7] text-white"
                                }`}
                              >
                                {appliedJobs.has(savedJob.jobId._id) ? "Applied ✓" : "Apply Now"}
                              </button>
                              
                              <button
                                onClick={() => onUnsaveJob(savedJob.jobId._id)}
                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center space-x-1 cursor-pointer"
                              >
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expired Jobs Section */}
              {expiredJobs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MdAccessTime className="w-5 h-5 mr-2 text-gray-600" />
                    Expired Jobs ({expiredJobs.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {expiredJobs.map((savedJob) => (
                      <div
                        key={savedJob._id}
                        className="bg-linear-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300 p-6 opacity-75"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-xl font-semibold text-gray-600 mb-1">
                                  {savedJob.jobId.title}
                                </h4>
                                <p className="text-gray-500 font-medium mb-2">
                                  {getCompanyName(savedJob)}
                                </p>
                              </div>
                              <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                <MdWarning className="w-3 h-3" />
                                <span>Expired</span>
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <span className="font-medium text-gray-600">Saved on: </span>
                                <span className="text-gray-500">{formatDate(savedJob.savedAt)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Deadline was: </span>
                                <span className="text-red-500 flex items-center space-x-1">
                                  <MdArchive className="w-3 h-3" />
                                  <span>{formatDate(savedJob.jobId.deadline)}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <button
                                disabled
                                className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                              >
                                Application Closed
                              </button>
                              
                              <button
                                onClick={() => onUnsaveJob(savedJob.jobId._id)}
                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center space-x-1"
                              >
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}