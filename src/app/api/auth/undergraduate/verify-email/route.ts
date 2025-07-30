import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import { verifyEmailVerificationToken, generateEmailVerificationToken } from "@/lib/auth/undergraduate/jwt";
import { sendEmail, emailTemplates } from "@/lib/services/emailService";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Verification token is required"
      }, { status: 400 });
    }
    
    // Verify the email verification token
    const tokenVerification = verifyEmailVerificationToken(token);
    if (!tokenVerification.valid || !tokenVerification.payload) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired verification token"
      }, { status: 400 });
    }
    
    // Find user and check if token matches
    const user = await UndergradModel.findOne({
      _id: tokenVerification.payload.id,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Invalid verification token or token has expired"
      }, { status: 400 });
    }
    
    // Mark user as verified and clear verification token
    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now access all features."
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Resend verification email
export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    const { universityEmail } = body;
    
    if (!universityEmail) {
      return NextResponse.json({
        success: false,
        message: "University email is required"
      }, { status: 400 });
    }
    
    // Find user
    const user = await UndergradModel.findOne({ universityEmail });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }
    
    if (user.isVerified) {
      return NextResponse.json({
        success: false,
        message: "Email is already verified"
      }, { status: 400 });
    }
    
    // Import email service
    const { sendEmail, emailTemplates } = await import('@/lib/services/emailService');
    
    // Generate new verification token
    const verificationToken = generateEmailVerificationToken(
      user._id.toString(),
      user.universityEmail
    );
    
    // Update user with new verification token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();
    
    // Create verification link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/auth/verify-email?token=${verificationToken}`;
    
    // Send verification email
    const emailTemplate = emailTemplates.verification(user.name, verificationLink);
    const emailResult = await sendEmail({
      to: user.universityEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });
    
    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Verification email sent successfully. Please check your university email."
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: "Failed to send verification email. Please try again."
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
