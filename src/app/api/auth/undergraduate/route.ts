import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";

export async function GET() {
  try {
    await connect();
    
    return NextResponse.json({
      success: true,
      message: "Undergraduate auth API is working!",
      timestamp: new Date().toISOString(),
      endpoints: {
        POST: {
          "/api/auth/undergraduate/register": "Register new undergraduate",
          "/api/auth/undergraduate/login": "Login undergraduate",
          "/api/auth/undergraduate/logout": "Logout undergraduate",
          "/api/auth/undergraduate/refresh": "Refresh access token"
        },
        GET: {
          "/api/auth/undergraduate/me": "Get user profile (protected)"
        }
      },
      environment: {
        hasJWTSecret: !!process.env.UNDERGRAD_JWT_SECRET,
        hasRefreshSecret: !!process.env.UNDERGRAD_REFRESH_TOKEN_SECRET,
        hasEmailSecret: !!process.env.UNDERGRAD_EMAIL_VERIFICATION_SECRET,
        hasMongoUri: !!process.env.MONGODB_URI
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Auth test error:", error);
    return NextResponse.json({
      success: false,
      message: "Auth API test failed",
      error: error.message
    }, { status: 500 });
  }
}
