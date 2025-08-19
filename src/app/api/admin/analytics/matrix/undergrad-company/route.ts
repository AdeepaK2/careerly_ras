import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import ApplicationModel from "@/lib/models/application";
import { withAdminAuth } from "@/lib/auth/admin/middleware";

async function handler(request: NextRequest) {
  try {
    await connect();

    // aggregate applications by applicant faculty and company industry
    const agg = await ApplicationModel.aggregate([
      {
        $lookup: {
          from: "undergraduates",
          localField: "applicantId",
          foreignField: "_id",
          as: "applicant",
        },
      },
      { $unwind: { path: "$applicant", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: { path: "$job", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "companies",
          localField: "job.companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: {
            faculty: "$applicant.education.faculty",
            industry: "$company.industry",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.faculty": 1, "_id.industry": 1 } },
    ]).allowDiskUse(true);

    // build lists of faculties and industries and a matrix map
    const facultiesSet = new Set<string>();
    const industriesSet = new Set<string>();
    const map = new Map<string, Map<string, number>>();
    let maxCount = 0;

    agg.forEach((item: any) => {
      const faculty = item._id.faculty || "Unknown";
      const industry = item._id.industry || "Unknown";
      const count = item.count || 0;
      facultiesSet.add(faculty);
      industriesSet.add(industry);
      if (!map.has(faculty)) map.set(faculty, new Map());
      map.get(faculty)!.set(industry, count);
      if (count > maxCount) maxCount = count;
    });

    const faculties = Array.from(facultiesSet).sort();
    const industries = Array.from(industriesSet).sort();

    const matrix = faculties.map((f) => {
      const row: Record<string, number> = {};
      industries.forEach((ind) => {
        row[ind] = map.get(f)?.get(ind) ?? 0;
      });
      return { faculty: f, counts: row };
    });

    return NextResponse.json(
      { success: true, data: { faculties, industries, matrix, maxCount } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("analytics matrix error", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to compute analytics matrix",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler as any);
