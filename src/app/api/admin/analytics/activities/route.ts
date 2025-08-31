import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergradModel from "@/lib/models/undergraduate";
import JobModel from "@/lib/models/job";
import ApplicationModel from "@/lib/models/application";
import { withAdminAuth } from "@/lib/auth/admin/middleware";

async function handler(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get recent activities
    const recentStudents = await UndergradModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit / 4)
      .select("name email createdAt faculty");

    const recentCompanies = await CompanyModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit / 4)
      .select("companyName email createdAt isVerified");

    const recentJobs = await JobModel.find({})
      .sort({ posted_date: -1 })
      .limit(limit / 4)
      .populate("companyId", "companyName")
      .select("title companyId posted_date category");

    const recentApplications = await ApplicationModel.find({})
      .sort({ appliedAt: -1 })
      .limit(limit / 4)
      .populate("jobId", "title")
      .populate("applicantId", "name")
      .select("jobId applicantId appliedAt status");

    const activities: Array<{
      id: string;
      type: string;
      message: string;
      timestamp: string;
      data?: any;
    }> = [];

    // Add student registrations
    recentStudents.forEach((student) => {
      activities.push({
        id: `student-${student._id}`,
        type: "user_registration",
        message: `New student registered: ${student.name} (${
          student.faculty || "Faculty not specified"
        })`,
        timestamp: student.createdAt.toISOString(),
        data: { userId: student._id, email: student.email },
      });
    });

    // Add company registrations
    recentCompanies.forEach((company) => {
      activities.push({
        id: `company-${company._id}`,
        type: company.isVerified
          ? "company_verification"
          : "company_registration",
        message: company.isVerified
          ? `Company verification approved: ${company.companyName}`
          : `New company registered: ${company.companyName}`,
        timestamp: company.createdAt.toISOString(),
        data: {
          companyId: company._id,
          email: company.email,
          isVerified: company.isVerified,
        },
      });
    });

    // Add job postings
    recentJobs.forEach((job) => {
      activities.push({
        id: `job-${job._id}`,
        type: "job_posting",
        message: `New job posted: ${job.title} at ${
          (job.companyId as any)?.companyName || "Unknown Company"
        }`,
        timestamp: job.posted_date.toISOString(),
        data: { jobId: job._id, category: job.category },
      });
    });

    // Add applications
    recentApplications.forEach((application) => {
      activities.push({
        id: `app-${application._id}`,
        type: "application_submitted",
        message: `Application submitted: ${
          (application.applicantId as any)?.name || "Unknown Student"
        } applied for ${(application.jobId as any)?.title || "Unknown Job"}`,
        timestamp: application.appliedAt.toISOString(),
        data: { applicationId: application._id, status: application.status },
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      data: {
        activities: activities.slice(0, limit),
      },
    });
  } catch (error: any) {
    console.error("Recent activities error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recent activities",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler as any);
