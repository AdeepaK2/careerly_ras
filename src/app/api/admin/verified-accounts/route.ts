import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergraduateModel from "@/lib/models/undergraduate";
// import { withAdminAuth } from "@/lib/auth/admin/middleware";

// For development - remove admin auth requirement
// In production, wrap the handler with withAdminAuth
async function handler(request: NextRequest) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, company, undergraduate
    const verification = searchParams.get('verification') || 'all'; // all, verified, unverified
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    let results = [];
    let totalCount = 0;

    if (type === 'all' || type === 'company') {
      // Build search query for companies
      const companySearchQuery: any = {};
      
      // Apply verification filter
      if (verification === 'verified') {
        companySearchQuery.isVerified = true;
      } else if (verification === 'unverified') {
        companySearchQuery.isVerified = false;
      }
      // For 'all' verification, don't add isVerified filter
      
      if (search) {
        companySearchQuery.$or = [
          { companyName: { $regex: search, $options: 'i' } },
          { businessEmail: { $regex: search, $options: 'i' } },
          { registrationNumber: { $regex: search, $options: 'i' } },
          { industry: { $regex: search, $options: 'i' } }
        ];
      }

      const companies = await CompanyModel
        .find(companySearchQuery)
        .select('-password -refreshTokens -loginAttempts -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip(type === 'company' ? skip : 0)
        .limit(type === 'company' ? limit : 1000); // Use large number instead of undefined

      const companiesWithType = companies.map(company => ({
        ...company.toObject(),
        accountType: 'company',
        verifiedAt: company.isVerified ? company.updatedAt : null,
        accountName: company.companyName,
        accountEmail: company.businessEmail,
        accountId: company.registrationNumber
      }));

      if (type === 'company') {
        results = companiesWithType;
        totalCount = await CompanyModel.countDocuments(companySearchQuery);
      } else {
        results.push(...companiesWithType);
      }
    }

    if (type === 'all' || type === 'undergraduate') {
      // Build search query for undergraduates
      const undergradSearchQuery: any = {};
      
      // Apply verification filter
      if (verification === 'verified') {
        undergradSearchQuery.isVerified = true;
      } else if (verification === 'unverified') {
        undergradSearchQuery.isVerified = false;
      }
      // For 'all' verification, don't add isVerified filter
      
      if (search) {
        undergradSearchQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { nameWithInitials: { $regex: search, $options: 'i' } },
          { universityEmail: { $regex: search, $options: 'i' } },
          { index: { $regex: search, $options: 'i' } },
          { 'education.faculty': { $regex: search, $options: 'i' } },
          { 'education.degreeProgramme': { $regex: search, $options: 'i' } }
        ];
      }

      const undergraduates = await UndergraduateModel
        .find(undergradSearchQuery)
        .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip(type === 'undergraduate' ? skip : 0)
        .limit(type === 'undergraduate' ? limit : 1000); // Use large number instead of undefined

      const undergradsWithType = undergraduates.map(undergrad => ({
        ...undergrad.toObject(),
        accountType: 'undergraduate',
        verifiedAt: undergrad.isVerified ? undergrad.updatedAt : null,
        accountName: undergrad.name,
        accountEmail: undergrad.universityEmail,
        accountId: undergrad.index
      }));

      if (type === 'undergraduate') {
        results = undergradsWithType;
        totalCount = await UndergraduateModel.countDocuments(undergradSearchQuery);
      } else {
        results.push(...undergradsWithType);
      }
    }

    if (type === 'all') {
      // Sort combined results by verification status and date
      results.sort((a, b) => {
        // First sort by verification status (verified first if filtering by verified)
        if (verification === 'verified') {
          return new Date(b.verifiedAt || 0).getTime() - new Date(a.verifiedAt || 0).getTime();
        } else if (verification === 'unverified') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          // For 'all', sort verified first, then by date
          if (a.isVerified !== b.isVerified) {
            return b.isVerified ? 1 : -1;
          }
          return new Date(b.verifiedAt || b.createdAt).getTime() - new Date(a.verifiedAt || a.createdAt).getTime();
        }
      });
      
      // Apply pagination to combined results
      totalCount = results.length;
      results = results.slice(skip, skip + limit);
    }

    return NextResponse.json({
      success: true,
      data: {
        accounts: results,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        filters: {
          type,
          verification,
          search
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get verified accounts error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch verified accounts",
      error: error.message
    }, { status: 500 });
  }
}

// Export the handler directly for development
// In production, use: export const GET = withAdminAuth(handler);
export const GET = handler;
