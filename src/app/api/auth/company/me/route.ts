import { NextRequest, NextResponse } from "next/server";
import { withCompanyAuth } from "@/lib/auth/company/middleware";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";

export const GET = withCompanyAuth(async (request: NextRequest, user) => {
  try {
    await connect();
    
    // Get full company profile data
    const fullCompany = await CompanyModel.findById(user.id).select('-password -refreshTokens -loginAttempts -emailVerificationToken -passwordResetToken');
    
    if (!fullCompany) {
      return NextResponse.json({
        success: false,
        message: "Company not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: fullCompany._id,
          companyName: fullCompany.companyName,
          registrationNumber: fullCompany.registrationNumber,
          businessEmail: fullCompany.businessEmail,
          phoneNumber: fullCompany.phoneNumber,
          industry: fullCompany.industry,
          companySize: fullCompany.companySize,
          foundedYear: fullCompany.foundedYear,
          address: fullCompany.address,
          description: fullCompany.description,
          website: fullCompany.website,
          logoUrl: fullCompany.logoUrl,
          contactPerson: fullCompany.contactPerson,
          isVerified: fullCompany.isVerified,
          isActive: fullCompany.isActive,
          verificationDocuments: fullCompany.verificationDocuments,
          lastLogin: fullCompany.lastLogin,
          jobPostingLimits: fullCompany.jobPostingLimits,
          createdAt: fullCompany.createdAt,
          updatedAt: fullCompany.updatedAt
        }
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Get company profile error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
});
