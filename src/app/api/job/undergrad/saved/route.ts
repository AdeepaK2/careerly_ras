import { NextRequest, NextResponse } from "next/server";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const undergrad = await verifyUndergradAccessToken(token);
    if (!undergrad || !undergrad.payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get undergraduate with saved jobs
    const undergradProfile = await UndergradModel.findById(undergrad.payload.id)
      .select('savedJobs')
      .lean();

    if (!undergradProfile) {
      return NextResponse.json({ error: "Undergraduate not found" }, { status: 404 });
    }

    // Extract job IDs
    const savedJobIds = undergradProfile.savedJobs?.map((savedJob: any) => 
      savedJob.jobId.toString()
    ) || [];

    return NextResponse.json({
      success: true,
      data: savedJobIds
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get saved jobs error:", error);
    return NextResponse.json({
      error: "Failed to fetch saved jobs"
    }, { status: 500 });
  }
}