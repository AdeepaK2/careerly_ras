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

    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ success: false, message: "Missing authorization token" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAdminAccessToken(token);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    if (payload.role !== "superadmin") {
      return NextResponse.json({ success: false, message: "Forbidden: only superadmin can create admins" }, { status: 403 });
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 });
    }

    const existing = await AdminModel.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ success: false, message: "Username already taken" }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const newAdmin = new AdminModel({
      username: username.toLowerCase().trim(),
      password: hashed,
      role: "admin"
    });

    await newAdmin.save();

    return NextResponse.json(
      {
        success: true,
        message: "Admin created successfully",
        data: {
          id: newAdmin._id,
          username: newAdmin.username,
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
