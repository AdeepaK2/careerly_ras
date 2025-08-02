import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import { verifyCompanyPasswordResetToken } from "@/lib/auth/company/jwt";
import { hashPassword } from "@/lib/auth/company/password";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    
    if (!body.token || !body.password) {
      return NextResponse.json({
        success: false,
        message: "Reset token and new password are required"
      }, { status: 400 });
    }
    
    const { token, password } = body;
    
    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "Password must be at least 8 characters long"
      }, { status: 400 });
    }
    
    // Verify the reset token
    const decoded = verifyCompanyPasswordResetToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired reset token"
      }, { status: 400 });
    }
    
    // Find the company
    const company = await CompanyModel.findById(decoded.id);
    if (!company) {
      return NextResponse.json({
        success: false,
        message: "Company not found"
      }, { status: 404 });
    }
    
    // Check if email matches
    if (company.businessEmail !== decoded.email) {
      return NextResponse.json({
        success: false,
        message: "Password reset failed"
      }, { status: 400 });
    }
    
    // Check if token is still valid (not expired)
    if (company.passwordResetExpires && company.passwordResetExpires < new Date()) {
      return NextResponse.json({
        success: false,
        message: "Reset token has expired"
      }, { status: 400 });
    }
    
    // Check if the token matches what's stored in database
    if (company.passwordResetToken !== token) {
      return NextResponse.json({
        success: false,
        message: "Invalid reset token"
      }, { status: 400 });
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(password);
    
    // Update password and clear reset token
    company.password = hashedPassword;
    company.passwordResetToken = undefined;
    company.passwordResetExpires = undefined;
    
    // Reset login attempts
    await company.resetLoginAttempts();
    
    await company.save();
    
    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully"
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Reset password error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
