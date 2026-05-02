import { NextRequest, NextResponse } from "next/server";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";
import connect from "@/utils/db";
import ApplicationModel from "@/lib/models/application";
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

    // Get applied jobs for a specific undergrad
    const applications = await ApplicationModel.find({
      applicantId: undergrad.payload.id
    })
      .populate({
        path: "jobId",
        select: "title companyId customCompanyName jobType location deadline salaryRange"
      })
      .sort({ appliedAt: -1 })
      .lean();

    const applicationsWithCompany = await Promise.all(
      applications.map(async (app: any) => {
        if (!app.jobId) {
          return {
            ...app,
            jobId: {
              _id: "deleted-job",
              title: "Job no longer available",
              companyId: { companyName: "Unknown Company", logo: null },
              jobType: "N/A",
              location: "N/A",
              deadline: null,
            },
          };
        }

        if (app.jobId.companyId) {
          const company = await CompanyModel.findById(app.jobId.companyId)
            .select("companyName logo")
            .lean();

          return {
            ...app,
            jobId: {
              ...app.jobId,
              companyId: company || { companyName: "Unknown Company", logo: null },
            },
          };
        }

        return {
          ...app,
          jobId: {
            ...app.jobId,
            companyId: {
              companyName: app.jobId.customCompanyName || "Unknown Company",
              logo: null,
            },
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: applicationsWithCompany
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get applied jobs error:", error);
    return NextResponse.json({
      error: "Failed to fetch applied jobs"
    }, { status: 500 });
  }
}