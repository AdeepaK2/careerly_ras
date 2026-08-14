import { NextRequest, NextResponse } from "next/server";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import CompanyModel from "@/lib/models/company";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const undergrad = await verifyUndergradAccessToken(token);
    if (!undergrad || !undergrad.payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get saved jobs for specific undergrad
    const savedJobs = await UndergradModel.findById(undergrad.payload.id)
      .select('savedJobs')
      .populate({
        path: 'savedJobs.jobId',
        select: 'title companyId customCompanyName location jobType workPlaceType description salaryRange deadline skillsRequired status urgent posted_date'
      })
      .lean();

    if (!savedJobs) {
      return NextResponse.json({
        success: true,
        data: { savedJobs: [] }
      }, { status: 200 });
    }

    const undergradDoc = savedJobs as {
      savedJobs?: Array<{
        jobId?: {
          companyId?: unknown;
          [key: string]: unknown;
        } | null;
        companyName?: string;
        [key: string]: unknown;
      }>;
    };

    const savedJobsWithCompany = await Promise.all(
      (undergradDoc.savedJobs || []).map(async (savedJob) => {
        if (!savedJob.jobId) {
          return {
            ...savedJob,
            companyName: 'Unknown Company',
          };
        }

        if (savedJob.jobId.companyId) {
          const company = await CompanyModel.findById(savedJob.jobId.companyId)
            .select('companyName logo')
            .lean() as { companyName?: string; logo?: string | null } | null;

          return {
            ...savedJob,
            companyName: company?.companyName || savedJob.companyName || 'Unknown Company',
            jobId: {
              ...savedJob.jobId,
              companyId: company || { companyName: 'Unknown Company', logo: null },
            },
          };
        }

        return {
          ...savedJob,
          companyName:
            (typeof savedJob.jobId.customCompanyName === "string"
              ? savedJob.jobId.customCompanyName
              : undefined) ||
            savedJob.companyName ||
            "Unknown Company",
          jobId: {
            ...savedJob.jobId,
            companyId: {
              companyName:
                (typeof savedJob.jobId.customCompanyName === "string"
                  ? savedJob.jobId.customCompanyName
                  : undefined) || "Unknown Company",
              logo: null,
            },
          },
        };
      })
    );
   
    return NextResponse.json({
      success: true,
      data: {
        ...savedJobs,
        savedJobs: savedJobsWithCompany,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get saved jobs error:", error);
    return NextResponse.json({
      error: "Failed to fetch saved jobs"
    }, { status: 500 });
  }
}