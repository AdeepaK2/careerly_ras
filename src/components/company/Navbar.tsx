"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Menu,
  X as CloseIcon,
  User,
  LogOut,
  Settings,
} from "lucide-react";

// Define valid tab keys
export type TabKey =
  | "home"
  | "jobPosting"
  | "selected"
  | "profile"
  | "verification";

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  user: { companyName: string; isVerified: boolean };
}

interface CompanyUser {
  id: string;
  companyName: string;
  isVerified: boolean;
  verificationStatus: "pending" | "under_review" | "approved" | "rejected";
}

export default function CompanyNavbar({ activeTab, onTabChange }: NavbarProps) {
  const router = useRouter();
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("company_accessToken")
          : null;
      if (!token) return;

      const response = await fetch("/api/auth/company/me", {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyUser(data.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "jobPosting", label: "Job Posting" },
    { key: "selected", label: "Selected" },
    { key: "verification", label: "Verification" },
    { key: "profile", label: "Profile" },
  ];

  const getVerificationStatusIcon = () => {
    if (!companyUser) return null;

    switch (companyUser.verificationStatus) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "under_review":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getVerificationStatusText = () => {
    if (!companyUser) return "";

    switch (companyUser.verificationStatus) {
      case "approved":
        return "Verified";
      case "under_review":
        return "Under Review";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("company_accessToken");
      }
      router.push("/auth/company/login");
    }
  };

  return (
    <nav className="bg-white shadow-md mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-lg font-semibold gradient-text">Careerly</h1>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            {isMenuOpen ? (
              <CloseIcon className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          {/* Desktop menu */}
          <ul className="hidden md:flex space-x-4">
            {tabs.map(({ key, label }) => (
              <li key={key}>
                <button
                  onClick={() => onTabChange(key)}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === key
                      ? "text-[var(--primary)] border-b-2 border-[var(--primary)] font-semibold"
                      : "text-gray-700 hover:text-[var(--primary)]"
                  }`}
                >
                  {key === "verification" && getVerificationStatusIcon()}
                  {label}
                  {/* Verification badge unchanged */}
                  {key === "verification" && companyUser && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        companyUser.verificationStatus === "approved"
                          ? "bg-green-100 text-green-700"
                          : companyUser.verificationStatus === "under_review"
                          ? "bg-yellow-100 text-yellow-700"
                          : companyUser.verificationStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {getVerificationStatusText()}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                {companyUser && (
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {companyUser.companyName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {getVerificationStatusIcon()}
                      {getVerificationStatusText()}
                    </div>
                  </div>
                )}
              </button>

              {/* Profile dropdown menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {companyUser?.companyName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          {getVerificationStatusIcon()}
                          {getVerificationStatusText()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        onTabChange("profile");
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <Settings className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        onTabChange("verification");
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verification Status
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Mobile menu items */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-inner px-4 py-2">
            <ul className="space-y-2">
              {tabs.map(({ key, label }) => (
                <li key={key}>
                  <button
                    onClick={() => {
                      onTabChange(key);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm font-medium rounded ${
                      activeTab === key
                        ? "bg-[var(--primary)] text-white"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
