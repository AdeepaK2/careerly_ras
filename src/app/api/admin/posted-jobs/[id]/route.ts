import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Job from "@/lib/models/job";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const params = await context.params;
    const jobId = params.id;

    // Find the job and verify it was posted by an admin
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!job.postedByAdmin) {
      return NextResponse.json(
        { error: "This job was not posted by an admin" },
        { status: 403 }
      );
    }

    // Delete the job
    await Job.findByIdAndDelete(jobId);

    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin posted job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const params = await context.params;
    const jobId = params.id;
    const body = await request.json();

    // Find the job and verify it was posted by an admin
    const existingJob = await Job.findById(jobId);
    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!existingJob.postedByAdmin) {
      return NextResponse.json(
        { error: "This job was not posted by an admin" },
        { status: 403 }
      );
    }

    // Update the job with new data
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        ...body,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Job updated successfully",
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating admin posted job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
