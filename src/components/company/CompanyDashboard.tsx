"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/Navbar";
import HomeTab from "@/components/company/tabs/HomeTab";
import JobPostingTab from "@/components/company/tabs/JobPostingTab";
import SelectedTab from "@/components/company/tabs/SelectedTab";
import ProfileTab from "@/components/company/tabs/ProfileTab";

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

export default function CompanyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<CompanyUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Tab state for navigation
  type TabKey = "home" | "jobPosting" | "selected" | "profile";
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("company_accessToken")
          : null;
      if (!token) {
        router.push("/auth/company/login");
        return;
      }
      const response = await fetch("/api/auth/company/me", {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        router.push("/auth/company/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/auth/company/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/company/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== "undefined")
        localStorage.removeItem("company_accessToken");
      router.push("/auth/company/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CompanyNavbar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="mt-6">
          {activeTab === "home" && <HomeTab />}
          {activeTab === "jobPosting" && <JobPostingTab />}
          {activeTab === "selected" && <SelectedTab />}
          {activeTab === "profile" && <ProfileTab />}
        </main>
      </div>
    </div>
  );
}
