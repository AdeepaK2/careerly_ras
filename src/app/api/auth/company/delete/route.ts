import { NextRequest, NextResponse } from "next/server";
import { withCompanyAuth } from "@/lib/auth/company/middleware";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";

export const DELETE = withCompanyAuth(async (request: NextRequest, user) => {
  try {
    await connect();

    // Find and delete the company
    const company = await CompanyModel.findByIdAndDelete(user.id);

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found"
        },
        { status: 404 }
      );
    }

    // Create response and clear refresh token cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully"
      },
      { status: 200 }
    );

    // Clear the refresh token cookie
    response.cookies.set("company_refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0
    });

    return response;
  } catch (error: any) {
    console.error("Company delete account error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete account"
      },
      { status: 500 }
    );
  }
});
