'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare,
  Building2,
  GraduationCap,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  ChevronDown,
  Send,
  Flag,
  Upload,
  Download
} from 'lucide-react';

interface VerificationRequest {
  _id: string;
  accountType: 'company' | 'undergraduate';
  accountName: string;
  accountEmail: string;
  accountId: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
  verificationPriority: 'low' | 'medium' | 'high';
  createdAt: string;
  verificationRequestedAt: string;
  verificationNotes?: Array<{
    note: string;
    addedBy: string;
    addedAt: string;
  }>;
  verificationDocuments?: Array<{
    name: string;
    url: string;
    type: string;
    isRequired?: boolean;
    isVerified?: boolean;
    uploadedAt: string;
  }>;
  hasDocuments: boolean;
  // Company specific fields
  companyName?: string;
  industry?: string;
  contactPerson?: {
    name: string;
    email: string;
  };
  // Undergraduate specific fields
  name?: string;
  index?: string;
  batch?: string;
  education?: {
    faculty: string;
    degreeProgramme: string;
  };
}

interface Stats {
  summary: {
    totalRequests: number;
    totalPending: number;
    totalUnderReview: number;
    totalVerified: number;
    totalRejected: number;
    totalHighPriority: number;
    recentActivity: number;
    avgProcessingDays: number;
    verificationRate: {
      companies: string;
      undergraduates: string;
      overall: string;
    };
  };
  breakdown: {
    companies: {
      total: number;
      verified: number;
      pending: number;
      underReview: number;
      rejected: number;
      highPriority: number;
    };
    undergraduates: {
      total: number;
      verified: number;
      pending: number;
      underReview: number;
      rejected: number;
      highPriority: number;
    };
  };
}

export default function PendingVerificationsTab() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'company' | 'undergraduate'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('pending');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [detailedRequest, setDetailedRequest] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const fetchRequests = async (page = 1, type = filterType, status = filterStatus, priority = filterPriority, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/pending-verifications?page=${page}&limit=10&type=${type}&status=${status}&priority=${priority}&search=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data.requests);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error('Failed to fetch verification requests:', data.message);
      }
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedRequest = async (requestId: string) => {
    try {
      setLoadingDetails(true);
      const response = await fetch(`/api/admin/pending-verifications/${requestId}`);
      const data = await response.json();
      
      if (data.success) {
        setDetailedRequest(data.data);
      } else {
        console.error('Failed to fetch detailed request:', data.message);
        alert('Failed to load detailed information');
      }
    } catch (error) {
      console.error('Error fetching detailed request:', error);
      alert('Failed to load detailed information');
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/admin/pending-verifications/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Failed to fetch stats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchRequests(1, filterType, filterStatus, filterPriority, searchTerm);
  }, [filterType, filterStatus, filterPriority, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRequests(page, filterType, filterStatus, filterPriority, searchTerm);
  };

  const handleAction = async (request: VerificationRequest, action: string, additionalData?: any) => {
    try {
      setActionLoading(request._id);
      const response = await fetch(`/api/admin/pending-verifications/${request._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          accountType: request.accountType,
          ...additionalData
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRequests(prev => prev.map(req => 
          req._id === request._id 
            ? { ...req, ...data.data }
            : req
        ));
        // Refresh stats
        fetchStats();
        
        // If detailed view is open, refresh it
        if (showDetails && selectedRequest?._id === request._id) {
          await fetchDetailedRequest(request._id);
        }
        
        // Close modals
        setShowNoteModal(false);
        setShowPriorityModal(false);
        setNewNote('');
        
        // Show success message
        alert(`Action completed successfully!`);
      } else {
        console.error('Failed to perform action:', data.message);
        alert('Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-800 bg-yellow-100';
      case 'under_review': return 'text-blue-800 bg-blue-100';
      case 'approved': return 'text-green-800 bg-green-100';
      case 'rejected': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-800 bg-red-100';
      case 'medium': return 'text-yellow-800 bg-yellow-100';
      case 'low': return 'text-green-800 bg-green-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysWaiting = (dateString: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDocumentType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'student_id': 'Student ID Card',
      'enrollment_certificate': 'Enrollment Certificate',
      'transcript': 'Academic Transcript',
      'business_registration': 'Business Registration',
      'company_license': 'Company License',
      'other': 'Other Document'
    };
    return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.summary.totalPending || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {statsLoading ? 'Loading...' : `${stats?.breakdown.companies.pending || 0} companies, ${stats?.breakdown.undergraduates.pending || 0} students`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.summary.totalUnderReview || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Currently being processed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.summary.totalHighPriority || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Require immediate attention</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : Math.round(stats?.summary.avgProcessingDays || 0)}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Days to complete</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Verification Requests</h2>
              <p className="text-sm text-gray-600">Review and manage account verification requests</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="company">Companies</option>
                <option value="undergraduate">Students</option>
              </select>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Waiting
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading verification requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No verification requests found matching your criteria
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            request.accountType === 'company' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {request.accountType === 'company' ? (
                              <Building2 className="h-5 w-5 text-blue-600" />
                            ) : (
                              <GraduationCap className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.accountName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.accountEmail}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {request.accountId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.accountType === 'company'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {request.accountType === 'company' ? 'Company' : 'Student'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.verificationStatus)}`}>
                        {request.verificationStatus.replace('_', ' ').charAt(0).toUpperCase() + request.verificationStatus.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.verificationPriority)}`}>
                        {request.verificationPriority.charAt(0).toUpperCase() + request.verificationPriority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDaysWaiting(request.verificationRequestedAt)} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {request.hasDocuments ? (
                          <>
                            <FileText className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-800">Available</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-sm text-red-800">Missing</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            setSelectedRequest(request);
                            setShowDetails(true);
                            await fetchDetailedRequest(request._id);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {!['approved'].includes(request.verificationStatus) && (
                          <>
                            <button
                              onClick={() => handleAction(request, 'approve')}
                              disabled={actionLoading === request._id}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Approve"
                            >
                              {actionLoading === request._id ? (
                                <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                            
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for rejection:');
                                if (reason) {
                                  handleAction(request, 'reject', { notes: reason });
                                }
                              }}
                              disabled={actionLoading === request._id}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowNoteModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Add Note"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setNewPriority(request.verificationPriority);
                            setShowPriorityModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 p-1"
                          title="Set Priority"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Verification Request Details</h3>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setDetailedRequest(null);
                  setShowDocuments(false);
                  setShowMessages(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {loadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading details...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Navigation Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => { setShowDocuments(false); setShowMessages(false); }}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        !showDocuments && !showMessages
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Basic Info
                    </button>
                    <button
                      onClick={() => { setShowDocuments(true); setShowMessages(false); }}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        showDocuments
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Documents ({detailedRequest?.verificationDocuments?.length || 0})
                    </button>
                    <button
                      onClick={() => { setShowDocuments(false); setShowMessages(true); }}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        showMessages
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Messages ({detailedRequest?.verificationNotes?.length || 0})
                    </button>
                  </nav>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {/* Basic Information Tab */}
                  {!showDocuments && !showMessages && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Account Type</label>
                          <p className="mt-1 text-sm text-gray-900 capitalize">{selectedRequest.accountType}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Current Status</label>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.verificationStatus)}`}>
                              {selectedRequest.verificationStatus.replace('_', ' ').charAt(0).toUpperCase() + selectedRequest.verificationStatus.replace('_', ' ').slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedRequest.accountType === 'company' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Company Name</label>
                              <p className="mt-1 text-sm text-gray-900">{detailedRequest?.companyName || selectedRequest.companyName}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Industry</label>
                              <p className="mt-1 text-sm text-gray-900">{detailedRequest?.industry || selectedRequest.industry}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Business Email</label>
                              <p className="mt-1 text-sm text-gray-900">{detailedRequest?.businessEmail}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                              <p className="mt-1 text-sm text-gray-900">{detailedRequest?.registrationNumber}</p>
                            </div>
                          </div>
                          {detailedRequest?.contactPerson && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                              <p className="mt-1 text-sm text-gray-900">
                                {detailedRequest.contactPerson.name} ({detailedRequest.contactPerson.email})
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Student Name</label>
                              <p className="mt-1 text-sm text-gray-900">{detailedRequest?.name || selectedRequest.name}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Index Number</label>
                              <p className="mt-1 text-sm text-gray-900">{detailedRequest?.index || selectedRequest.index}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">University Email</label>
                              <p className="mt-1 text-sm text-gray-900">{detailedRequest?.universityEmail}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Batch</label>
                              <p className="mt-1 text-sm text-gray-900">{detailedRequest?.batch || selectedRequest.batch}</p>
                            </div>
                          </div>
                          {detailedRequest?.education && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Faculty</label>
                                <p className="mt-1 text-sm text-gray-900">{detailedRequest.education.faculty}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Degree Programme</label>
                                <p className="mt-1 text-sm text-gray-900">{detailedRequest.education.degreeProgramme}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Requested Date</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.verificationRequestedAt)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Days Waiting</label>
                          <p className="mt-1 text-sm text-gray-900">{getDaysWaiting(selectedRequest.verificationRequestedAt)} days</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Priority</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedRequest.verificationPriority)}`}>
                            {selectedRequest.verificationPriority.charAt(0).toUpperCase() + selectedRequest.verificationPriority.slice(1)}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Documents Status</label>
                          <div className="flex items-center mt-1">
                            {detailedRequest?.verificationDocuments?.length > 0 ? (
                              <>
                                <FileText className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-800">{detailedRequest.verificationDocuments.length} uploaded</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-sm text-red-800">No documents</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documents Tab */}
                  {showDocuments && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">Uploaded Documents</h4>
                        <span className="text-sm text-gray-500">
                          {detailedRequest?.verificationDocuments?.length || 0} documents uploaded
                        </span>
                      </div>
                      
                      {detailedRequest?.verificationDocuments?.length > 0 ? (
                        <div className="space-y-3">
                          {detailedRequest.verificationDocuments.map((doc: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <FileText className="h-8 w-8 text-blue-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                    <p className="text-xs text-gray-500">
                                      Type: {formatDocumentType(doc.type)} • Uploaded: {formatDate(doc.uploadedAt)}
                                    </p>
                                    {doc.isRequired && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {doc.isVerified ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Verified
                                    </span>
                                  ) : (
                                    <button
                                      onClick={async () => {
                                        await handleAction(selectedRequest, 'verify_document', { documentIndex: index });
                                      }}
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-green-100 hover:text-green-800"
                                    >
                                      Mark Verified
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      const downloadUrl = `/api/file/download?url=${encodeURIComponent(doc.url)}`;
                                      window.open(downloadUrl, '_blank');
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </button>
                                  <button
                                    onClick={() => window.open(doc.url, '_blank')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="mx-auto h-12 w-12 text-gray-300" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                          <p className="mt-1 text-sm text-gray-500">This user hasn't uploaded any verification documents yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Messages Tab */}
                  {showMessages && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">Verification Messages</h4>
                        <button
                          onClick={() => {
                            setSelectedRequest(selectedRequest);
                            setShowNoteModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Add Message
                        </button>
                      </div>
                      
                      {detailedRequest?.verificationNotes?.length > 0 ? (
                        <div className="space-y-4">
                          {detailedRequest.verificationNotes
                            .sort((a: any, b: any) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
                            .map((note: any, index: number) => (
                            <div key={index} className={`p-4 rounded-lg ${
                              note.addedBy === 'admin' ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50 border-l-4 border-gray-300'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{note.note}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {note.addedBy === 'admin' ? (
                                      <span className="inline-flex items-center">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                                          Admin
                                        </span>
                                        {formatDate(note.addedAt)}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center">
                                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                                          User
                                        </span>
                                        {formatDate(note.addedAt)}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                          <p className="mt-1 text-sm text-gray-500">Start a conversation with the user about their verification.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {!['approved'].includes(selectedRequest.verificationStatus) && (
                        <>
                          <button
                            onClick={() => {
                              handleAction(selectedRequest, 'approve');
                              setShowDetails(false);
                            }}
                            disabled={actionLoading === selectedRequest._id}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading === selectedRequest._id ? (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason) {
                                handleAction(selectedRequest, 'reject', { notes: reason });
                                setShowDetails(false);
                              }
                            }}
                            disabled={actionLoading === selectedRequest._id}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              const info = prompt('Additional information required:');
                              if (info) {
                                handleAction(selectedRequest, 'request_more_info', { notes: info });
                                setShowDetails(false);
                              }
                            }}
                            disabled={actionLoading === selectedRequest._id}
                            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Request Info
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedRequest(selectedRequest);
                          setNewPriority(selectedRequest.verificationPriority);
                          setShowPriorityModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Set Priority
                      </button>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowDetails(false);
                        setDetailedRequest(null);
                        setShowDocuments(false);
                        setShowMessages(false);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Verification Note</h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter verification note..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (newNote.trim()) {
                    handleAction(selectedRequest, 'add_note', { notes: newNote.trim() });
                  }
                }}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                Add Note
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Priority Modal */}
      {showPriorityModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Set Verification Priority</h3>
              <button
                onClick={() => setShowPriorityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  handleAction(selectedRequest, 'update_priority', { priority: newPriority });
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
              >
                Update Priority
              </button>
              <button
                onClick={() => setShowPriorityModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
