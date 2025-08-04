import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergraduateModel from "@/lib/models/undergraduate";
// import { withAdminAuth } from "@/lib/auth/admin/middleware";

async function handler(request: NextRequest) {
  try {
    await connect();
    
    // Get statistics for all accounts
    const [
      totalVerifiedCompanies,
      totalVerifiedUndergraduates,
      totalUnverifiedCompanies,
      totalUnverifiedUndergraduates,
      recentlyVerifiedCompanies,
      recentlyVerifiedUndergraduates,
      totalCompanies,
      totalUndergraduates
    ] = await Promise.all([
      CompanyModel.countDocuments({ isVerified: true }),
      UndergraduateModel.countDocuments({ isVerified: true }),
      CompanyModel.countDocuments({ isVerified: false }),
      UndergraduateModel.countDocuments({ isVerified: false }),
      CompanyModel.countDocuments({ 
        isVerified: true, 
        updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }),
      UndergraduateModel.countDocuments({ 
        isVerified: true, 
        updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }),
      CompanyModel.countDocuments({}),
      UndergraduateModel.countDocuments({})
    ]);

    // Get verification trends (last 12 months)
    const monthlyStats = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const [companiesVerified, undergradsVerified] = await Promise.all([
        CompanyModel.countDocuments({
          isVerified: true,
          updatedAt: { $gte: startOfMonth, $lte: endOfMonth }
        }),
        UndergraduateModel.countDocuments({
          isVerified: true,
          updatedAt: { $gte: startOfMonth, $lte: endOfMonth }
        })
      ]);

      monthlyStats.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        companies: companiesVerified,
        undergraduates: undergradsVerified,
        total: companiesVerified + undergradsVerified
      });
    }

    // Get industry distribution for verified companies
    const industryStats = await CompanyModel.aggregate([
      { $match: { isVerified: true } },
      { 
        $group: {
          _id: "$industry",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get faculty distribution for verified undergraduates
    const facultyStats = await UndergraduateModel.aggregate([
      { $match: { isVerified: true } },
      { 
        $group: {
          _id: "$education.faculty",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const verificationRate = {
      companies: totalCompanies > 0 ? (totalVerifiedCompanies / totalCompanies * 100).toFixed(1) : '0',
      undergraduates: totalUndergraduates > 0 ? (totalVerifiedUndergraduates / totalUndergraduates * 100).toFixed(1) : '0',
      overall: (totalCompanies + totalUndergraduates) > 0 ? 
        ((totalVerifiedCompanies + totalVerifiedUndergraduates) / (totalCompanies + totalUndergraduates) * 100).toFixed(1) : '0'
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAccounts: totalCompanies + totalUndergraduates,
          totalVerified: totalVerifiedCompanies + totalVerifiedUndergraduates,
          totalUnverified: totalUnverifiedCompanies + totalUnverifiedUndergraduates,
          verifiedCompanies: totalVerifiedCompanies,
          verifiedUndergraduates: totalVerifiedUndergraduates,
          unverifiedCompanies: totalUnverifiedCompanies,
          unverifiedUndergraduates: totalUnverifiedUndergraduates,
          recentlyVerified: recentlyVerifiedCompanies + recentlyVerifiedUndergraduates,
          verificationRate
        },
        trends: {
          monthly: monthlyStats
        },
        distributions: {
          industries: industryStats.map(stat => ({
            name: stat._id,
            count: stat.count
          })),
          faculties: facultyStats.map(stat => ({
            name: stat._id,
            count: stat.count
          }))
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get verified accounts statistics error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message
    }, { status: 500 });
  }
}

// Export handler directly for development
// In production, use: export const GET = withAdminAuth(handler);
export const GET = handler;
