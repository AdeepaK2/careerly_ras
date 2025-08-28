import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergradModel from "@/lib/models/undergraduate";
import JobModel from "@/lib/models/job";
import ApplicationModel from "@/lib/models/application";
import { withAdminAuth } from "@/lib/auth/admin/middleware";

// Lightweight summary endpoint for admin analytics
async function handler(request: NextRequest) {
  try {
    await connect();

    // total users = undergraduates + companies (count accounts)
    const totalUndergrads = await UndergradModel.countDocuments({});
    const totalCompanies = await CompanyModel.countDocuments({});

    // KPI: Total registered students
    const totalRegisteredStudents = totalUndergrads;

    // KPI: Total verified companies
    const totalVerifiedCompanies = await CompanyModel.countDocuments({
      isVerified: true,
    });

    // KPI: Verified students
    const verifiedStudents = await UndergradModel.countDocuments({
      isVerified: true,
    });
    const unverifiedStudents = totalUndergrads - verifiedStudents;
    const unverifiedCompanies = totalCompanies - totalVerifiedCompanies;

    // new users in last 24h
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUndergrads24 = await UndergradModel.countDocuments({
      createdAt: { $gte: since24h },
    });
    const newCompanies24 = await CompanyModel.countDocuments({
      createdAt: { $gte: since24h },
    });

    // KPI: Active job postings (not expired)
    const now = new Date();
    const activeJobPostings = await JobModel.countDocuments({
      $or: [{ deadline: { $gte: now } }, { deadline: { $exists: false } }],
    });

    // KPI: Expired jobs
    const expiredJobs = await JobModel.countDocuments({
      deadline: { $lt: now },
    });

    // DAU/MAU approximations based on lastLogin
    const dau =
      (await UndergradModel.countDocuments({ lastLogin: { $gte: since24h } })) +
      (await CompanyModel.countDocuments({ lastLogin: { $gte: since24h } }));
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const mau =
      (await UndergradModel.countDocuments({ lastLogin: { $gte: since30d } })) +
      (await CompanyModel.countDocuments({ lastLogin: { $gte: since30d } }));

    // pending verifications
    const pendingVerifications =
      (await CompanyModel.countDocuments({ isVerified: false })) +
      (await UndergradModel.countDocuments({ isVerified: false }));

    // KPI: Applications submitted (today/week/month)
    const applicationsToday = await ApplicationModel.countDocuments({
      createdAt: { $gte: since24h },
    });

    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const applicationsThisWeek = await ApplicationModel.countDocuments({
      createdAt: { $gte: since7d },
    });

    const applicationsThisMonth = await ApplicationModel.countDocuments({
      createdAt: { $gte: since30d },
    });

    // Jobs and applications in 24h
    const jobs24h = await JobModel.countDocuments({
      posted_date: { $gte: since24h },
    });

    // KPI: Successful placements/hires (applications with status 'hired' or 'accepted')
    const successfulPlacements = await ApplicationModel.countDocuments({
      status: { $in: ["hired", "accepted", "selected"] },
    });

    // KPI: Platform growth rate (30-day growth)
    const since60d = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const users30dAgo =
      (await UndergradModel.countDocuments({
        createdAt: { $lte: since30d },
      })) +
      (await CompanyModel.countDocuments({
        createdAt: { $lte: since30d },
      }));

    const platformGrowthRate =
      users30dAgo > 0
        ? ((totalUndergrads + totalCompanies - users30dAgo) / users30dAgo) * 100
        : 0;

    // average applications per job (simple aggregate)
    const appsAgg = await ApplicationModel.aggregate([
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
      { $group: { _id: null, avg: { $avg: "$count" } } },
    ]);
    const avgApplicationsPerJob = appsAgg[0]?.avg ?? 0;

    // avg session minutes approximate using lastLogin and createdAt differences is not reliable; leave mock/null
    const avgSessionMinutes = null;

    // retention and conversion metrics require event tracking; return null for now
    const retention7dPercent = null;
    const conversionRatePercent = null;

    return NextResponse.json(
      {
        success: true,
        data: {
          // Original metrics
          totalUsers: totalUndergrads + totalCompanies,
          new24h: newUndergrads24 + newCompanies24,
          dau,
          mau,
          pendingVerifications,
          avgSessionMinutes,
          retention7dPercent,
          conversionRatePercent,
          totalCompanies,
          jobs24h,
          applications24h: applicationsToday,
          avgApplicationsPerJob,
          // Enhanced KPIs
          totalRegisteredStudents,
          totalVerifiedCompanies,
          activeJobPostings,
          applicationsToday,
          applicationsThisWeek,
          applicationsThisMonth,
          successfulPlacements,
          platformGrowthRate: Math.round(platformGrowthRate * 100) / 100,
          verifiedStudents,
          unverifiedStudents,
          unverifiedCompanies,
          expiredJobs,
          totalJobs: activeJobPostings + expiredJobs,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("analytics summary error", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to compute analytics summary",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Export GET without auth wrapper for development. In production wrap with admin auth middleware.
// In production, wrap with admin auth middleware. For development, middleware allows bypass.
export const GET = withAdminAuth(handler as any);
