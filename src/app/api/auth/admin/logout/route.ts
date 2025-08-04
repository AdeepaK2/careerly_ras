import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import AdminModel from "@/lib/models/admin";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const refreshToken = request.cookies.get("admin_refresh_token")?.value;

    if (refreshToken) {
      await AdminModel.updateMany(
        { "refreshTokens.token": refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully"
      },
      { status: 200 }
    );

    response.cookies.set("admin_refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0
    });

    return response;
  } catch (error: any) {
    console.error("Admin logout error:", error);
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
