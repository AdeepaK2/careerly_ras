"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Users,
  Calendar,
  Award,
  Plus,
  FileText,
  UserCheck,
  Clock,
  Building,
  Mail,
  Phone,
  Activity,
  ArrowRight,
  Hash,
  AtSign
} from "lucide-react";

type TabKey =
  | "home"
  | "jobPosting"
  | "selected"
  | "shortlist"
  | "profile"
  | "verification";

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
}

interface HomeTabProps {
  onTabChange?: (tab: TabKey) => void;
}

export default function HomeTab({ onTabChange }: HomeTabProps) {
  const router = useRouter();
  const [user, setUser] = useState<CompanyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newApplicationsToday: 0,
    interviewsScheduled: 0,
    offersExtended: 0,
  });
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      id: string;
      type: string;
      message: string;
      time: string;
      icon: string;
    }>
  >([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("company_accessToken")
          : null;

      if (!token) {
        router.push("/auth/company/login");
        return;
      }

      const [profileResponse, dashboardResponse] = await Promise.all([
        fetch("/api/auth/company/me", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/company/dashboard", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (profileResponse.ok) {
        const data = await profileResponse.json();
        setUser(data.data.user);
      } else {
        router.push("/auth/company/login");
        return;
      }

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setStats(dashboardData.data.stats);
        setRecentActivity(dashboardData.data.recentActivity || []);
      }
    } catch (error) {
      console.error("Dashboard load failed:", error);
      router.push("/auth/company/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <header className="glass-effect rounded-lg mb-6 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Company Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user.companyName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user.isVerified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 shadow-sm">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Not Verified
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Email Verification Banner */}
      {user && !user.isVerified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Email verification required!</strong> Please check
                  your email and click the verification link to activate your
                  account.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="glass-effect rounded-lg shadow-lg p-6 card-hover">
          <div className="flex items-center">
              <div className="shrink-0">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeJobs}
              </p>
              <p className="text-xs text-gray-500">
                of {user.jobPostingLimits.maxActiveJobs} max
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-lg shadow-lg p-6 card-hover">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Applications
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalApplications}
              </p>
              <p className="text-xs text-green-600">
                +{stats.newApplicationsToday} today
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-lg shadow-lg p-6 card-hover">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Interviews Scheduled
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.interviewsScheduled}
              </p>
              <p className="text-xs text-blue-600">3 this week</p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-lg shadow-lg p-6 card-hover">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Offers Extended
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.offersExtended}
              </p>
              <p className="text-xs text-orange-600">2 pending response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-effect rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <button
                disabled={!user.isVerified}
                className="bg-linear-to-r from-[#8243ff] to-purple-600 text-white px-6 py-4 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
                onClick={() => onTabChange?.("jobPosting")}
                title={!user.isVerified ? "Verify your company to post jobs" : ""}
              >
                <div className="flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-3" />
                  Post New Job
                </div>
              </button>

              <button
                className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
                onClick={() => onTabChange?.("shortlist")}
              >
                <div className="flex items-center justify-center">
                  <FileText className="w-5 h-5 mr-3" />
                  View Applications ({stats.totalApplications})
                </div>
              </button>

              <button
                className="bg-linear-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
                onClick={() => onTabChange?.("selected")}
              >
                <div className="flex items-center justify-center">
                  <UserCheck className="w-5 h-5 mr-3" />
                  Manage Selected Candidates
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-effect rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Activity className="w-5 h-5 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
                <button className="w-full text-[#8243ff] hover:text-purple-700 text-sm font-medium py-2 flex items-center justify-center">
                  View All Activity
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-white/40 p-6 text-center text-sm text-gray-500">
                No recent activity yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="glass-effect rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Company Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-3 shadow-lg">
                <Hash className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Registration Number
              </p>
              <p className="text-sm text-gray-900 font-semibold">
                {user.registrationNumber}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-3 shadow-lg">
                <AtSign className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Business Email
              </p>
              <p className="text-sm text-gray-900 font-semibold">
                {user.businessEmail}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-3 shadow-lg">
                <Phone className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-600">Phone Number</p>
              <p className="text-sm text-gray-900 font-semibold">
                {user.phoneNumber}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-3 shadow-lg">
                <Building className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-600">Industry</p>
              <p className="text-sm text-gray-900 font-semibold">
                {user.industry}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}