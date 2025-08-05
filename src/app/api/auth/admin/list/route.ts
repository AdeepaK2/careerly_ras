// src/app/api/auth/admin/list/route.ts

import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import AdminModel from "@/lib/models/admin";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";

function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts[0].toLowerCase() !== "bearer" || !parts[1]) return null;
  return parts[1];
}

// shape of each admin document after .lean()
type LeanAdmin = {
  _id: { toString(): string };
  username: string;
  email: string;                 // ← include email here
  role: "superadmin" | "admin";
  lastLogin?: Date;
  createdAt?: Date;
};

export async function GET(request: NextRequest) {
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

    // fetch admins (both admin and superadmin can list)
    const adminsRaw = await AdminModel.find(
      {},
      { password: 0, refreshTokens: 0, __v: 0 }
    )
      .sort({ createdAt: -1 })
      .lean<LeanAdmin[]>(); // now includes email

    const admins: LeanAdmin[] = Array.isArray(adminsRaw) ? adminsRaw : [];

    // sanitize output to client
    const sanitized = admins.map((a) => ({
      id: a._id.toString(),
      username: a.username,
      email: a.email,            // ← include email in response
      role: a.role,
      lastLogin: a.lastLogin,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ success: true, data: sanitized }, { status: 200 });
  } catch (error: any) {
    console.error("List admins error:", error);
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
