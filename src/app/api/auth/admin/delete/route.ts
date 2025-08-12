import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";
import connect from "@/utils/db";
import AdminModel from "@/lib/models/admin";

function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.replace("Bearer ", "");
}

export async function DELETE(request: NextRequest) {
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

    // Only superadmin can delete admin accounts
    if (payload.role !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only superadmin can delete admin accounts",
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

    // Prevent self-deletion
    if (payload.id === adminId) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if admin exists and get their info
    const existingAdmin = await AdminModel.findById(adminId).select(
      "username role"
    );

    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Delete the admin
    await AdminModel.findByIdAndDelete(adminId);

    return NextResponse.json({
      success: true,
      message: `Admin "${existingAdmin.username}" deleted successfully`,
    });
  } catch (error: any) {
    console.error("Delete admin error:", error);
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
