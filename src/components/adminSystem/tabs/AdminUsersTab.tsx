"use client";

import React, { useEffect, useState, FormEvent } from "react";
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Search,
  Filter,
  Plus,
} from "lucide-react";

/* -------------------- Types -------------------- */
type AdminRole = "superadmin" | "admin";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  createdAt?: string;
  createdBy?: string; // optional; shown if your API provides it
};

type ApiResponseList = {
  success: boolean;
  data?: AdminUser[];
  message?: string;
};

type ApiResponseCreate = {
  success: boolean;
  data?: {
    id: string;
    username: string;
    email: string;
    role: AdminRole;
  };
  message?: string;
};

type UpdateAdminPayload = {
  username: string;
  email: string;
  role: AdminRole;
  password?: string;
};

/* -------------- Helpers (JWT parsing) -------------- */
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/* =================== Component =================== */
export default function AdminUsersTab() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState<AdminUser | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<AdminRole>("admin");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editFormError, setEditFormError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");

  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_access_token")
      : null;
  const currentRole = accessToken
    ? (parseJwt(accessToken)?.role as AdminRole | null)
    : null;
  const isSuperadmin = currentRole === "superadmin";

  /* -------------------- Data fetch -------------------- */
  const fetchAdmins = async () => {
    if (!accessToken) return setError("Missing token");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/list", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body: ApiResponseList = await res.json();
      if (body.success && body.data) setAdmins(body.data);
      else setError(body.message || "Failed to load admins");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-clear banners
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  /* -------------------- Create -------------------- */
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) return setFormError("Only superadmin may create admins");
    if (newUsername.trim().length < 4)
      return setFormError("Username must be at least 4 characters");
    if (!/\S+@\S+\.\S+/.test(newEmail))
      return setFormError("Valid email required");
    if (newPassword.length < 8)
      return setFormError("Password must be ≥ 8 characters");

    setCreating(true);
    setFormError("");
    try {
      const res = await fetch("/api/auth/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          email: newEmail.trim(),
          password: newPassword,
          role: newRole,
        }),
      });
      const body: ApiResponseCreate = await res.json();
      if (body.success) {
        setSuccessMsg(`Admin "${body.data?.username}" created`);
        setNewUsername("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("admin");
        setShowPassword(false);
        fetchAdmins();
        setTimeout(() => setModalOpen(false), 800);
      } else {
        setFormError(body.message || "Creation failed");
      }
    } catch {
      setFormError("Network error");
    } finally {
      setCreating(false);
    }
  };

  /* -------------------- Delete -------------------- */
  const handleDelete = async () => {
    if (!adminToDelete) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/admin/delete?id=${adminToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await res.json();
      if (body.success) {
        setSuccessMsg(
          body.message ||
            `Admin "${adminToDelete.username}" deleted successfully`
        );
        fetchAdmins();
        setDeleteModalOpen(false);
        setAdminToDelete(null);
      } else {
        setError(body.message || "Failed to delete admin");
      }
    } catch {
      setError("Network error while deleting admin");
    } finally {
      setDeleting(false);
    }
  };

  /* -------------------- Edit -------------------- */
  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminToEdit) return;
    if (!isSuperadmin)
      return setEditFormError("Only superadmin may edit admins");
    if (editUsername.trim().length < 4)
      return setEditFormError("Username must be at least 4 characters");
    if (!/\S+@\S+\.\S+/.test(editEmail))
      return setEditFormError("Valid email required");
    if (editPassword && editPassword.length < 8)
      return setEditFormError(
        "Password must be ≥ 8 characters (leave empty to keep current)"
      );

    setUpdating(true);
    setEditFormError("");

    const updateData: UpdateAdminPayload = {
      username: editUsername.trim(),
      email: editEmail.trim(),
      role: editRole,
      ...(editPassword ? { password: editPassword } : {}),
    };

    try {
      const res = await fetch(`/api/auth/admin/update?id=${adminToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });
      const body = await res.json();
      if (body.success) {
        setSuccessMsg(
          body.message || `Admin "${editUsername}" updated successfully`
        );
        fetchAdmins();
        setEditModalOpen(false);
        setAdminToEdit(null);
        setEditUsername("");
        setEditEmail("");
        setEditRole("admin");
        setEditPassword("");
        setShowEditPassword(false);
      } else {
        setEditFormError(body.message || "Failed to update admin");
      }
    } catch {
      setEditFormError("Network error while updating admin");
    } finally {
      setUpdating(false);
    }
  };

  /* -------------------- Derived (filters) -------------------- */
  const filtered = admins.filter((a) => {
    const matchesRole = roleFilter === "all" ? true : a.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.username.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const roleBadge = (role: AdminRole) => (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1
      ${
        role === "superadmin"
          ? "bg-purple-50 text-purple-700 ring-purple-200"
          : "bg-blue-50 text-blue-700 ring-blue-200"
      }`}
    >
      <Shield
        className={`w-3.5 h-3.5 ${
          role === "superadmin" ? "text-purple-600" : "text-blue-600"
        }`}
      />
      {role === "superadmin" ? "Super Admin" : "Admin"}
    </span>
  );

  /* =================== UI =================== */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-purple-600" />
          <h2 className="text-3xl font-extrabold">Admin Management</h2>
        </div>
        <p className="text-gray-900 mt-1">
          Manage administrator accounts and permissions
        </p>
      </div>

      {/* Search / Filters / Create */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | AdminRole)}
            className="appearance-none bg-white pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            ▾
          </span>
        </div>

        {isSuperadmin && (
          <button
            onClick={() => {
              setSuccessMsg("");
              setFormError("");
              setNewPassword("");
              setShowPassword(false);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Admin
          </button>
        )}
      </div>

      {/* Banners */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-gray-900">Loading admins…</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-900">
                <th className="px-6 py-3">Admin</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-gray-100 hover:bg-purple-50/40 transition-colors"
                >
                  {/* Admin (username only) */}
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {a.username}
                  </td>

                  {/* Email in its own column */}
                  <td className="px-6 py-4 text-sm text-gray-600">{a.email}</td>

                  {/* Role badge */}
                  <td className="px-6 py-4">{roleBadge(a.role)}</td>

                  {/* Created */}
                  <td className="px-6 py-4">
                    <div className="text-gray-800">
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString()
                        : "—"}
                    </div>
                    {a.createdBy && (
                      <div className="text-xs text-gray-900">
                        by {a.createdBy}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setAdminToEdit(a);
                          setEditUsername(a.username);
                          setEditEmail(a.email);
                          setEditRole(a.role);
                          setEditPassword("");
                          setShowEditPassword(false);
                          setEditFormError("");
                          setEditModalOpen(true);
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-purple-50 text-purple-600"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      {isSuperadmin && (
                        <button
                          onClick={() => {
                            setAdminToDelete(a);
                            setDeleteModalOpen(true);
                            setError("");
                            setSuccessMsg("");
                          }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-red-50 text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-900"
                  >
                    No admins match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Create New Admin</h3>
            {formError && (
              <div className="mb-3 p-2 bg-red-50 text-red-700 rounded-lg">
                {formError}
              </div>
            )}
            {successMsg && (
              <div className="mb-3 p-2 bg-green-50 text-green-700 rounded-lg">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="At least 4 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && adminToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-2 text-red-600">
              Confirm Delete
            </h3>
            <p className="mb-4 text-gray-700">
              Delete admin <strong>{adminToDelete.username}</strong> (
              {adminToDelete.email})?
            </p>
            <p className="mb-6 text-sm text-red-600">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setAdminToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editModalOpen && adminToEdit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h=[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Edit Admin: {adminToEdit.username}
            </h3>

            {editFormError && (
              <div className="mb-3 p-2 bg-red-50 text-red-700 rounded-lg">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminRole)}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password (leave empty to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Min 8 characters or leave empty"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    tabIndex={-1}
                  >
                    {showEditPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setAdminToEdit(null);
                    setEditUsername("");
                    setEditEmail("");
                    setEditRole("admin");
                    setEditPassword("");
                    setShowEditPassword(false);
                    setEditFormError("");
                  }}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {updating ? "Updating…" : "Update Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
