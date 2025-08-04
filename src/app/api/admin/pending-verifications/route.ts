import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergradModel from "@/lib/models/undergraduate";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all'; // 'all', 'company', 'undergraduate'
    const status = searchParams.get('status') || 'all'; // 'all', 'pending', 'under_review', 'approved', 'rejected'
    const search = searchParams.get('search') || '';
    const priority = searchParams.get('priority') || 'all'; // 'all', 'high', 'medium', 'low'

    const skip = (page - 1) * limit;

    // Base query for verification requests
    const baseQuery: any = {};

    // Status filter - focus on unverified accounts
    if (status === 'pending') {
      baseQuery.isVerified = false;
      baseQuery.verificationStatus = { $in: ['pending', undefined, null] };
    } else if (status === 'under_review') {
      baseQuery.verificationStatus = 'under_review';
    } else if (status === 'approved') {
      baseQuery.isVerified = true;
      baseQuery.verificationStatus = 'approved';
    } else if (status === 'rejected') {
      baseQuery.verificationStatus = 'rejected';
    } else {
      // 'all' - show accounts that need verification attention
      baseQuery.$or = [
        { isVerified: false },
        { verificationStatus: { $in: ['pending', 'under_review', 'rejected'] } }
      ];
    }

    let companyRequests: any[] = [];
    let undergradRequests: any[] = [];

    // Fetch company verification requests
    if (type === 'all' || type === 'company') {
      const companyQuery = { ...baseQuery };
      
      if (search) {
        companyQuery.$or = [
          { companyName: { $regex: search, $options: 'i' } },
          { businessEmail: { $regex: search, $options: 'i' } },
          { registrationNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const companies = await CompanyModel.find(companyQuery)
        .select('companyName businessEmail registrationNumber industry isVerified verificationStatus verificationDocuments contactPerson createdAt verificationRequestedAt verificationPriority verificationNotes')
        .sort({ verificationRequestedAt: -1, createdAt: -1 })
        .limit(type === 'company' ? limit : Math.ceil(limit / 2))
        .skip(type === 'company' ? skip : 0)
        .lean() as any[];

      companyRequests = companies.map(company => ({
        _id: company._id,
        accountType: 'company',
        accountName: company.companyName,
        accountEmail: company.businessEmail,
        accountId: company.registrationNumber,
        isVerified: company.isVerified,
        verificationStatus: company.verificationStatus || 'pending',
        verificationPriority: company.verificationPriority || 'medium',
        createdAt: company.createdAt,
        verificationRequestedAt: company.verificationRequestedAt || company.createdAt,
        verificationNotes: company.verificationNotes,
        // Company specific fields
        companyName: company.companyName,
        industry: company.industry,
        hasDocuments: company.verificationDocuments && company.verificationDocuments.length > 0,
        contactPerson: company.contactPerson
      }));
    }

    // Fetch undergraduate verification requests
    if (type === 'all' || type === 'undergraduate') {
      const undergradQuery = { ...baseQuery };
      
      if (search) {
        undergradQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { universityEmail: { $regex: search, $options: 'i' } },
          { index: { $regex: search, $options: 'i' } }
        ];
      }

      const undergrads = await UndergradModel.find(undergradQuery)
        .select('name universityEmail index education batch isVerified verificationStatus verificationDocuments createdAt verificationRequestedAt verificationPriority verificationNotes')
        .sort({ verificationRequestedAt: -1, createdAt: -1 })
        .limit(type === 'undergraduate' ? limit : Math.ceil(limit / 2))
        .skip(type === 'undergraduate' ? skip : 0)
        .lean() as any[];

      undergradRequests = undergrads.map(undergrad => ({
        _id: undergrad._id,
        accountType: 'undergraduate',
        accountName: undergrad.name,
        accountEmail: undergrad.universityEmail,
        accountId: undergrad.index,
        isVerified: undergrad.isVerified,
        verificationStatus: undergrad.verificationStatus || 'pending',
        verificationPriority: undergrad.verificationPriority || 'medium',
        createdAt: undergrad.createdAt,
        verificationRequestedAt: undergrad.verificationRequestedAt || undergrad.createdAt,
        verificationNotes: undergrad.verificationNotes,
        // Undergraduate specific fields
        name: undergrad.name,
        index: undergrad.index,
        batch: undergrad.batch,
        education: undergrad.education,
        hasDocuments: undergrad.verificationDocuments && undergrad.verificationDocuments.length > 0
      }));
    }

    // Combine and sort all requests
    let allRequests = [...companyRequests, ...undergradRequests];
    
    // Priority filter
    if (priority !== 'all') {
      allRequests = allRequests.filter(req => req.verificationPriority === priority);
    }

    // Sort by priority and date
    allRequests.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.verificationPriority as keyof typeof priorityOrder] || 2) - 
                          (priorityOrder[a.verificationPriority as keyof typeof priorityOrder] || 2);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.verificationRequestedAt).getTime() - new Date(a.verificationRequestedAt).getTime();
    });

    // Apply pagination to combined results
    const paginatedRequests = allRequests.slice(skip, skip + limit);

    // Get total counts for pagination
    const totalCompanies = type === 'all' || type === 'company' ? 
      await CompanyModel.countDocuments(type === 'company' ? baseQuery : { ...baseQuery }) : 0;
    const totalUndergrads = type === 'all' || type === 'undergraduate' ? 
      await UndergradModel.countDocuments(type === 'undergraduate' ? baseQuery : { ...baseQuery }) : 0;
    
    const totalRequests = type === 'all' ? Math.min(allRequests.length, totalCompanies + totalUndergrads) : 
                         type === 'company' ? totalCompanies : totalUndergrads;

    return NextResponse.json({
      success: true,
      data: {
        requests: paginatedRequests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRequests / limit),
          totalRequests,
          hasNext: page < Math.ceil(totalRequests / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error: any) {
    console.error("Error fetching pending verifications:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch pending verifications",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
