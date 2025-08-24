import { NextRequest, NextResponse } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import connect from "@/utils/db";
import ApplicationModel from "@/lib/models/application";
import JobModel from "@/lib/models/job";
import UndergradModel from "@/lib/models/undergraduate";

// GET: Get all applications for a specific job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    // Ensure all models are loaded for populate operations
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

    // Get URL search parameters for pagination and filtering
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");
    const degree = url.searchParams.get("degree");

    // Build filter query
    let filter: any = { jobId };
    if (status) {
      filter.status = status;
    }
    if (degree) {
      filter.applicantDegree = degree;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get applications with applicant details
    const applications = await ApplicationModel.find(filter)
      .populate({
        path: "applicantId",
        select: "firstName lastName universityEmail education skills",
      })
      .select("cv coverLetter appliedAt status specialRequirements")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await ApplicationModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        data: applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      {
        error: "Failed to get applications",
      },
      { status: 500 }
    );
  }
}
