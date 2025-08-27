"use client";

import { useState, useEffect } from "react";

interface CompanyUser {
  id: string;
  companyName: string;
  registrationNumber: string;
  businessEmail: string;
  phoneNumber: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  isVerified: boolean;
  isActive: boolean;
  jobPostingLimits: {
    maxActiveJobs: number;
    currentActiveJobs: number;
  };
  registrationDate: string;
  lastLogin?: string;
}

export default function CompanyUsersTab() {
  const [companies, setCompanies] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setCompanies([
        {
          id: "1",
          companyName: "Tech Solutions Ltd",
          registrationNumber: "PV 12345",
          businessEmail: "hr@techsolutions.lk",
          phoneNumber: "+94 11 234 5678",
          industry: "Technology",
          companySize: "50-100",
          foundedYear: 2015,
          isVerified: true,
          isActive: true,
          jobPostingLimits: {
            maxActiveJobs: 10,
            currentActiveJobs: 3,
          },
          registrationDate: "2024-01-10",
          lastLogin: "2024-07-31",
        },
        {
          id: "2",
          companyName: "InnovaTech Pvt Ltd",
          registrationNumber: "PV 67890",
          businessEmail: "careers@innovatech.lk",
          phoneNumber: "+94 11 987 6543",
          industry: "Software Development",
          companySize: "10-50",
          foundedYear: 2020,
          isVerified: false,
          isActive: true,
          jobPostingLimits: {
            maxActiveJobs: 5,
            currentActiveJobs: 1,
          },
          registrationDate: "2024-02-15",
          lastLogin: "2024-07-29",
        },
        {
          id: "3",
          companyName: "Global Manufacturing Co",
          registrationNumber: "PV 11111",
          businessEmail: "jobs@globalmanufacturing.lk",
          phoneNumber: "+94 11 555 1234",
          industry: "Manufacturing",
          companySize: "100+",
          foundedYear: 2010,
          isVerified: true,
          isActive: false,
          jobPostingLimits: {
            maxActiveJobs: 15,
            currentActiveJobs: 0,
          },
          registrationDate: "2024-01-05",
          lastLogin: "2024-07-20",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.businessEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && company.isVerified) ||
      (filterStatus === "unverified" && !company.isVerified) ||
      (filterStatus === "active" && company.isActive) ||
      (filterStatus === "inactive" && !company.isActive);

    return matchesSearch && matchesFilter;
  });

  const handleToggleVerification = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? { ...company, isVerified: !company.isVerified }
          : company
      )
    );
  };

  const handleToggleActive = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? { ...company, isActive: !company.isActive }
          : company
      )
    );
  };

  const handleDeleteCompany = (companyId: string) => {
    if (confirm("Are you sure you want to delete this company?")) {
      setCompanies((prev) =>
        prev.filter((company) => company.id !== companyId)
      );
    }
  };

  const handleUpdateJobLimit = (companyId: string, newLimit: number) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? {
              ...company,
              jobPostingLimits: {
                ...company.jobPostingLimits,
                maxActiveJobs: newLimit,
              },
            }
          : company
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Company Management
          </h2>
          <p className="text-gray-900">
            Manage company accounts and permissions
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {companies.length}
          </div>
          <div className="text-sm text-gray-600">Total Companies</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {companies.filter((c) => c.isVerified).length}
          </div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">
            {companies.filter((c) => !c.isVerified).length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            {companies.reduce(
              (sum, c) => sum + c.jobPostingLimits.currentActiveJobs,
              0
            )}
          </div>
          <div className="text-sm text-gray-600">Active Jobs</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search by company name, email, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Companies</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="text-sm text-gray-900">
            Showing {filteredCompanies.length} of {companies.length} companies
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Company Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Industry & Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Job Postings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {company.companyName}
                      </div>
                      <div className="text-sm text-gray-900">
                        {company.businessEmail}
                      </div>
                      <div className="text-sm text-gray-900">
                        {company.registrationNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {company.industry}
                      </div>
                      <div className="text-sm text-gray-900">
                        {company.companySize} employees
                      </div>
                      <div className="text-sm text-gray-900">
                        Founded {company.foundedYear}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {company.jobPostingLimits.currentActiveJobs} /{" "}
                        {company.jobPostingLimits.maxActiveJobs}
                      </div>
                      <div className="text-sm text-gray-900">
                        Active / Limit
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (company.jobPostingLimits.currentActiveJobs /
                                company.jobPostingLimits.maxActiveJobs) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {company.isVerified ? "Verified" : "Pending"}
                      </span>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.isActive
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {company.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleVerification(company.id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            company.isVerified
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {company.isVerified ? "Unverify" : "Verify"}
                        </button>
                        <button
                          onClick={() => handleToggleActive(company.id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            company.isActive
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }`}
                        >
                          {company.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium hover:bg-purple-200">
                          Edit Limit
                        </button>
                        <button className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200">
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
