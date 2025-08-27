import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Job from "@/lib/models/job";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Verify user authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token given" }, { status: 401 });
    }

    const user = verifyUndergradAccessToken(token);
    if (!user || !user.valid || !user.payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { jobId, reason, description } = await request.json();

    if (!jobId || !reason) {
      return NextResponse.json(
        { error: "Job ID and reason are required" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if job is already reported
    if (job.reported) {
      return NextResponse.json(
        { error: "This job has already been reported" },
        { status: 400 }
      );
    }

    // Update job with report information
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        reported: true,
        reportReason: reason,
        reportDescription: description,
        reportedBy: user.payload.id,
        reportedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Job reported successfully",
        jobId: updatedJob._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reporting job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
