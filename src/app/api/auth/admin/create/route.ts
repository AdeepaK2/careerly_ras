// src/app/api/auth/admin/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import AdminModel from "@/lib/models/admin";
import { hashPassword } from "@/lib/auth/admin/password";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";

function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts[0].toLowerCase() !== "bearer" || !parts[1]) return null;
  return parts[1];
}

export async function POST(request: NextRequest) {
  try {
    await connect();

    // --- auth check ---
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing authorization token" },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = verifyAdminAccessToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (payload.role !== "superadmin") {
      return NextResponse.json(
        { success: false, message: "Forbidden: only superadmin can create admins" },
        { status: 403 }
      );
    }

    // --- parse & validate body ---
    const { username, email, password, role = "admin" } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Username, email and password are required" },
        { status: 400 }
      );
    }

    // simple email regex
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // check username & email uniqueness
    const exists = await AdminModel.findOne({
      $or: [
        { username: username.toLowerCase().trim() },
        { email: email.toLowerCase().trim() }
      ]
    });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "Username or email already taken" },
        { status: 409 }
      );
    }

    // --- create admin ---
    const hashed = await hashPassword(password);
    const newAdmin = new AdminModel({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),    // ← include email here
      password: hashed,
      role                                    // can be 'admin' or 'superadmin'
    });

    await newAdmin.save();

    return NextResponse.json(
      {
        success: true,
        message: "Admin created successfully",
        data: {
          id: newAdmin._id.toString(),
          username: newAdmin.username,
          email: newAdmin.email,
          role: newAdmin.role
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
