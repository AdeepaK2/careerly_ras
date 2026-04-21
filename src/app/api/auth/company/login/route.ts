import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import { comparePassword } from "@/lib/auth/company/password";
import {
  generateCompanyTokens,
  generateCompanyEmailVerificationToken,
} from "@/lib/auth/company/jwt";
import { sendEmail, emailTemplates } from "@/lib/services/emailService";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    
    // Basic validation
    if (!body.businessEmail || !body.password) {
      return NextResponse.json({
        success: false,
        message: "Business email and password are required"
      }, { status: 400 });
    }
    
    const businessEmail = String(body.businessEmail).trim().toLowerCase();
    const { password } = body;
    
    // Find company
    const company = await CompanyModel.findOne({ businessEmail });
    if (!company) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password"
      }, { status: 401 });
    }
    
    // Check if account is locked
    if (company.isLocked) {
      return NextResponse.json({
        success: false,
        message: "Account is temporarily locked due to multiple failed login attempts. Please try again later."
      }, { status: 423 });
    }
    
    // Check if account is active
    if (!company.isActive) {
      return NextResponse.json({
        success: false,
        message: "Account has been deactivated. Please contact support."
      }, { status: 403 });
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, company.password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await company.incrementLoginAttempts();
      
      return NextResponse.json({
        success: false,
        message: "Invalid email or password"
      }, { status: 401 });
    }
    
    // Reset login attempts on successful login
    await company.resetLoginAttempts();

    // If email is not verified, generate and send a fresh verification link
    if (!company.isEmailVerified) {
      const verificationToken = generateCompanyEmailVerificationToken(
        company._id.toString(),
        company.businessEmail
      );

      company.emailVerificationToken = verificationToken;
      company.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await company.save();

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const verificationLink = `${baseUrl}/auth/company/verify-email?token=${verificationToken}`;
        const emailTemplate = emailTemplates.verification(
          company.companyName,
          verificationLink
        );

        await sendEmail({
          to: company.businessEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      } catch (emailError) {
        console.error("Failed to send company verification email:", emailError);

        return NextResponse.json({
          success: false,
          message: "Please verify your email address before logging in. We could not send a new verification link right now. Please try again later.",
        }, { status: 500 });
      }

      return NextResponse.json({
        success: false,
        message: "Please verify your email address before logging in. Check your email for the verification link.",
      }, { status: 403 });
    }
    
    // Update last login
    company.lastLogin = new Date();
    await company.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateCompanyTokens({
      id: company._id.toString(),
      registrationNumber: company.registrationNumber,
      businessEmail: company.businessEmail,
      companyName: company.companyName,
      isVerified: company.isVerified,
      type: 'company'
    });
    
    // Add refresh token to company
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await company.addRefreshToken(refreshToken, refreshTokenExpiry);
    
    // Set secure HTTP-only cookie for refresh token
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: company._id,
          companyName: company.companyName,
          registrationNumber: company.registrationNumber,
          businessEmail: company.businessEmail,
          phoneNumber: company.phoneNumber,
          industry: company.industry,
          companySize: company.companySize,
          foundedYear: company.foundedYear,
          address: company.address,
          description: company.description,
          website: company.website,
          contactPerson: company.contactPerson,
          isEmailVerified: company.isEmailVerified,
          isVerified: company.isVerified,
          verificationStatus: company.verificationStatus,
          isActive: company.isActive,
          logoUrl: company.logoUrl,
          jobPostingLimits: company.jobPostingLimits,
          lastLogin: company.lastLogin
        },
        accessToken
      }
    }, { status: 200 });
    
    // Set refresh token as HTTP-only cookie
    response.cookies.set('company_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    return response;
    
  } catch (error: any) {
    console.error("Company login error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
