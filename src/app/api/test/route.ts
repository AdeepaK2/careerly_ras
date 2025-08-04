import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergraduateModel from "@/lib/models/undergraduate";
import { verifyCompanyAuth } from "@/lib/auth/company/middleware";
import { verifyUndergradAuth } from "@/lib/auth/undergraduate/middleware";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('type'); // 'company' or 'undergraduate'

    // Test database connection
    await connect();
    
    const result = {
      success: true,
      message: "MongoDB connection is working!",
      connectionStatus: "Connected",
      timestamp: new Date().toISOString(),
      authTest: null as any
    };

    // If user type is provided, test authentication
    if (userType && ['company', 'undergraduate'].includes(userType)) {
      let authResult;
      let user;

      if (userType === 'company') {
        authResult = await verifyCompanyAuth(request);
        if (authResult.success && authResult.user) {
          user = await CompanyModel.findById(authResult.user.id)
            .select('companyName businessEmail isVerified verificationStatus createdAt')
            .lean() as any;
        }
      } else {
        authResult = await verifyUndergradAuth(request);
        if (authResult.success && authResult.user) {
          user = await UndergraduateModel.findById(authResult.user.id)
            .select('nameWithInitials universityEmail isVerified verificationStatus createdAt')
            .lean() as any;
        }
      }

      result.authTest = {
        userType,
        authSuccess: authResult.success,
        authError: authResult.error,
        userFound: !!user,
        userData: user ? {
          userId: user._id,
          userInfo: userType === 'company' ? {
            name: user.companyName,
            email: user.businessEmail
          } : {
            name: user.nameWithInitials,
            email: user.universityEmail
          },
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
          createdAt: user.createdAt
        } : null
      };
    }

    return NextResponse.json(result, { status: 200 });
    
  } catch (error: any) {
    console.error("Database test failed:", error);
    
    return NextResponse.json({
      success: false,
      message: "MongoDB connection failed",
      error: error.message,
      connectionStatus: "Failed"
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Test endpoint working"
  }, { status: 200 });
}