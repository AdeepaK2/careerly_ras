import { NextRequest, NextResponse } from "next/server";
import { withCompanyAuth } from "@/lib/auth/company/middleware";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";

// GET: Fetch company profile
export const GET = withCompanyAuth(async (request: NextRequest, user) => {
  try {
    await connect();
    
    const company = await CompanyModel.findById(user.id).select('-password -refreshTokens -loginAttempts -emailVerificationToken -passwordResetToken');
    
    if (!company) {
      return NextResponse.json({
        success: false,
        message: "Company not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        company: {
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
          logoUrl: company.logoUrl,
          contactPerson: company.contactPerson,
          isEmailVerified: company.isEmailVerified,
          isVerified: company.isVerified,
          verificationStatus: company.verificationStatus,
          isActive: company.isActive,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt
        }
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("GET company profile error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
});

export const PUT = withCompanyAuth(async (request: NextRequest, user) => {
  try {
    await connect();

    const body = await request.json();
    const {
      companyName,
      phoneNumber,
      industry,
      companySize,
      foundedYear,
      address,
      description,
      website,
      contactPerson,
    } = body;

    // Validation
    if (!companyName || !phoneNumber || !industry || !companySize || !foundedYear || !address || !contactPerson) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }

    // Additional validations
    if (foundedYear < 1800 || foundedYear > new Date().getFullYear()) {
      return NextResponse.json({
        success: false,
        message: "Invalid founded year"
      }, { status: 400 });
    }

    if (!address.street || !address.city || !address.province || !address.postalCode) {
      return NextResponse.json({
        success: false,
        message: "Missing address information"
      }, { status: 400 });
    }

    if (!contactPerson.name || !contactPerson.designation || !contactPerson.email || !contactPerson.phone) {
      return NextResponse.json({
        success: false,
        message: "Missing contact person information"
      }, { status: 400 });
    }

    // Fields that cannot be updated by this API
    const updateFields = {
      companyName,
      phoneNumber,
      industry,
      companySize,
      foundedYear,
      address,
      description,
      website,
      contactPerson,
    };

    // Update company
    const updatedCompany = await CompanyModel.findByIdAndUpdate(
      user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password -refreshTokens -loginAttempts -emailVerificationToken -passwordResetToken');

    if (!updatedCompany) {
      return NextResponse.json({
        success: false,
        message: "Company not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: updatedCompany._id,
          companyName: updatedCompany.companyName,
          registrationNumber: updatedCompany.registrationNumber,
          businessEmail: updatedCompany.businessEmail,
          phoneNumber: updatedCompany.phoneNumber,
          industry: updatedCompany.industry,
          companySize: updatedCompany.companySize,
          foundedYear: updatedCompany.foundedYear,
          address: updatedCompany.address,
          description: updatedCompany.description,
          website: updatedCompany.website,
          logoUrl: updatedCompany.logoUrl,
          contactPerson: updatedCompany.contactPerson,
          isVerified: updatedCompany.isVerified,
          isActive: updatedCompany.isActive,
          verificationDocuments: updatedCompany.verificationDocuments,
          lastLogin: updatedCompany.lastLogin,
          jobPostingLimits: updatedCompany.jobPostingLimits,
          createdAt: updatedCompany.createdAt,
          updatedAt: updatedCompany.updatedAt
        }
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Update company profile error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
});
