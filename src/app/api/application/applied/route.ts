import { NextRequest, NextResponse } from "next/server";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";
import connect from "@/utils/db";
import ApplicationModel from "@/lib/models/application";

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

    // Get applied jobs for a specific undergrad
    const applications = await ApplicationModel.find({
      applicantId: undergrad.payload.id
    }).populate("jobId")



    return NextResponse.json({
      success: true,
      data: applications
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get applied jobs error:", error);
    return NextResponse.json({
      error: "Failed to fetch applied jobs"
    }, { status: 500 });
  }
}