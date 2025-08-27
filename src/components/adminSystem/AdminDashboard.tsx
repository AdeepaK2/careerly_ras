"use client";

import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/adminSystem/AdminSidebar";
import DashboardTab from "@/components/adminSystem/tabs/DashboardTab";
import UndergraduateUsersTab from "@/components/adminSystem/tabs/UndergraduateUsersTab";
import CompanyUsersTab from "@/components/adminSystem/tabs/CompanyUsersTab";
import AdminUsersTab from "@/components/adminSystem/tabs/AdminUsersTab";
import PendingVerificationsTab from "@/components/adminSystem/tabs/PendingVerificationsTab";
import VerifiedAccountsTab from "@/components/adminSystem/tabs/VerifiedAccountsTab";
import AdminJobPostTab from "@/components/adminSystem/tabs/AdminJobPostTab";
import AdminPostedJobsTab from "@/components/adminSystem/tabs/AdminPostedJobsTab";
import AllJobsTab from "@/components/adminSystem/tabs/AllJobsTab";
import ActiveJobsTab from "@/components/adminSystem/tabs/ActiveJobsTab";
import ExpiredJobsTab from "@/components/adminSystem/tabs/ExpiredJobsTab";
import ReportedJobsTab from "@/components/adminSystem/tabs/ReportedJobsTab";
import GeneralSettingsTab from "@/components/adminSystem/tabs/GeneralSettingsTab";
import EmailSettingsTab from "@/components/adminSystem/tabs/EmailSettingsTab";
import SecuritySettingsTab from "@/components/adminSystem/tabs/SecuritySettingsTab";
import ReportsTab from "@/components/adminSystem/tabs/ReportsTab";
import { parseJwt } from "@/utils/jwt-client";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const router = useRouter();

  // on mount, determine role
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_access_token")
        : null;
    const payload = token ? parseJwt(token) : null;
    setIsSuperadmin(payload?.role === "superadmin");
  }, []);

  // client-side auth guard: redirect to login if no valid token
  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      router.replace("/auth/admin/login");
      return;
    }
    try {
      const payload = parseJwt(token);
      const now = Math.floor(Date.now() / 1000);
      if (!payload?.exp || payload.exp <= now) {
        throw new Error("expired");
      }
    } catch {
      localStorage.removeItem("admin_access_token");
      router.replace("/auth/admin/login");
    }
  }, [router]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;

      case "undergraduate-users":
        return <UndergraduateUsersTab />;

      case "company-users":
        return <CompanyUsersTab />;

      case "admin-users":
        // guard: only superadmins get this, redirect regular admins to dashboard
        if (!isSuperadmin) {
          setActiveTab("dashboard");
          return <DashboardTab />;
        }
        return <AdminUsersTab />;

      case "admin-management":
        // guard: only superadmins get this, redirect regular admins to dashboard
        if (!isSuperadmin) {
          setActiveTab("dashboard");
          return <DashboardTab />;
        }
        return <AdminUsersTab />;

      case "pending-verifications":
        return <PendingVerificationsTab />;

      case "verified-accounts":
        return <VerifiedAccountsTab />;

      case "admin-job-post":
        return <AdminJobPostTab />;

      case "admin-posted-jobs":
        return <AdminPostedJobsTab />;

      case "all-jobs":
        return <AllJobsTab />;

      case "active-jobs":
        return <ActiveJobsTab />;

      case "expired-jobs":
        return <ExpiredJobsTab />;

      case "reported-jobs":
        return <ReportedJobsTab />;

      case "general-settings":
        return <GeneralSettingsTab />;

      case "email-settings":
        return <EmailSettingsTab />;

      case "security-settings":
        return <SecuritySettingsTab />;

      case "reports":
        return <ReportsTab />;

      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage your Careerly platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="w-6 h-6" />
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
                <span
                  className="absolute top-0 right-0 inline-flex items-center justify-center 
                                 px-2 py-1 text-xs font-bold leading-none text-white 
                                 transform translate-x-1/2 -translate-y-1/2 
                                 bg-red-600 rounded-full"
                >
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">{renderActiveTab()}</main>
      </div>
    </div>
  );
}
