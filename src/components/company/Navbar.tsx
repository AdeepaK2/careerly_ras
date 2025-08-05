"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

// Define valid tab keys
export type TabKey = "home" | "jobPosting" | "selected" | "profile" | "verification";

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

interface CompanyUser {
  id: string;
  companyName: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
}

export default function CompanyNavbar({ activeTab, onTabChange }: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<CompanyUser | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("company_accessToken") : null;
      if (!token) return;

      const response = await fetch("/api/auth/company/me", {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
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
    if (!user) return null;

    switch (user.verificationStatus) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'under_review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getVerificationStatusText = () => {
    if (!user) return '';

    switch (user.verificationStatus) {
      case 'approved':
        return 'Verified';
      case 'under_review':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
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
    <nav className="bg-white shadow mb-6 mt-6 rounded-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <ul className="flex space-x-4">
            {tabs.map(({ key, label }) => (
              <li key={key}>
                <button
                  onClick={() => onTabChange(key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === key
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {key === "verification" && getVerificationStatusIcon()}
                  {label}
                  {key === "verification" && user && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.verificationStatus === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : user.verificationStatus === 'under_review'
                        ? 'bg-yellow-100 text-yellow-700'
                        : user.verificationStatus === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {getVerificationStatusText()}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{user.companyName}</span>
                {getVerificationStatusIcon()}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition duration-200 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
