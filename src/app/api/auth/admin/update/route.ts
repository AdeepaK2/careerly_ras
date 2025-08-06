import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";
import { hashPassword } from "@/lib/auth/admin/password";
import connect from "@/utils/db";
import AdminModel from "@/lib/models/admin";

 function getBearerToken(req: NextRequest): string | null {
   const authHeader = req.headers.get("authorization");
   if (!authHeader) return null;
   const parts = authHeader.split(" ");
   if (parts[0].toLowerCase() !== "bearer" || !parts[1]) return null;
   return parts[1];
 }

export async function PUT(request: NextRequest) {
  try {
    await connect();

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
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Only superadmin can update admin accounts
    if (payload.role !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only superadmin can update admin accounts",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("id");

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Admin ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, email, role, password } = body;

    // Validation
    if (username && username.trim().length < 4) {
      return NextResponse.json(
        { success: false, message: "Username must be at least 4 characters" },
        { status: 400 }
      );
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email required" },
        { status: 400 }
      );
    }

    if (password && password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (role && !["admin", "superadmin"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if admin exists
    const existingAdmin = await AdminModel.findById(adminId).select(
      "username email role"
    );

    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Check if username is already taken (if changing username)
    if (username && username.trim() !== existingAdmin.username) {
      const usernameExists = await AdminModel.findOne({
        username: username.trim(),
        _id: { $ne: adminId },
      });
      if (usernameExists) {
        return NextResponse.json(
          { success: false, message: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Check if email is already taken (if changing email)
    if (email && email.trim() !== existingAdmin.email) {
      const emailExists = await AdminModel.findOne({
        email: email.trim(),
        _id: { $ne: adminId },
      });
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email already taken" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (username) updateData.username = username.trim();
    if (email) updateData.email = email.trim();
    if (role) updateData.role = role;
    if (password) updateData.password = await hashPassword(password);

    // Update the admin
    const updatedAdmin = await AdminModel.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, select: "username email role" }
    );

    return NextResponse.json({
      success: true,
      message: `Admin "${updatedAdmin.username}" updated successfully`,
      data: {
        id: updatedAdmin._id.toString(),
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
      },
    });
  } catch (error: any) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
