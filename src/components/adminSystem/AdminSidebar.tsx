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

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin/logout", { method: "POST" });
    } catch {
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_access_token");
      }
      router.replace("/auth/admin/login");
    }
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    onCollapsedChange?.(next);
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
    ...(isSuperadmin
      ? [
          {
            id: "admin-management",
            label: "Admin Management",
            icon: <Shield className="w-5 h-5" />,
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
        { id: "admin-job-post", label: "Admin Job Post" },
        { id: "admin-posted-jobs", label: "Admin Posted Jobs" },
        { id: "all-jobs", label: "All Job Postings" },
        { id: "active-jobs", label: "Active Jobs" },
        { id: "expired-jobs", label: "Expired Jobs" },
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
    { id: "reports", label: "Reports", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div
      className={`bg-white text-gray-900 flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 border-r border-gray-200 ${
        isCollapsed ? "w-16" : "w-64"
      } z-50`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-purple-700">Careerly</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg hover:bg-purple-50 text-purple-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {sidebarItems.map((item) => {
          const hasSub = !!item.submenu;
          const isExpanded = hasSub && expandedMenus.includes(item.id);
          const isActiveTop = activeTab === item.id; // "active" for this item id

          // Parent button classes:
          // - If it has a submenu, never give bg; only text-purple when expanded/active.
          // - If it has no submenu (true top-level leaf), keep the purple bg on active.
          const parentBtnClasses = `w-full flex items-center px-4 py-3 text-left transition-colors ${
            hasSub
              ? isExpanded || isActiveTop
                ? "text-purple-700 hover:bg-purple-50"
                : "hover:bg-purple-50"
              : isActiveTop
              ? "bg-purple-100 border-r-2 border-purple-600 text-purple-700"
              : "hover:bg-purple-50"
          }`;

          const iconClasses = `flex-shrink-0 ${
            hasSub
              ? isExpanded || isActiveTop
                ? "text-purple-700"
                : "text-purple-600"
              : isActiveTop
              ? "text-purple-700"
              : "text-purple-600"
          }`;

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasSub) {
                    toggleSubmenu(item.id);
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={parentBtnClasses}
              >
                <span className={iconClasses}>{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="ml-3 flex-1">{item.label}</span>
                    {hasSub && (
                      <ChevronDown
                        className={`w-4 h-4 ${
                          isExpanded
                            ? "rotate-180 text-purple-700"
                            : "text-gray-400"
                        } transition-transform`}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              {hasSub && isExpanded && !isCollapsed && (
                <div className="bg-white">
                  {item.submenu!.map((subItem) => {
                    const subActive = activeTab === subItem.id;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => onTabChange(subItem.id)}
                        className={`w-full text-left px-8 py-2 text-sm transition-colors ${
                          subActive
                            ? "bg-purple-100 text-purple-700" // ✅ only child gets background
                            : "text-gray-600 hover:bg-purple-50"
                        }`}
                      >
                        {subItem.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {adminName.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{adminName}</p>
              <p className="text-xs text-gray-500">{adminEmail}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </div>
  );
}
