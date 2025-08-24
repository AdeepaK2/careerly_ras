import { NextRequest, NextResponse } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import connect from "@/utils/db";
import ShortlistModel from "@/lib/models/shortlist";
import ApplicationModel from "@/lib/models/application";
import JobModel from "@/lib/models/job";

// POST: Add to shortlist
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    // Ensure all models are loaded
    ApplicationModel;
    JobModel;

    const { id: applicationId } = await params;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const company = await verifyCompanyAccessToken(token);
    if (!company) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();

    // Get application details and populate job
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Get job details to verify company ownership
    const job = await JobModel.findById(application.jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Verify company owns this job
    if (job.companyId.toString() !== company.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if already shortlisted
    const existingShortlist = await ShortlistModel.findOne({ applicationId });
    if (existingShortlist) {
      return NextResponse.json(
        { error: "Already shortlisted" },
        { status: 400 }
      );
    }

    // Create shortlist entry
    const shortlist = await ShortlistModel.create({
      jobId: application.jobId,
      applicantId: application.applicantId,
      applicationId: applicationId,
      companyId: company.id,
      shortlistedBy: body.shortlistedBy || "Company User",
      notes: body.notes || "",
      priority: body.priority || "medium",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Applicant shortlisted successfully",
        data: shortlist,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Shortlist error:", error);
    return NextResponse.json(
      {
        error: "Failed to shortlist applicant",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove from shortlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    // Ensure all models are loaded
    ApplicationModel;
    JobModel;

    const { id: applicationId } = await params;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const company = await verifyCompanyAccessToken(token);
    if (!company) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find and delete shortlist entry
    const shortlist = await ShortlistModel.findOneAndDelete({
      applicationId,
      companyId: company.id,
    });

    if (!shortlist) {
      return NextResponse.json(
        { error: "Shortlist entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Removed from shortlist",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Remove shortlist error:", error);
    return NextResponse.json(
      {
        error: "Failed to remove from shortlist",
      },
      { status: 500 }
    );
  }
}
