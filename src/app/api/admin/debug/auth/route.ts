import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";

export async function GET(request: NextRequest) {
  try {
    // Check if token exists
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
          debug: "Authorization header missing",
        },
        { status: 401 }
      );
    }

    // Try to verify token
    try {
      const admin = verifyAdminAccessToken(token);
      if (!admin) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid token",
            debug: "Token verification failed",
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        admin: admin,
        debug: "Token is valid",
      });
    } catch (tokenError) {
      return NextResponse.json(
        {
          success: false,
          error: "Token verification error",
          debug:
            tokenError instanceof Error
              ? tokenError.message
              : "Unknown token error",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        debug: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
