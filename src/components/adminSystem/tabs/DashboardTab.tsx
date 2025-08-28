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
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Target,
  Award,
  Clock,
  UserCheck,
  Building,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuthenticatedRequest } from "@/hooks/useAuthenticatedRequest";
import { format as formatDate, subDays, startOfDay, endOfDay } from "date-fns";
import {
  DashboardStats,
  Activity,
  TrendData,
  DateRange,
  CombinedTrendPoint,
} from "@/types/AdminTypes";

interface DashboardTabProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function DashboardTab({ onNavigateToTab }: DashboardTabProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    pendingVerifications: 0,
    new24h: 0,
    dau: 0,
    mau: 0,
    jobs24h: 0,
    applications24h: 0,
    avgApplicationsPerJob: 0,
    // Enhanced KPIs
    totalRegisteredStudents: 0,
    totalVerifiedCompanies: 0,
    activeJobPostings: 0,
    applicationsToday: 0,
    applicationsThisWeek: 0,
    applicationsThisMonth: 0,
    successfulPlacements: 0,
    platformGrowthRate: 0,
    verifiedStudents: 0,
    unverifiedStudents: 0,
    unverifiedCompanies: 0,
    expiredJobs: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trendData, setTrendData] = useState<TrendData>({
    userRegistrationTrends: [],
    companyRegistrationTrends: [],
    jobPostingTrends: [],
    applicationTrends: [],
    jobCategories: [],
    applicationStatus: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("30");
  const [isExporting, setIsExporting] = useState(false);

  const { makeAuthenticatedRequest } = useAuthenticatedRequest();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Build URL parameters for date filtering
      const urlParams = new URLSearchParams();
      if (dateRange.start) {
        urlParams.append("startDate", dateRange.start.toISOString());
      }
      if (dateRange.end) {
        urlParams.append("endDate", dateRange.end.toISOString());
      }
      if (selectedTimeframe) {
        urlParams.append("days", selectedTimeframe);
      }

      // Fetch summary stats with date range parameters
      const summaryUrl = `/api/admin/analytics/summary?${urlParams.toString()}`;
      const summaryResponse = await makeAuthenticatedRequest(summaryUrl);
      const summaryData = await summaryResponse.json();

      if (summaryData.success) {
        setStats(summaryData.data);
        console.log(
          "Dashboard data fetched for time period:",
          selectedTimeframe,
          summaryData.data
        );
      } else {
        console.error("Summary API returned success: false", summaryData);
      }

      // Fetch accurate pending verifications count from dedicated API
      const pendingStatsResponse = await makeAuthenticatedRequest(
        "/api/admin/pending-verifications/stats"
      );
      const pendingStatsData = await pendingStatsResponse.json();

      if (pendingStatsData.success) {
        const actualPendingCount = pendingStatsData.data.overview.totalPending;

        // Update the stats with the more accurate pending count
        setStats((prevStats) => ({
          ...prevStats,
          pendingVerifications: actualPendingCount,
        }));
      } else {
        console.error(
          "Pending stats API returned success: false",
          pendingStatsData
        );
      }

      // Fetch recent activities
      const activitiesResponse = await makeAuthenticatedRequest(
        "/api/admin/analytics/activities?limit=10"
      );
      const activitiesData = await activitiesResponse.json();

      if (activitiesData.success) {
        setActivities(activitiesData.data.activities);
      }

      // Fetch trend data
      const days = Math.ceil(
        (dateRange.end.getTime() - dateRange.start.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const trendsResponse = await makeAuthenticatedRequest(
        `/api/admin/analytics/trends?days=${days}`
      );
      const trendsData = await trendsResponse.json();

      if (trendsData.success) {
        setTrendData(trendsData.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set some error state or show user-friendly message
    } finally {
      setLoading(false);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);

    let startDate: Date;
    const endDate = new Date();

    if (timeframe === "today") {
      // For today, start from beginning of today
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else {
      // For other timeframes, subtract days
      const days = parseInt(timeframe);
      startDate = subDays(new Date(), days);
    }

    setDateRange({
      start: startDate,
      end: endDate,
    });
  };

  // Handle export
  const handleExport = async (type: string, format: string = "csv") => {
    setIsExporting(true);
    try {
      const startDate = formatDate(dateRange.start, "yyyy-MM-dd");
      const endDate = formatDate(dateRange.end, "yyyy-MM-dd");

      const url = `/api/admin/analytics/export?type=${type}&format=${format}&startDate=${startDate}&endDate=${endDate}`;
      const response = await makeAuthenticatedRequest(url);

      if (format === "csv") {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${type}-report-${formatDate(
          new Date(),
          "yyyy-MM-dd"
        )}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        const data = await response.json();
        console.log("Export data:", data);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // Merge trend data for combined charts
  const combinedTrends = (): CombinedTrendPoint[] => {
    const dateMap = new Map();

    trendData.userRegistrationTrends.forEach((item) => {
      dateMap.set(item.date, {
        ...dateMap.get(item.date),
        date: item.date,
        students: item.students,
      });
    });

    trendData.companyRegistrationTrends.forEach((item) => {
      dateMap.set(item.date, {
        ...dateMap.get(item.date),
        date: item.date,
        companies: item.companies,
      });
    });

    trendData.jobPostingTrends.forEach((item) => {
      dateMap.set(item.date, {
        ...dateMap.get(item.date),
        date: item.date,
        jobs: item.jobs,
      });
    });

    trendData.applicationTrends.forEach((item) => {
      dateMap.set(item.date, {
        ...dateMap.get(item.date),
        date: item.date,
        applications: item.applications,
      });
    });

    return Array.from(dateMap.values())
      .map((item) => ({
        date: item.date,
        students: item.students || 0,
        companies: item.companies || 0,
        jobs: item.jobs || 0,
        applications: item.applications || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#6B7280",
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  // Refresh data manually
  const handleRefresh = () => {
    fetchDashboardData();
  };

  const statCards = [
    {
      title: "Total Registered Students",
      value: stats.totalRegisteredStudents,
      icon: <Users className="w-8 h-8 text-blue-600" />,
      change: `${stats.verifiedStudents}`,
      changeLabel: "verified",
      changeType: "positive",
      subtitle: `${stats.unverifiedStudents} pending verification`,
    },
    {
      title: "Total Verified Companies",
      value: stats.totalVerifiedCompanies,
      icon: <Building className="w-8 h-8 text-green-600" />,
      change: `${stats.unverifiedCompanies}`,
      changeLabel: "pending verification",
      changeType: stats.unverifiedCompanies > 5 ? "negative" : "positive",
      subtitle: `${stats.totalCompanies} total companies`,
    },
    {
      title: "Active Job Postings",
      value: stats.activeJobPostings,
      icon: <Briefcase className="w-8 h-8 text-purple-600" />,
      change: `+${stats.jobs24h}`,
      changeLabel: "posted today",
      changeType: "positive",
      subtitle: `${stats.expiredJobs} expired jobs`,
    },
    {
      title: "Applications Today",
      value: stats.applicationsToday,
      icon: <FileText className="w-8 h-8 text-orange-600" />,
      change: `${stats.applicationsThisWeek}`,
      changeLabel: "this week",
      changeType: "positive",
      subtitle: `${stats.applicationsThisMonth} this month`,
    },
    {
      title: "Successful Placements",
      value: stats.successfulPlacements,
      icon: <Award className="w-8 h-8 text-emerald-600" />,
      change: `${(
        (stats.successfulPlacements /
          Math.max(stats.applicationsThisMonth, 1)) *
        100
      ).toFixed(1)}%`,
      changeLabel: "success rate",
      changeType: "positive",
      subtitle: "Total hires & acceptances",
    },
    {
      title: "Platform Growth Rate",
      value: `${stats.platformGrowthRate}%`,
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      change: stats.platformGrowthRate > 0 ? "Growing" : "Stable",
      changeLabel: "30-day trend",
      changeType: stats.platformGrowthRate > 0 ? "positive" : "negative",
      subtitle: "Monthly user growth",
      isPercentage: true,
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: <Clock className="w-8 h-8 text-amber-600" />,
      change: `${stats.new24h}`,
      changeLabel: "new today",
      changeType: stats.pendingVerifications > 20 ? "negative" : "positive",
      subtitle: "Requires admin review",
    },
    {
      title: "Platform Activity",
      value: stats.dau,
      icon: <Zap className="w-8 h-8 text-cyan-600" />,
      change: `${stats.mau}`,
      changeLabel: "monthly active",
      changeType: "positive",
      subtitle: "Daily active users",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-64 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-96"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="animate-pulse">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-blue-100">
              Monitor and manage your Careerly platform efficiently
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Timeframe Selector */}
            <select
              value={selectedTimeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              style={{
                color: "white",
              }}
            >
              <option
                value="today"
                style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              >
                Today
              </option>
              <option
                value="7"
                style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              >
                Last 7 days
              </option>
              <option
                value="30"
                style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              >
                Last 30 days
              </option>
              <option
                value="90"
                style={{ color: "#1f2937", backgroundColor: "#ffffff" }}
              >
                Last 90 days
              </option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => handleExport("summary")}
                disabled={isExporting}
                className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? "Exporting..." : "Export"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">{card.icon}</div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                {card.isPercentage
                  ? card.value
                  : typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
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
                    {card.changeLabel}
                  </span>
                </div>
              </div>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Registration Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedTrends()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#3B82F6"
                name="Students"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="companies"
                stroke="#10B981"
                name="Companies"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Job Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Job Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trendData.jobCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }: any) =>
                  `${category} ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {trendData.jobCategories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={combinedTrends()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="jobs"
                stackId="1"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                name="Jobs Posted"
              />
              <Area
                type="monotone"
                dataKey="applications"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                name="Applications"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Application Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Application Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData.applicationStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity and Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <button
              onClick={() => handleExport("applications")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Export all →
            </button>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "user_registration"
                      ? "bg-blue-500"
                      : activity.type === "company_verification"
                      ? "bg-green-500"
                      : activity.type === "job_posting"
                      ? "bg-purple-500"
                      : activity.type === "application_submitted"
                      ? "bg-orange-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => onNavigateToTab?.("pending-verifications")}
              className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
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

            <button
              onClick={() => handleExport("users")}
              className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">
                  Export User Data
                </span>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => handleExport("companies")}
              className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">
                  Export Company Data
                </span>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => handleExport("jobs")}
              className="flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">
                  Export Job Data
                </span>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
