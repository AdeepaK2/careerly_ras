'use client';

import { useState, useEffect } from 'react';
import { useAuthenticatedRequest } from '@/hooks/useAuthenticatedRequest';

interface ApplicationStatus {
  _id: string;
  applicationId: string;
  jobId: {
    _id: string;
    title: string;
    companyId: {
      companyName: string;
      logo?: string;
    };
    jobType: string;
    location: string;
    deadline: string;
  };
  status: string;
  appliedAt: string;
  appliedDate: string;
  appliedTimeAgo: string;
  statusInfo: {
    label: string;
    color: string;
    icon: string;
    description: string;
  };
  coverLetter?: string;
  cv?: string;
  specialRequirements?: string;
}

export default function SelectedTab() {
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationStatus | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  const { makeAuthenticatedRequest } = useAuthenticatedRequest();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/application/status');
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
      } else {
        console.error('Failed to fetch applications:', data.error);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCV = async (cvUrl: string, jobTitle: string) => {
    try {
      const response = await makeAuthenticatedRequest(cvUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${jobTitle}_Application_CV.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Failed to download CV');
    }
  };

  const filterApplications = (apps: ApplicationStatus[]) => {
    if (filter === 'all') return apps;
    return apps.filter(app => app.status === filter);
  };

  const getFilterCounts = () => {
    return {
      all: applications.length,
      applied: applications.filter(app => app.status === 'applied').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      interview_called: applications.filter(app => app.status === 'interview_called').length,
      selected: applications.filter(app => app.status === 'selected').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  };

  const filteredApplications = filterApplications(applications);
  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#8243ff] via-[#6c2bd9] to-[#5a1fc7] rounded-2xl shadow-xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Applications</h1>
            <p className="text-purple-100">Track the status of all your job applications</p>
            <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-lg p-3 inline-block">
              <span className="text-2xl font-bold">{applications.length}</span>
              <span className="text-purple-100 ml-2">Total Applications</span>
            </div>
          </div>
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Applications ({counts.all})
          </button>
          <button
            onClick={() => setFilter('applied')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'applied'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Applied ({counts.applied})
          </button>
          <button
            onClick={() => setFilter('shortlisted')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'shortlisted'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Shortlisted ({counts.shortlisted})
          </button>
          <button
            onClick={() => setFilter('interview_called')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'interview_called'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Interview Called ({counts.interview_called})
          </button>
          <button
            onClick={() => setFilter('selected')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'selected'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Selected ({counts.selected})
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <div
              key={application._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {application.jobId.title}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        {application.jobId.companyId.companyName}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{application.jobId.jobType}</span>
                        <span>{application.jobId.location}</span>
                        <span>Applied {application.appliedTimeAgo}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${application.statusInfo.color}`}>
                        {application.statusInfo.icon} {application.statusInfo.label}
                      </span>
                      {(application.status === 'selected' || application.status === 'interview_called' || application.status === 'shortlisted') && (
                        <div className="mt-1">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs animate-pulse">
                            🔔 New Update
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">
                      {application.statusInfo.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    
                    {application.cv && (
                      <button
                        onClick={() => downloadCV(application.cv!, application.jobId.title)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                      >
                        Download CV
                      </button>
                    )}
                    
                    {(application.status === 'selected' || application.status === 'interview_called') && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                        🎉 Action Required - Check Email
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'all' ? 'No Applications Yet' : `No ${filter.replace('_', ' ')} Applications`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Start applying to jobs to see your applications here' 
                : `You don't have any applications with "${filter.replace('_', ' ')}" status`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
              >
                View All Applications
              </button>
            )}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Application Details
              </h3>
              <p className="text-sm text-gray-600">
                {selectedApplication.jobId.title} at {selectedApplication.jobId.companyId.companyName}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedApplication.statusInfo.color}`}>
                    {selectedApplication.statusInfo.icon} {selectedApplication.statusInfo.label}
                  </span>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {selectedApplication.statusInfo.description}
                </p>
              </div>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                  <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              {selectedApplication.specialRequirements && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Special Requirements</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-700">
                      {selectedApplication.specialRequirements}
                    </p>
                  </div>
                </div>
              )}

              {/* Application Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Application Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Applied Date:</span>
                    <span className="ml-2 text-gray-600">{selectedApplication.appliedDate}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time Ago:</span>
                    <span className="ml-2 text-gray-600">{selectedApplication.appliedTimeAgo}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              {selectedApplication.cv && (
                <button
                  onClick={() => downloadCV(selectedApplication.cv!, selectedApplication.jobId.title)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Download CV
                </button>
              )}
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
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
