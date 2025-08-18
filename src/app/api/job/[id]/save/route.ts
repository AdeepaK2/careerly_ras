import { NextRequest, NextResponse } from "next/server";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();

    const awaitedParams = await params;
    const jobId = awaitedParams.id;

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const undergrad = await verifyUndergradAccessToken(token);
    if (!undergrad || !undergrad.payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find the undergraduate
    const undergradProfile = await UndergradModel.findById(undergrad.payload.id);
    if (!undergradProfile) {
      return NextResponse.json({ error: "Undergraduate profile not found" }, { status: 404 });
    }

    const isAlreadySaved = undergradProfile.savedJobs?.some(
      (savedJob: any) => savedJob.jobId.toString() === jobId
    );

    if (isAlreadySaved) {
      return NextResponse.json({ error: "Job already saved" }, { status: 400 });
    }

    undergradProfile.savedJobs.push({
      jobId: jobId,
      savedAt: new Date()
    });

    await undergradProfile.save();

    return NextResponse.json({
      success: true,
      message: "Job saved successfully"
    }, { status: 201 });

  } catch (error: any) {
    console.error("Save job error:", error);
    return NextResponse.json({
      error: "Failed to save job"
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();

    const awaitedParams = await params;
    const jobId = awaitedParams.id;

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const undergrad = await verifyUndergradAccessToken(token);
    if (!undergrad || !undergrad.payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const result = await UndergradModel.findByIdAndUpdate(
      undergrad.payload.id,
      {
        $pull: {
          savedJobs: { jobId: jobId }
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: "Undergraduate not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Job removed from saved jobs"
    }, { status: 200 });

  } catch (error: any) {
    console.error("Remove saved job error:", error);
    return NextResponse.json({
      error: "Failed to remove saved job"
    }, { status: 500 });
  }
}
