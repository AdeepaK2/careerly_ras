import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import AdminModel from "@/lib/models/admin";
import { comparePassword } from "@/lib/auth/admin/password";
import { generateAdminTokens } from "@/lib/auth/admin/jwt";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();

    if (!body.username || !body.password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    const { username, password } = body;

    const user = await AdminModel.findOne({
      username: username.toLowerCase().trim(),
    });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (user.isLocked) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
        },
        { status: 423 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    await user.resetLoginAttempts();

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateAdminTokens({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.addRefreshToken(refreshToken, refreshTokenExpiry);

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            username: user.username,
            role: user.role,
            lastLogin: user.lastLogin,
          },
          accessToken,
        },
      },
      { status: 200 }
    );

    response.cookies.set("admin_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("Admin login error:", error);
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
