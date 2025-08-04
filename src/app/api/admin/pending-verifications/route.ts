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
    const priority = searchParams.get('priority') || 'all'; // all, high, medium, low
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    let results = [];
    let totalCount = 0;

    if (type === 'all' || type === 'company') {
      // Build search query for companies with pending verification
      const companySearchQuery: any = {
        isVerified: false // Only pending verifications
      };
      
      // Apply priority filter
      if (priority !== 'all') {
        companySearchQuery.verificationPriority = priority;
      }
      
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
        .select('companyName businessEmail registrationNumber industry companySize foundedYear address description website logoUrl contactPerson isVerified verificationStatus verificationDocuments verificationPriority verificationNotes createdAt verificationRequestedAt')
        .sort({ 
          verificationPriority: 1, // high=1, medium=2, low=3
          verificationRequestedAt: 1 // oldest first
        })
        .skip(type === 'company' ? skip : 0)
        .limit(type === 'company' ? limit : 1000);

      const companiesWithType = companies.map(company => ({
        ...company.toObject(),
        accountType: 'company',
        verificationRequestedAt: company.verificationRequestedAt || company.createdAt,
        accountName: company.companyName,
        accountEmail: company.businessEmail,
        accountId: company.registrationNumber,
        documentCount: company.verificationDocuments?.length || 0
      }));

      if (type === 'company') {
        results = companiesWithType;
        totalCount = await CompanyModel.countDocuments(companySearchQuery);
      } else {
        results.push(...companiesWithType);
      }
    }

    if (type === 'all' || type === 'undergraduate') {
      // Build search query for undergraduates with pending verification
      const undergradSearchQuery: any = {
        isVerified: false // Only pending verifications
      };
      
      // Apply priority filter (if undergraduates have verification priority)
      if (priority !== 'all') {
        undergradSearchQuery.verificationPriority = priority;
      }
      
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
        .select('name nameWithInitials universityEmail index education isVerified verificationStatus verificationDocuments verificationPriority verificationNotes createdAt verificationRequestedAt')
        .sort({ 
          verificationPriority: 1, // high=1, medium=2, low=3
          verificationRequestedAt: 1 // oldest first
        })
        .skip(type === 'undergraduate' ? skip : 0)
        .limit(type === 'undergraduate' ? limit : 1000);

      const undergradsWithType = undergraduates.map(undergrad => ({
        ...undergrad.toObject(),
        accountType: 'undergraduate',
        verificationRequestedAt: undergrad.verificationRequestedAt || undergrad.createdAt,
        accountName: undergrad.name,
        accountEmail: undergrad.universityEmail,
        accountId: undergrad.index,
        documentCount: undergrad.verificationDocuments?.length || 0
      }));

      if (type === 'undergraduate') {
        results = undergradsWithType;
        totalCount = await UndergraduateModel.countDocuments(undergradSearchQuery);
      } else {
        results.push(...undergradsWithType);
      }
    }

    if (type === 'all') {
      // Sort combined results by priority and request date
      results.sort((a, b) => {
        // First sort by priority (high=1, medium=2, low=3)
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const aPriority = priorityOrder[a.verificationPriority as keyof typeof priorityOrder] || 2;
        const bPriority = priorityOrder[b.verificationPriority as keyof typeof priorityOrder] || 2;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // Then by request date (oldest first)
        return new Date(a.verificationRequestedAt).getTime() - new Date(b.verificationRequestedAt).getTime();
      });
      
      // Apply pagination to combined results
      totalCount = results.length;
      results = results.slice(skip, skip + limit);
    }

    return NextResponse.json({
      success: true,
      data: {
        pendingVerifications: results,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        filters: {
          type,
          priority,
          search
        },
        statistics: {
          totalPending: totalCount,
          highPriority: results.filter(r => r.verificationPriority === 'high').length,
          mediumPriority: results.filter(r => r.verificationPriority === 'medium').length,
          lowPriority: results.filter(r => r.verificationPriority === 'low').length
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get pending verifications error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch pending verifications",
      error: error.message
    }, { status: 500 });
  }
}

// Export the handler directly for development
// In production, use: export const GET = withAdminAuth(handler);
export const GET = handler;