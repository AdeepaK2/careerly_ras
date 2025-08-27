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

    // Get current date to filter expired jobs
    const currentDate = new Date();

    // Fetch expired jobs (deadline has passed)
    const jobs = await Job.find({
      deadline: { $lt: currentDate },
    })
      .populate("companyId", "companyName logo")
      .sort({ deadline: -1 })
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
    console.error("Error fetching expired jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
