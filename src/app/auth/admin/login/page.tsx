"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Shield } from "lucide-react";

// Reuse the same parseJwt helper logic used elsewhere in the app
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

type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      role: "superadmin" | "admin";
      lastLogin?: string;
    };
    accessToken?: string;
  };
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirect already-authenticated admins away from the login page
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("admin_access_token")
          : null;

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      const payload = parseJwt(token);
      const exp = (payload as any)?.exp as number | undefined;

      if (!exp) {
        setIsCheckingAuth(false);
        return;
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (exp > nowInSeconds) {
        // Valid token - redirect immediately
        router.replace("/admin");
        return;
      }

      // Token expired - show login form
      setIsCheckingAuth(false);
    };

    checkAuthAndRedirect();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const result: LoginResponse = await res.json();

      if (result.success) {
        if (result.data?.accessToken) {
          localStorage.setItem("admin_access_token", result.data.accessToken);
        }
        router.push("/admin");
      } else {
        setError(result.message || "Login failed");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-purple-600/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-purple-600" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-b-transparent" />
            <span className="text-gray-600">Checking authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar: brand left, back link right */}
      <div className="mx-auto max-w-7xl px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-purple-600/20 flex items-center justify-center">
            <span className="font-bold text-purple-700">C</span>
          </div>
          <span className="text-lg font-semibold text-purple-700">
            Careerly
          </span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Centered card */}
      <div className="mx-auto max-w-md px-6 py-10">
        <div className="bg-white shadow-md rounded-2xl px-8 py-10 border border-gray-100">
          {/* Icon bubble + title */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-purple-600/10 flex items-center justify-center">
              <Shield className="h-7 w-7 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Portal</h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Sign in to access the admin dashboard
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-gray-800"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="admin"
                autoComplete="username"
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-800"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-label="Password"
                  className="h-11 w-full rounded-md border border-gray-300 px-3 pr-10 text-gray-900 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-2 flex items-center justify-center p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-purple-600 px-4 py-3 text-white font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-60 transition"
            >
              {loading && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
              )}
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-5 text-center text-sm text-gray-600">
            <p>
              Not an admin?{" "}
              <Link href="/auth" className="text-purple-700 hover:underline">
                Choose user type
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
