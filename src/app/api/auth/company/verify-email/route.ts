import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import { verifyCompanyEmailVerificationToken } from "@/lib/auth/company/jwt";

// Handle GET requests (when users click the email link directly)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      // Redirect to verification page with error
      return NextResponse.redirect(new URL('/auth/company/verify-email?error=missing-token', request.url));
    }
    
    // Redirect to the verification page with the token
    return NextResponse.redirect(new URL(`/auth/company/verify-email?token=${token}`, request.url));
    
  } catch (error: any) {
    console.error("Email verification GET error:", error);
    return NextResponse.redirect(new URL('/auth/company/verify-email?error=invalid-request', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    
    if (!body.token) {
      return NextResponse.json({
        success: false,
        message: "Verification token is required"
      }, { status: 400 });
    }
    
    // Verify the token
    const decoded = verifyCompanyEmailVerificationToken(body.token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired verification token"
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
        message: "Email verification failed"
      }, { status: 400 });
    }
    
    // Check if already verified
    if (company.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified"
      }, { status: 200 });
    }
    
    // Check if token is still valid (not expired)
    if (company.emailVerificationExpires && company.emailVerificationExpires < new Date()) {
      return NextResponse.json({
        success: false,
        message: "Verification token has expired"
      }, { status: 400 });
    }
    
    // Verify the company
    company.isEmailVerified = true;
    company.isVerified = true; // Also set general verification status
    company.emailVerificationToken = undefined;
    company.emailVerificationExpires = undefined;
    await company.save();
    
    return NextResponse.json({
      success: true,
      message: "Email verified successfully"
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
