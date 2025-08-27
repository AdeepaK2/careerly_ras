import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Job from "@/lib/models/job";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: jobId } = await params;
    const body = await request.json();

    // Find the job
    const existingJob = await Job.findById(jobId);
    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if this is an admin-posted job
    if (!existingJob.postedByAdmin) {
      return NextResponse.json(
        { error: "Can only edit admin-posted jobs" },
        { status: 403 }
      );
    }

    // Update the job with new data
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        title: body.title,
        customCompanyName: body.customCompanyName,
        description: body.description,
        jobType: body.jobType,
        category: body.category,
        workPlaceType: body.workPlaceType,
        location: body.location,
        deadline: body.deadline,
        salaryRange: body.salaryRange,
        qualifiedDegrees: body.qualifiedDegrees,
        skillsRequired: body.skillsRequired,
        companyWebsite: body.companyWebsite,
        originalAdLink: body.originalAdLink,
        status: body.status,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        message: "Job updated successfully",
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: jobId } = await params;
    const job = await Job.findById(jobId).populate(
      "companyId",
      "companyName logo"
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: jobId } = await params;

    // Find the job
    const existingJob = await Job.findById(jobId);
    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if this is an admin-posted job
    if (!existingJob.postedByAdmin) {
      return NextResponse.json(
        { error: "Can only delete admin-posted jobs" },
        { status: 403 }
      );
    }

    await Job.findByIdAndDelete(jobId);

    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
