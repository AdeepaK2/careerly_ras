"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Define valid tab keys
export type TabKey = "home" | "jobPosting" | "selected" | "profile";

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  user: { companyName: string; isVerified: boolean };
}

export default function CompanyNavbar({
  activeTab,
  onTabChange,
  user,
}: NavbarProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "jobPosting", label: "Job Posting" },
    { key: "selected", label: "Selected" },
    { key: "profile", label: "Profile" },
  ];

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
    <nav className="glass-effect shadow-lg border-b border-white/20 sticky top-0 z-40 w-full">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Tabs */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-[#8243ff] mr-8">
              Careerly
            </span>
            {/* Desktop Tabs */}
            <ul className="hidden md:flex space-x-1 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
              {tabs.map(({ key, label }) => (
                <li key={key}>
                  <button
                    onClick={() => onTabChange(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === key
                        ? "bg-[#8243ff] text-white shadow-md"
                        : "text-gray-600 hover:text-[#8243ff] hover:bg-purple-50"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Profile Icon */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600 hover:text-[#8243ff] focus:outline-none mr-4"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <button
              className="focus:outline-none relative"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#8243ff] to-purple-600 rounded-full flex items-center justify-center text-white font-medium hover:shadow-lg transition-all duration-200">
                {user.companyName.charAt(0).toUpperCase()}
              </div>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/90 border-b border-gray-200 shadow-lg">
            <ul className="px-4 py-2 space-y-1">
              {tabs.map(({ key, label }) => (
                <li key={key}>
                  <button
                    onClick={() => {
                      onTabChange(key);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === key
                        ? "bg-[#8243ff] text-white"
                        : "text-gray-600 hover:bg-purple-50 hover:text-[#8243ff]"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
        {/* Profile Dropdown */}
        {isProfileMenuOpen && (
          <div className="absolute right-4 top-16 w-64 bg-white/90 border border-gray-200 rounded-lg shadow-xl z-50">
            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-800 font-semibold">
                {user.companyName}
              </p>
              <div className="mt-2">
                {user.isVerified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified Company
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-b-lg transition-all duration-200 flex items-center"
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
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
