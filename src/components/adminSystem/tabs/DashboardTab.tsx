"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  FileText,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  pendingVerifications: number;
  recentActivities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export default function DashboardTab() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    pendingVerifications: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        totalCompanies: 89,
        totalJobs: 156,
        pendingVerifications: 23,
        recentActivities: [
          {
            id: "1",
            type: "user_registration",
            message: "New student registered: John Doe (Engineering Faculty)",
            timestamp: "2 minutes ago",
          },
          {
            id: "2",
            type: "company_verification",
            message: "Company verification approved: Tech Solutions Ltd",
            timestamp: "15 minutes ago",
          },
          {
            id: "3",
            type: "job_posting",
            message: "New job posted: Software Engineer at InnovaTech",
            timestamp: "1 hour ago",
          },
          {
            id: "4",
            type: "user_verification",
            message: "Student email verified: jane.smith@university.ac.lk",
            timestamp: "2 hours ago",
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalUsers,
      icon: <Users className="w-8 h-8 text-blue-600" />,
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Total Companies",
      value: stats.totalCompanies,
      icon: <Building2 className="w-8 h-8 text-green-600" />,
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Active Jobs",
      value: stats.totalJobs,
      icon: <Briefcase className="w-8 h-8 text-purple-600" />,
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: <AlertTriangle className="w-8 h-8 text-orange-600" />,
      change: "-5%",
      changeType: "negative",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h2>
        <p className="text-blue-100">
          Monitor and manage your Careerly platform efficiently
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      card.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last month
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "user_registration"
                      ? "bg-blue-500"
                      : activity.type === "company_verification"
                      ? "bg-green-500"
                      : activity.type === "job_posting"
                      ? "bg-purple-500"
                      : "bg-orange-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all activities →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  Review Pending Verifications
                </span>
              </div>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {stats.pendingVerifications}
              </span>
            </button>

            <button className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">
                  Manage Users
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Analytics removed - button intentionally omitted */}
          </div>
        </div>
      </div>
    </div>
  );
}
