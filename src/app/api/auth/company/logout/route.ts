import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('company_refresh_token')?.value;
    
    if (refreshToken) {
      // Find company and remove the refresh token
      const company = await CompanyModel.findOne({
        'refreshTokens.token': refreshToken
      });
      
      if (company) {
        await company.removeRefreshToken(refreshToken);
      }
    }
    
    const response = NextResponse.json({
      success: true,
      message: "Logout successful"
    }, { status: 200 });
    
    // Clear the refresh token cookie
    response.cookies.set('company_refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });
    
    return response;
    
  } catch (error: any) {
    console.error("Company logout error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
