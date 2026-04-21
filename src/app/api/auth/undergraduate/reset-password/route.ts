import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import { verifyPasswordResetToken } from "@/lib/auth/undergraduate/jwt";
import { hashPassword } from "@/lib/auth/undergraduate/password";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();

    if (!body.token || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token and new password are required",
        },
        { status: 400 }
      );
    }

    const token = String(body.token);
    const password = String(body.password);

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    const tokenVerification = verifyPasswordResetToken(token);
    if (!tokenVerification.valid || !tokenVerification.payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset token",
        },
        { status: 400 }
      );
    }

    const user = await UndergradModel.findById(tokenVerification.payload.id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.universityEmail !== tokenVerification.payload.universityEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Password reset failed",
        },
        { status: 400 }
      );
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token has expired",
        },
        { status: 400 }
      );
    }

    if (user.passwordResetToken !== token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reset token",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.resetLoginAttempts();
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password has been reset successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Undergrad reset password error:", error);

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
