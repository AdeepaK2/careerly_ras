"use client";

import { useState, useEffect } from "react";

interface UndergraduateUser {
  id: string;
  index: string;
  name: string;
  nameWithInitials: string;
  universityEmail: string;
  batch: string;
  faculty: string;
  department: string;
  degreeProgramme: string;
  isVerified: boolean;
  jobSearchingStatus: string;
  registrationDate: string;
  lastLogin?: string;
}

export default function UndergraduateUsersTab() {
  const [users, setUsers] = useState<UndergraduateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setUsers([
        {
          id: "1",
          index: "ENG/2021/001",
          name: "John Doe",
          nameWithInitials: "J.A. Doe",
          universityEmail: "john.doe@university.ac.lk",
          batch: "2021",
          faculty: "Engineering",
          department: "Computer Science",
          degreeProgramme: "Computer Science and Engineering",
          isVerified: true,
          jobSearchingStatus: "Active",
          registrationDate: "2024-01-15",
          lastLogin: "2024-07-30",
        },
        {
          id: "2",
          index: "ENG/2021/002",
          name: "Jane Smith",
          nameWithInitials: "J.S. Smith",
          universityEmail: "jane.smith@university.ac.lk",
          batch: "2021",
          faculty: "Engineering",
          department: "Electrical Engineering",
          degreeProgramme: "Electrical and Electronic Engineering",
          isVerified: false,
          jobSearchingStatus: "Not Active",
          registrationDate: "2024-01-20",
          lastLogin: "2024-07-28",
        },
        {
          id: "3",
          index: "SCI/2020/045",
          name: "Mike Johnson",
          nameWithInitials: "M.R. Johnson",
          universityEmail: "mike.johnson@university.ac.lk",
          batch: "2020",
          faculty: "Science",
          department: "Mathematics",
          degreeProgramme: "Mathematics and Statistics",
          isVerified: true,
          jobSearchingStatus: "Active",
          registrationDate: "2024-01-10",
          lastLogin: "2024-07-31",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.index.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.universityEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && user.isVerified) ||
      (filterStatus === "unverified" && !user.isVerified) ||
      (filterStatus === "active" && user.jobSearchingStatus === "Active");

    return matchesSearch && matchesFilter;
  });

  const handleToggleVerification = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isVerified: !user.isVerified } : user
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }
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
            Undergraduate Students
          </h2>
          <p className="text-gray-900">Manage undergraduate student accounts</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Export Data
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search by name, index, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="active">Job Searching</option>
            </select>
          </div>
          <div className="text-sm text-gray-900">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Academic Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.nameWithInitials}
                      </div>
                      <div className="text-sm text-gray-900">{user.index}</div>
                      <div className="text-sm text-gray-900">
                        {user.universityEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {user.faculty}
                      </div>
                      <div className="text-sm text-gray-900">
                        {user.department}
                      </div>
                      <div className="text-sm text-gray-900">
                        Batch {user.batch}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                      <div className="text-sm text-gray-900">
                        {user.jobSearchingStatus}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {user.registrationDate}
                      </div>
                      <div className="text-sm text-gray-900">
                        Last login: {user.lastLogin || "Never"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleVerification(user.id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.isVerified
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                      >
                        {user.isVerified ? "Unverify" : "Verify"}
                      </button>
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200">
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200"
                      >
                        Delete
                      </button>
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
