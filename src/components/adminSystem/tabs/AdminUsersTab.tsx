"use client";

import { useEffect, useState, FormEvent } from "react";
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: "superadmin" | "admin";
  lastLogin?: string;
  createdAt?: string;
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
    role: string;
  };
  message?: string;
};

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

export default function AdminUsersTab() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  // form state
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState<"admin" | "superadmin">("admin");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState<AdminUser | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "superadmin">("admin");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editFormError, setEditFormError] = useState("");
  const [updating, setUpdating] = useState(false);

  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_access_token")
      : null;
  const currentRole = accessToken
    ? (parseJwt(accessToken)?.role as string)
    : null;
  const isSuperadmin = currentRole === "superadmin";

  // fetch list
  const fetchAdmins = async () => {
    if (!accessToken) return setError("Missing token");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/list", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body: ApiResponseList = await res.json();
      if (body.success && body.data) setAdmins(body.data);
      else setError(body.message || "Failed to load");
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

  // Auto-clear success/error messages after 5 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // create handler
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) return setFormError("Only superadmin may create admins");
    if (newUsername.length < 4)
      return setFormError("Username must be at least 4 chars");
    if (!/\S+@\S+\.\S+/.test(newEmail))
      return setFormError("Valid email required");
    if (newPassword.length < 8)
      return setFormError("Password must be ≥8 chars");

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
        setSuccessMsg(`Admin "${body.data?.username}" created!`);
        setNewUsername("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("admin");
        setShowPassword(false);
        fetchAdmins();
        setTimeout(() => setModalOpen(false), 1000);
      } else {
        setFormError(body.message || "Creation failed");
      }
    } catch {
      setFormError("Network error");
    } finally {
      setCreating(false);
    }
  };

  // delete handler
  const handleDelete = async () => {
    if (!adminToDelete) return;

    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/admin/delete?id=${adminToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const body = await res.json();
      if (body.success) {
        setSuccessMsg(
          body.message ||
            `Admin "${adminToDelete.username}" deleted successfully`
        );
        fetchAdmins(); // Refresh the list
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

  // edit handler
  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminToEdit) return;

    if (!isSuperadmin) {
      return setEditFormError("Only superadmin may edit admins");
    }

    if (editUsername.length < 4) {
      return setEditFormError("Username must be at least 4 chars");
    }

    if (!/\S+@\S+\.\S+/.test(editEmail)) {
      return setEditFormError("Valid email required");
    }

    if (editPassword && editPassword.length < 8) {
      return setEditFormError(
        "Password must be ≥8 chars (leave empty to keep current)"
      );
    }

    setUpdating(true);
    setEditFormError("");
    try {
      const updateData: any = {
        username: editUsername.trim(),
        email: editEmail.trim(),
        role: editRole,
      };

      // Only include password if it's being changed
      if (editPassword) {
        updateData.password = editPassword;
      }

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
        fetchAdmins(); // Refresh the list
        setEditModalOpen(false);
        setAdminToEdit(null);
        // Clear edit form
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

  return (
    <div className="space-y-6">
      {/* Header with Create button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Admin Management</h2>
        {isSuperadmin && (
          <button
            onClick={() => {
              setSuccessMsg("");
              setFormError("");
              setNewPassword("");
              setShowPassword(false);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Create Admin
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow rounded p-6 overflow-x-auto">
        {loading ? (
          <p>Loading admins…</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="pb-2">Username</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Last Login</th>
                <th className="pb-2">Created</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t odd:bg-gray-50">
                  <td className="py-2">{a.username}</td>
                  <td className="py-2">{a.email}</td>
                  <td className="py-2 capitalize">{a.role}</td>
                  <td className="py-2">
                    {a.lastLogin ? new Date(a.lastLogin).toLocaleString() : "—"}
                  </td>
                  <td className="py-2">
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-2 flex space-x-4">
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
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </button>

                    {isSuperadmin && (
                      <button
                        onClick={() => {
                          setAdminToDelete(a);
                          setDeleteModalOpen(true);
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Create New Admin</h3>
            {formError && (
              <div className="mb-2 p-2 bg-red-50 text-red-700 rounded">
                {formError}
              </div>
            )}
            {successMsg && (
              <div className="mb-2 p-2 bg-green-50 text-green-700 rounded">
                {successMsg}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="At least 4 characters"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="admin@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded pr-10"
                    placeholder="Min 8 chars"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
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

              {/* Role */}
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 border rounded"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              Confirm Delete
            </h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete the admin account:{" "}
              <strong>{adminToDelete.username}</strong> ({adminToDelete.email})?
            </p>
            <p className="mb-6 text-sm text-red-600">
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setAdminToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editModalOpen && adminToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Edit Admin: {adminToEdit.username}
            </h3>
            {editFormError && (
              <div className="mb-2 p-2 bg-red-50 text-red-700 rounded">
                {editFormError}
              </div>
            )}
            <form onSubmit={handleEdit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="At least 4 characters"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="admin@example.com"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 border rounded"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password (leave empty to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded pr-10"
                    placeholder="Min 8 chars or leave empty"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword((v) => !v)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
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

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
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
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
