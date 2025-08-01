import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import { verifyCompanyEmailVerificationToken } from "@/lib/auth/company/jwt";

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
    if (company.isVerified) {
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
    company.isVerified = true;
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
