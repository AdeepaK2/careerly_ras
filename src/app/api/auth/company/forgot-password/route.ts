import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import { generateCompanyPasswordResetToken } from "@/lib/auth/company/jwt";
import { sendEmail, emailTemplates } from "@/lib/services/emailService";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    
    if (!body.businessEmail) {
      return NextResponse.json({
        success: false,
        message: "Business email is required"
      }, { status: 400 });
    }
    
    const { businessEmail } = body;
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(businessEmail)) {
      return NextResponse.json({
        success: false,
        message: "Invalid email format"
      }, { status: 400 });
    }
    
    // Find company by email
    const company = await CompanyModel.findOne({ businessEmail });
    
    // Always return success message to prevent email enumeration attacks
    const successMessage = "If a company account with this email exists, you will receive a password reset link shortly.";
    
    if (!company) {
      // Return success message even if company doesn't exist
      return NextResponse.json({
        success: true,
        message: successMessage
      }, { status: 200 });
    }
    
    // Check if account is active
    if (!company.isActive) {
      return NextResponse.json({
        success: true,
        message: successMessage
      }, { status: 200 });
    }
    
    // Generate password reset token
    const resetToken = generateCompanyPasswordResetToken(
      company._id.toString(),
      company.businessEmail
    );
    
    // Save reset token and expiry to database
    company.passwordResetToken = resetToken;
    company.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await company.save();
    
    // Send password reset email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const resetLink = `${baseUrl}/auth/company/reset-password?token=${encodeURIComponent(resetToken)}`;
      
      console.log('Base URL:', baseUrl); // Debug log
      console.log('Reset link generated:', resetLink); // Debug log
      
      const emailTemplate = emailTemplates.passwordReset(company.companyName, resetLink);
      await sendEmail({
        to: company.businessEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue and return success to prevent revealing if email exists
    }
    
    return NextResponse.json({
      success: true,
      message: successMessage
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Forgot password error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
