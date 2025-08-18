"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  Briefcase,
  BarChart3,
  Settings,
  FileText,
  Menu,
  LogOut,
  ChevronDown,
  CheckCircle,
} from "lucide-react";

// simple JWT decode to pull out role
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const json = atob(padded);
    return JSON.parse(
      decodeURIComponent(
        json
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
  } catch {
    return null;
  }
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  submenu?: { id: string; label: string }[];
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  onCollapsedChange,
}: AdminSidebarProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [adminName, setAdminName] = useState<string>("");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  // on mount, determine role
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_access_token")
        : null;
    const payload = token ? parseJwt(token) : null;
    setIsSuperadmin(payload?.role === "superadmin");
    if (payload?.username) setAdminName(payload.username);
    if (payload?.email) setAdminEmail(payload.email);
  }, []);

  // Add custom CSS for hiding scrollbar
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;  /* Internet Explorer 10+ */
        scrollbar-width: none;  /* Firefox */
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;  /* Safari and Chrome */
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Best effort: call server to revoke refresh token cookie
      await fetch("/api/auth/admin/logout", { method: "POST" });
    } catch {
      // ignore network errors
    } finally {
      // Always clear access token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_access_token");
      }
      router.replace("/auth/admin/login");
    }
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsedState);
    }
  };

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: "users",
      label: "User Management",
      icon: <Users className="w-5 h-5" />,
      submenu: [
        { id: "undergraduate-users", label: "Undergraduate Students" },
        { id: "company-users", label: "Companies" },
      ],
    },
    // Only show Admin Management for superadmins
    ...(isSuperadmin
      ? [
          {
            id: "admin-management",
            label: "Admin Management",
            icon: <Shield className="w-5 h-5" />,
            submenu: [{ id: "admin-users", label: "Admin Users" }],
          },
        ]
      : []),
    {
      id: "verification",
      label: "Verification Center",
      icon: <CheckCircle className="w-5 h-5" />,
      submenu: [
        { id: "pending-verifications", label: "Pending Verifications" },
        { id: "verified-accounts", label: "Verified Accounts" },
      ],
    },
    {
      id: "jobs",
      label: "Job Management",
      icon: <Briefcase className="w-5 h-5" />,
      submenu: [
        { id: "all-jobs", label: "All Job Postings" },
        { id: "active-jobs", label: "Active Jobs" },
        { id: "expired-jobs", label: "Expired Jobs" },
        { id: "reported-jobs", label: "Reported Jobs" },
      ],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      submenu: [
        { id: "user-analytics", label: "User Analytics" },
        { id: "job-analytics", label: "Job Analytics" },
        { id: "system-analytics", label: "System Analytics" },
      ],
    },
    {
      id: "settings",
      label: "System Settings",
      icon: <Settings className="w-5 h-5" />,
      submenu: [
        { id: "general-settings", label: "General Settings" },
        { id: "email-settings", label: "Email Settings" },
        { id: "security-settings", label: "Security Settings" },
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <div
      className={`bg-gray-900 text-white flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } z-50`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-blue-400">Careerly</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {sidebarItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => {
                if (item.submenu) {
                  toggleSubmenu(item.id);
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
                activeTab === item.id ||
                (item.submenu && expandedMenus.includes(item.id))
                  ? "bg-gray-800 border-r-2 border-blue-400"
                  : ""
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="ml-3 flex-1">{item.label}</span>
                  {item.submenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedMenus.includes(item.id) ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </>
              )}
            </button>

            {/* Submenu */}
            {item.submenu &&
              expandedMenus.includes(item.id) &&
              !isCollapsed && (
                <div className="bg-gray-800">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onTabChange(subItem.id)}
                      className={`w-full text-left px-8 py-2 text-sm hover:bg-gray-700 transition-colors ${
                        activeTab === subItem.id
                          ? "bg-gray-700 text-blue-400"
                          : "text-gray-300"
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {adminName.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{adminName}</p>
              <p className="text-xs text-gray-400">{adminEmail}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </div>
  );
}
