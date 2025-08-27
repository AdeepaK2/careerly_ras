import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Job from "@/lib/models/job";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";

export async function GET(request: NextRequest) {
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

    // Fetch all jobs posted by admins
    const jobs = await Job.find({ postedByAdmin: true })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Use lean() for better performance

    // Add applicants count (placeholder - you might need to join with applications collection)
    const jobsWithApplicantCount = jobs.map((job) => ({
      ...job,
      applicantsCount: 0, // TODO: Calculate actual applicant count from applications collection
    }));

    return NextResponse.json(
      {
        jobs: jobsWithApplicantCount,
        total: jobs.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin posted jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
