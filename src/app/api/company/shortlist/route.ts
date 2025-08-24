import { NextRequest, NextResponse } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import connect from "@/utils/db";
import ShortlistModel from "@/lib/models/shortlist";
import ApplicationModel from "@/lib/models/application";
import JobModel from "@/lib/models/job";
import UndergradModel from "@/lib/models/undergraduate";

// GET: Get all shortlisted applicants across all company jobs
export async function GET(req: NextRequest) {
  try {
    await connect();

    // Ensure all models are loaded for populate operations
    ApplicationModel;
    JobModel;
    UndergradModel;

    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const company = await verifyCompanyAccessToken(token);
    if (!company) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const shortlisted = await ShortlistModel.find({ companyId: company.id })
      .populate({
        path: "jobId",
        select: "title category location jobType",
      })
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
    console.error("Get company shortlist error:", error);
    return NextResponse.json(
      {
        error: "Failed to get shortlisted applicants",
      },
      { status: 500 }
    );
  }
}
