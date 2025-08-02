"use client";

import React from "react";
import { useRouter } from "next/navigation";

// Define valid tab keys
export type TabKey = "home" | "jobPosting" | "selected" | "profile";

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function CompanyNavbar({ activeTab, onTabChange }: NavbarProps) {
  const router = useRouter();

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
    <nav className="bg-white shadow mb-6 mt-6 rounded-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <ul className="flex space-x-4">
            {tabs.map(({ key, label }) => (
              <li key={key}>
                <button
                  onClick={() => onTabChange(key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === key
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
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
    </nav>
  );
}
