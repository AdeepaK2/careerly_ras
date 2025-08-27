import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Job from "@/lib/models/job";
import Application from "@/lib/models/application";
import Company from "@/lib/models/company"; // Import Company model to register it with Mongoose
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Ensure Company model is registered by accessing it
    Company;

    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token given" }, { status: 401 });
    }

    const admin = verifyAdminAccessToken(token);
    if (!admin) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch reported jobs
    const jobs = await Job.find({
      reported: true,
    })
      .populate("companyId", "companyName logo")
      .sort({ reportedAt: -1 })
      .lean();

    // Get applicant counts for each job
    const jobsWithApplicantCount = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({
          jobId: job._id,
        });
        return {
          ...job,
          applicantsCount: applicantCount,
        };
      })
    );

    return NextResponse.json(
      {
        jobs: jobsWithApplicantCount,
        total: jobsWithApplicantCount.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reported jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT endpoint to handle admin actions on reported jobs
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token given" }, { status: 401 });
    }

    const admin = verifyAdminAccessToken(token);
    if (!admin) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { jobId, action, adminNote } = await request.json();

    if (!jobId || !action) {
      return NextResponse.json(
        { error: "Job ID and action are required" },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case "approve":
        updateData = {
          reported: false,
          reportedAt: null,
          reportReason: null,
          adminNote: adminNote || "Report reviewed and approved by admin",
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        };
        break;
      case "remove":
        updateData = {
          status: "closed",
          adminNote: adminNote || "Job removed due to report",
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'approve' or 'remove'" },
          { status: 400 }
        );
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, {
      new: true,
    });

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: `Job ${action}d successfully`,
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling reported job action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
