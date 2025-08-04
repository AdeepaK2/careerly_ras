import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergradModel from "@/lib/models/undergraduate";

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get verification statistics
    const [companyStats, undergradStats] = await Promise.all([
      // Company statistics
      CompanyModel.aggregate([
        {
          $group: {
            _id: null,
            totalCompanies: { $sum: 1 },
            verifiedCompanies: {
              $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] }
            },
            pendingCompanies: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$isVerified", false] },
                      {
                        $or: [
                          { $eq: ["$verificationStatus", "pending"] },
                          { $eq: ["$verificationStatus", null] },
                          { $eq: ["$verificationStatus", undefined] }
                        ]
                      }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            underReviewCompanies: {
              $sum: {
                $cond: [{ $eq: ["$verificationStatus", "under_review"] }, 1, 0]
              }
            },
            rejectedCompanies: {
              $sum: {
                $cond: [{ $eq: ["$verificationStatus", "rejected"] }, 1, 0]
              }
            },
            highPriorityCompanies: {
              $sum: {
                $cond: [{ $eq: ["$verificationPriority", "high"] }, 1, 0]
              }
            }
          }
        }
      ]),

      // Undergraduate statistics
      UndergradModel.aggregate([
        {
          $group: {
            _id: null,
            totalUndergrads: { $sum: 1 },
            verifiedUndergrads: {
              $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] }
            },
            pendingUndergrads: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$isVerified", false] },
                      {
                        $or: [
                          { $eq: ["$verificationStatus", "pending"] },
                          { $eq: ["$verificationStatus", null] },
                          { $eq: ["$verificationStatus", undefined] }
                        ]
                      }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            underReviewUndergrads: {
              $sum: {
                $cond: [{ $eq: ["$verificationStatus", "under_review"] }, 1, 0]
              }
            },
            rejectedUndergrads: {
              $sum: {
                $cond: [{ $eq: ["$verificationStatus", "rejected"] }, 1, 0]
              }
            },
            highPriorityUndergrads: {
              $sum: {
                $cond: [{ $eq: ["$verificationPriority", "high"] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    // Get recent verification activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentActivity] = await Promise.all([
      // Recent verification activity
      Promise.all([
        CompanyModel.countDocuments({
          $or: [
            { verifiedAt: { $gte: thirtyDaysAgo } },
            { verificationRequestedAt: { $gte: thirtyDaysAgo } }
          ]
        }),
        UndergradModel.countDocuments({
          $or: [
            { verifiedAt: { $gte: thirtyDaysAgo } },
            { verificationRequestedAt: { $gte: thirtyDaysAgo } }
          ]
        })
      ])
    ]);

    // Get average processing time
    const [avgProcessingTime] = await Promise.all([
      CompanyModel.aggregate([
        {
          $match: {
            isVerified: true,
            verifiedAt: { $exists: true },
            createdAt: { $exists: true }
          }
        },
        {
          $addFields: {
            processingTime: {
              $divide: [
                { $subtract: ["$verifiedAt", "$createdAt"] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgProcessingDays: { $avg: "$processingTime" },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Get verification trends (last 7 days)
    const trends = await Promise.all([
      CompanyModel.aggregate([
        {
          $match: {
            verifiedAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$verifiedAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      UndergradModel.aggregate([
        {
          $match: {
            verifiedAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$verifiedAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Process results
    const companyData = companyStats[0] || {};
    const undergradData = undergradStats[0] || {};

    const summary = {
      totalRequests: (companyData.totalCompanies || 0) + (undergradData.totalUndergrads || 0),
      totalPending: (companyData.pendingCompanies || 0) + (undergradData.pendingUndergrads || 0),
      totalUnderReview: (companyData.underReviewCompanies || 0) + (undergradData.underReviewUndergrads || 0),
      totalVerified: (companyData.verifiedCompanies || 0) + (undergradData.verifiedUndergrads || 0),
      totalRejected: (companyData.rejectedCompanies || 0) + (undergradData.rejectedUndergrads || 0),
      totalHighPriority: (companyData.highPriorityCompanies || 0) + (undergradData.highPriorityUndergrads || 0),
      recentActivity: recentActivity[0] + recentActivity[1],
      avgProcessingDays: avgProcessingTime[0]?.avgProcessingDays || 0,
      verificationRate: {
        companies: companyData.totalCompanies > 0 ? 
          ((companyData.verifiedCompanies || 0) / companyData.totalCompanies * 100).toFixed(1) : '0',
        undergraduates: undergradData.totalUndergrads > 0 ? 
          ((undergradData.verifiedUndergrads || 0) / undergradData.totalUndergrads * 100).toFixed(1) : '0',
        overall: (companyData.totalCompanies || 0) + (undergradData.totalUndergrads || 0) > 0 ? 
          (((companyData.verifiedCompanies || 0) + (undergradData.verifiedUndergrads || 0)) / 
           ((companyData.totalCompanies || 0) + (undergradData.totalUndergrads || 0)) * 100).toFixed(1) : '0'
      }
    };

    const breakdown = {
      companies: {
        total: companyData.totalCompanies || 0,
        verified: companyData.verifiedCompanies || 0,
        pending: companyData.pendingCompanies || 0,
        underReview: companyData.underReviewCompanies || 0,
        rejected: companyData.rejectedCompanies || 0,
        highPriority: companyData.highPriorityCompanies || 0
      },
      undergraduates: {
        total: undergradData.totalUndergrads || 0,
        verified: undergradData.verifiedUndergrads || 0,
        pending: undergradData.pendingUndergrads || 0,
        underReview: undergradData.underReviewUndergrads || 0,
        rejected: undergradData.rejectedUndergrads || 0,
        highPriority: undergradData.highPriorityUndergrads || 0
      }
    };

    // Create 7-day trend data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const trendData = last7Days.map(date => {
      const companyCount = trends[0].find(t => t._id === date)?.count || 0;
      const undergradCount = trends[1].find(t => t._id === date)?.count || 0;
      return {
        date,
        companies: companyCount,
        undergraduates: undergradCount,
        total: companyCount + undergradCount
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary,
        breakdown,
        trends: {
          weekly: trendData
        }
      }
    });

  } catch (error: any) {
    console.error("Error fetching pending verification stats:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch pending verification statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
