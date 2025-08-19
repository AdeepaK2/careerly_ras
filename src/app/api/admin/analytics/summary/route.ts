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

    // new users in last 24h
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUndergrads24 = await UndergradModel.countDocuments({
      createdAt: { $gte: since24h },
    });
    const newCompanies24 = await CompanyModel.countDocuments({
      createdAt: { $gte: since24h },
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

    // Jobs and applications in 24h
    const jobs24h = await JobModel.countDocuments({
      posted_date: { $gte: since24h },
    });
    const applications24h = await ApplicationModel.countDocuments({
      createdAt: { $gte: since24h },
    });

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
          applications24h,
          avgApplicationsPerJob,
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
