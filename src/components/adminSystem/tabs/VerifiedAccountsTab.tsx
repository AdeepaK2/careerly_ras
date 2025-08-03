'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical, 
  Building2,
  GraduationCap,
  Calendar,
  TrendingUp,
  Users,
  Award,
  BarChart3
} from 'lucide-react';

interface VerifiedAccount {
  _id: string;
  accountType: 'company' | 'undergraduate';
  accountName: string;
  accountEmail: string;
  accountId: string;
  isVerified: boolean;
  isActive: boolean;
  verifiedAt: string;
  createdAt: string;
  lastLogin?: string;
  // Company specific fields
  companyName?: string;
  registrationNumber?: string;
  industry?: string;
  companySize?: string;
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
    totalAccounts: number;
    totalVerified: number;
    totalUnverified: number;
    verifiedCompanies: number;
    verifiedUndergraduates: number;
    unverifiedCompanies: number;
    unverifiedUndergraduates: number;
    recentlyVerified: number;
    verificationRate: {
      companies: string;
      undergraduates: string;
      overall: string;
    };
  };
  trends: {
    monthly: Array<{
      month: string;
      companies: number;
      undergraduates: number;
      total: number;
    }>;
  };
  distributions: {
    industries: Array<{ name: string; count: number }>;
    faculties: Array<{ name: string; count: number }>;
  };
}

export default function VerifiedAccountsTab() {
  const [accounts, setAccounts] = useState<VerifiedAccount[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'company' | 'undergraduate'>('all');
  const [filterVerification, setFilterVerification] = useState<'all' | 'verified' | 'unverified'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<VerifiedAccount | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAccounts = async (page = 1, type = filterType, verification = filterVerification, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/verified-accounts?page=${page}&limit=10&type=${type}&verification=${verification}&search=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.data.accounts);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error('Failed to fetch accounts:', data.message);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/admin/verified-accounts/stats');
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
    fetchAccounts();
    fetchStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchAccounts(1, filterType, filterVerification, searchTerm);
  }, [filterType, filterVerification, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAccounts(page, filterType, filterVerification, searchTerm);
  };

  const handleToggleVerification = async (account: VerifiedAccount) => {
    try {
      setActionLoading(account._id);
      const response = await fetch(`/api/admin/verified-accounts/${account._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: account.isVerified ? 'unverify' : 'verify',
          accountType: account.accountType
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAccounts(prev => prev.map(acc => 
          acc._id === account._id 
            ? { ...acc, isVerified: !acc.isVerified }
            : acc
        ));
        // Refresh stats
        fetchStats();
      } else {
        console.error('Failed to update verification:', data.message);
        alert('Failed to update verification status');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('Failed to update verification status');
    } finally {
      setActionLoading(null);
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

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.summary.totalAccounts || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All registered accounts</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Verified</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.summary.totalVerified || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {statsLoading ? 'Loading...' : `${stats?.summary.verificationRate.overall || 0}% of all accounts`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Companies</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.summary.verifiedCompanies || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {statsLoading ? 'Loading...' : `${stats?.summary.unverifiedCompanies || 0} unverified`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.summary.verifiedUndergraduates || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {statsLoading ? 'Loading...' : `${stats?.summary.unverifiedUndergraduates || 0} unverified`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Verifications</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.summary.recentlyVerified || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Account verification Management</h2>
             
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search accounts..."
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
                <option value="all">All Account Types</option>
                <option value="company">Companies</option>
                <option value="undergraduate">Students</option>
              </select>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
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
                  Verification Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading accounts...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No accounts found matching your criteria
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            account.accountType === 'company' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {account.accountType === 'company' ? (
                              <Building2 className={`h-5 w-5 ${
                                account.accountType === 'company' ? 'text-blue-600' : 'text-purple-600'
                              }`} />
                            ) : (
                              <GraduationCap className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {account.accountName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {account.accountEmail}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {account.accountId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.accountType === 'company'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {account.accountType === 'company' ? 'Company' : 'Student'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {account.isVerified ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-800 font-medium">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-800 font-medium">Unverified</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.verifiedAt ? formatDate(account.verifiedAt) : 'Not verified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.lastLogin ? formatDate(account.lastLogin) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleVerification(account)}
                          disabled={actionLoading === account._id}
                          className={`p-1 ${account.isVerified ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          title={account.isVerified ? 'Unverify Account' : 'Verify Account'}
                        >
                          {actionLoading === account._id ? (
                            <div className={`h-4 w-4 border-2 ${account.isVerified ? 'border-yellow-600' : 'border-green-600'} border-t-transparent rounded-full animate-spin`} />
                          ) : account.isVerified ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
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

      {/* Account Details Modal */}
      {showDetails && selectedAccount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedAccount.accountType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedAccount.isVerified ? 'Verified' : 'Not Verified'} • 
                    {selectedAccount.isActive ? ' Active' : ' Inactive'}
                  </p>
                </div>
              </div>

              {selectedAccount.accountType === 'company' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAccount.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAccount.registrationNumber}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Industry</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAccount.industry}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Size</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAccount.companySize}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAccount.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Index Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAccount.index}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Faculty</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAccount.education?.faculty}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Batch</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAccount.batch}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Degree Programme</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAccount.education?.degreeProgramme}</p>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAccount.accountEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registered Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAccount.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedAccount.verifiedAt ? formatDate(selectedAccount.verifiedAt) : 'Not verified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Login</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedAccount.lastLogin ? formatDate(selectedAccount.lastLogin) : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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
