"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/Navbar";
import VerificationBanner from "@/components/company/VerificationBanner";
import HomeTab from "@/components/company/tabs/HomeTab";
import JobPostingTab from "@/components/company/tabs/JobPostingTab";
import SelectedTab from "@/components/company/tabs/SelectedTab";
import ShortlistTab from "@/components/company/tabs/ShortlistTab";
import ProfileTab from "@/components/company/tabs/ProfileTab";
import VerificationTab from "@/components/company/tabs/VerificationTab";

interface CompanyUser {
  id: string;
  companyName: string;
  registrationNumber: string;
  businessEmail: string;
  phoneNumber: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  isEmailVerified: boolean;
  isVerified: boolean;
  verificationStatus: "pending" | "under_review" | "approved" | "rejected";
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
  type TabKey =
    | "home"
    | "jobPosting"
    | "selected"
    | "shortlist"
    | "profile"
    | "verification";
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      <div className="relative z-10">
        <CompanyNavbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={{ companyName: user.companyName, isVerified: user.isVerified }}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "home" && <HomeTab />}
          {activeTab === "jobPosting" && <JobPostingTab />}
          {activeTab === "selected" && <SelectedTab />}
          {activeTab === "shortlist" && <ShortlistTab />}
          {activeTab === "verification" && <VerificationTab />}
          {activeTab === "profile" && <ProfileTab />}
        </main>
      </div>
    </div>
  );
}
