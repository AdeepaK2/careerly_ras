import { NextRequest, NextResponse } from "next/server";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";
import connect from "@/utils/db";
import ApplicationModel from "@/lib/models/application";
import JobModel from "@/lib/models/job";
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

    const body = await req.json();

    // Get undergraduate profile for degree information
    const undergradProfile = await UndergradModel.findById(undergrad.payload.id);
    if (!undergradProfile) {
      return NextResponse.json({ error: "Undergraduate profile not found" }, { status: 404 });
    }

    if (!undergradProfile.cvUrl) {
      return NextResponse.json({ error: "CV is required to apply! Upload your CV in the profile tab." }, { status: 400 });
    }

    // Create application
    const application = await ApplicationModel.create({
      jobId: jobId,
      applicantId: undergrad.payload.id,
      applicantDegree: undergradProfile.education.degreeProgramme,
      expectingSalary: body.expectingSalary || 0,
      skills: undergradProfile.skills || [],
      cv: undergradProfile.cvUrl,
      coverLetter: body.coverLetter || "",
      appliedAt: new Date(),
    });

    // Update job applicants count
    await JobModel.findByIdAndUpdate(jobId, {
      $inc: { applicantsCount: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        data: {
          applicationId: application._id,
          status: application.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Job application error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit application",
      },
      { status: 500 }
    );
  }
}
