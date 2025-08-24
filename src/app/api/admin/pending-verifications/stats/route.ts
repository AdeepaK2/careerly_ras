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
    const period = searchParams.get('period') || '30'; // days to look back
    const days = parseInt(period);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get pending company verifications
    const pendingCompanies = await CompanyModel.countDocuments({
      isVerified: false
    });

    const pendingCompaniesByPriority = await CompanyModel.aggregate([
      { $match: { isVerified: false } },
      {
        $group: {
          _id: { $ifNull: ["$verificationPriority", "medium"] },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get pending undergraduate verifications
    const pendingUndergraduates = await UndergraduateModel.countDocuments({
      isVerified: false
    });

    const pendingUndergraduatesByPriority = await UndergraduateModel.aggregate([
      { $match: { isVerified: false } },
      {
        $group: {
          _id: { $ifNull: ["$verificationPriority", "medium"] },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get verification requests over time (last N days)
    const verificationRequestsOverTime = await CompanyModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: { $literal: "company" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $unionWith: {
          coll: "undergraduates",
          pipeline: [
            {
              $match: {
                createdAt: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  type: { $literal: "undergraduate" }
                },
                count: { $sum: 1 }
              }
            }
          ]
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Get average processing time for completed verifications
    const completedVerifications = await CompanyModel.aggregate([
      {
        $match: {
          isVerified: true,
          verificationCompletedAt: { $exists: true },
          verificationRequestedAt: { $exists: true }
        }
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ["$verificationCompletedAt", "$verificationRequestedAt"] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgProcessingTime: { $avg: "$processingTime" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get oldest pending verification requests
    const oldestPendingCompany = await CompanyModel.findOne(
      { isVerified: false },
      { createdAt: 1, companyName: 1 }
    ).sort({ createdAt: 1 });

    const oldestPendingUndergrad = await UndergraduateModel.findOne(
      { isVerified: false },
      { createdAt: 1, name: 1 }
    ).sort({ createdAt: 1 });

    // Format priority data
    const formatPriorityData = (data: any[]) => {
      const result = { high: 0, medium: 0, low: 0 };
      data.forEach(item => {
        const priority = item._id || 'medium';
        result[priority as keyof typeof result] = item.count;
      });
      return result;
    };

    // Get verification completion rate (last 30 days)
    const totalRequestsLast30Days = await CompanyModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }) + await UndergraduateModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const completedRequestsLast30Days = await CompanyModel.countDocuments({
      isVerified: true,
      verificationCompletedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }) + await UndergraduateModel.countDocuments({
      isVerified: true,
      verificationCompletedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const completionRate = totalRequestsLast30Days > 0 
      ? (completedRequestsLast30Days / totalRequestsLast30Days) * 100 
      : 0;

    // Calculate days since oldest pending request
    const oldestDate = oldestPendingCompany?.createdAt && oldestPendingUndergrad?.createdAt
      ? new Date(Math.min(oldestPendingCompany.createdAt.getTime(), oldestPendingUndergrad.createdAt.getTime()))
      : oldestPendingCompany?.createdAt || oldestPendingUndergrad?.createdAt;

    const daysSinceOldest = oldestDate 
      ? Math.floor((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalPending: pendingCompanies + pendingUndergraduates,
          pendingCompanies,
          pendingUndergraduates,
          completionRate: Math.round(completionRate * 100) / 100,
          avgProcessingTimeDays: completedVerifications[0]?.avgProcessingTime 
            ? Math.round(completedVerifications[0].avgProcessingTime * 100) / 100 
            : null,
          oldestPendingDays: daysSinceOldest
        },
        priority: {
          company: formatPriorityData(pendingCompaniesByPriority),
          undergraduate: formatPriorityData(pendingUndergraduatesByPriority),
          total: {
            high: formatPriorityData(pendingCompaniesByPriority).high + formatPriorityData(pendingUndergraduatesByPriority).high,
            medium: formatPriorityData(pendingCompaniesByPriority).medium + formatPriorityData(pendingUndergraduatesByPriority).medium,
            low: formatPriorityData(pendingCompaniesByPriority).low + formatPriorityData(pendingUndergraduatesByPriority).low
          }
        },
        timeline: {
          period: `${days} days`,
          requests: verificationRequestsOverTime.map(item => ({
            date: item._id.date,
            type: item._id.type,
            count: item.count
          }))
        },
        oldestPending: {
          company: oldestPendingCompany ? {
            name: oldestPendingCompany.companyName,
            daysPending: Math.floor((Date.now() - oldestPendingCompany.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          } : null,
          undergraduate: oldestPendingUndergrad ? {
            name: oldestPendingUndergrad.name,
            daysPending: Math.floor((Date.now() - oldestPendingUndergrad.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          } : null
        },
        performance: {
          totalCompletedVerifications: completedVerifications[0]?.count || 0,
          avgProcessingTimeDays: completedVerifications[0]?.avgProcessingTime || 0,
          completionRateLast30Days: Math.round(completionRate * 100) / 100
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get pending verification stats error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch pending verification statistics",
      error: error.message
    }, { status: 500 });
  }
}

// Export the handler directly for development
// In production, use: export const GET = withAdminAuth(handler);
export const GET = handler;