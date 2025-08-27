import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Job from "@/lib/models/job";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";

export async function PATCH(
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
    const { status } = await request.json();

    // Validate status
    if (!["active", "closed", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

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

    // Update the job status
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        status: status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: `Job status updated to ${status}`,
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
