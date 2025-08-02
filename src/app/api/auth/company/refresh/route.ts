import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('company_refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: "No refresh token found"
      }, { status: 401 });
    }
    
    // Find company with this refresh token
    const company = await CompanyModel.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });
    
    if (!company) {
      const response = NextResponse.json({
        success: false,
        message: "Invalid refresh token"
      }, { status: 401 });
      
      // Clear the invalid refresh token cookie
      response.cookies.set('company_refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0
      });
      
      return response;
    }
    
    // Remove the used refresh token
    await company.removeRefreshToken(refreshToken);
    
    // Generate new tokens
    const { generateCompanyTokens } = await import("@/lib/auth/company/jwt");
    const { accessToken, refreshToken: newRefreshToken } = generateCompanyTokens({
      id: company._id.toString(),
      registrationNumber: company.registrationNumber,
      businessEmail: company.businessEmail,
      companyName: company.companyName,
      isVerified: company.isVerified,
      type: 'company'
    });
    
    // Add new refresh token to company
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await company.addRefreshToken(newRefreshToken, refreshTokenExpiry);
    
    const response = NextResponse.json({
      success: true,
      data: {
        accessToken
      }
    }, { status: 200 });
    
    // Set new refresh token as HTTP-only cookie
    response.cookies.set('company_refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    return response;
    
  } catch (error: any) {
    console.error("Token refresh error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
