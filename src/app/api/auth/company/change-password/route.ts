import { NextRequest, NextResponse } from "next/server";
import { withCompanyAuth } from "@/lib/auth/company/middleware";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import { verifyPassword, hashPassword, getPasswordPolicyError } from "@/lib/auth/company/password";

export const POST = withCompanyAuth(async (request: NextRequest, user) => {
  try {
    await connect();

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }

    const policyError = getPasswordPolicyError(newPassword);
    if (policyError) {
      return NextResponse.json({
        success: false,
        message: policyError
      }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({
        success: false,
        message: "New password must be different from your current password"
      }, { status: 400 });
    }

    const company = await CompanyModel.findById(user.id);
    if (!company) {
      return NextResponse.json({
        success: false,
        message: "Company not found"
      }, { status: 404 });
    }

    const isValidPassword = await verifyPassword(currentPassword, company.password);
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: "Current password is incorrect"
      }, { status: 400 });
    }

    company.password = await hashPassword(newPassword);
    await company.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
});
