import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import { generatePasswordResetToken } from "@/lib/auth/undergraduate/jwt";
import { sendEmail, emailTemplates } from "@/lib/services/emailService";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();

    if (!body.universityEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "University email is required",
        },
        { status: 400 }
      );
    }

    const universityEmail = String(body.universityEmail).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(universityEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    const user = await UndergradModel.findOne({ universityEmail });

    // Prevent email enumeration
    const successMessage =
      "If an undergraduate account with this email exists, you will receive a password reset link shortly.";

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: successMessage,
        },
        { status: 200 }
      );
    }

    const resetToken = generatePasswordResetToken(
      user._id.toString(),
      user.universityEmail
    );

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const resetLink = `${baseUrl}/auth/undergrad/reset-password?token=${encodeURIComponent(
        resetToken
      )}`;

      const emailTemplate = emailTemplates.passwordReset(user.name, resetLink);
      await sendEmail({
        to: user.universityEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      console.error("Failed to send undergrad password reset email:", emailError);
      // Intentionally continue returning success to avoid enumeration and UX leakage
    }

    return NextResponse.json(
      {
        success: true,
        message: successMessage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Undergrad forgot password error:", error);

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
