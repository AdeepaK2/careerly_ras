import { NextRequest, NextResponse } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import connect from "@/utils/db";
import ShortlistModel from "@/lib/models/shortlist";
import JobModel from "@/lib/models/job";
import ApplicationModel from "@/lib/models/application";
import UndergradModel from "@/lib/models/undergraduate";

// GET: Get all shortlisted applicants for a job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    // Ensure all models are loaded for populate operations
    ApplicationModel;
    UndergradModel;

    const { id: jobId } = await params;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const company = await verifyCompanyAccessToken(token);
    if (!company) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify company owns this job
    const job = await JobModel.findById(jobId);
    if (!job || job.companyId.toString() !== company.id) {
      return NextResponse.json(
        { error: "Job not found or unauthorized" },
        { status: 403 }
      );
    }

    // Get shortlisted applications with applicant details
    const shortlisted = await ShortlistModel.find({ jobId })
      .populate({
        path: "applicantId",
        select: "firstName lastName universityEmail education skills",
      })
      .populate({
        path: "applicationId",
        select: "cv coverLetter appliedAt status",
      })
      .sort({ shortlistedAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: shortlisted,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get shortlist error:", error);
    return NextResponse.json(
      {
        error: "Failed to get shortlisted applicants",
      },
      { status: 500 }
    );
  }
}
