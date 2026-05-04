import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import { withCompanyAuth } from "@/lib/auth/company/middleware";
import ApplicationModel from "@/lib/models/application";
import JobModel from "@/lib/models/job";
import ShortlistModel from "@/lib/models/shortlist";

function getRelativeTime(dateValue: Date) {
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function getActivityMeta(status: string) {
  switch (status) {
    case "interview_called":
    case "interviewed":
      return {
        type: "interview",
        icon: "📅",
        verb: "Interview scheduled with",
      };
    case "selected":
    case "offered":
    case "accepted":
      return {
        type: "offer",
        icon: "🎉",
        verb: status === "accepted" ? "Offer accepted by" : "Offer extended to",
      };
    case "shortlisted":
      return {
        type: "shortlist",
        icon: "⭐",
        verb: "Shortlisted",
      };
    default:
      return {
        type: "application",
        icon: "📄",
        verb: "New application received for",
      };
  }
}

export const GET = withCompanyAuth(async (_request: NextRequest, user) => {
  try {
    await connect();

    const companyId = user.id;
    const now = new Date();
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const jobs = await JobModel.find({ companyId })
      .select("_id title status deadline posted_date")
      .lean();

    const jobIds = jobs.map((job) => job._id);
    const jobFilter = jobIds.length ? { jobId: { $in: jobIds } } : { _id: null };

    const [
      totalApplications,
      newApplicationsToday,
      interviewsScheduled,
      offersExtended,
      shortlistedCount,
      recentApplications,
      recentShortlists,
    ] = await Promise.all([
      ApplicationModel.countDocuments(jobFilter),
      ApplicationModel.countDocuments({
        ...jobFilter,
        appliedAt: { $gte: since24h },
      }),
      ApplicationModel.countDocuments({
        ...jobFilter,
        status: { $in: ["interview_called", "interviewed"] },
      }),
      ApplicationModel.countDocuments({
        ...jobFilter,
        status: { $in: ["selected", "offered", "accepted"] },
      }),
      ShortlistModel.countDocuments({ companyId }),
      jobIds.length
        ? ApplicationModel.find(jobFilter)
            .sort({ appliedAt: -1 })
            .limit(5)
            .populate({ path: "jobId", select: "title" })
            .populate({ path: "applicantId", select: "name nameWithInitials" })
            .lean()
        : Promise.resolve([]),
      ShortlistModel.find({ companyId })
        .sort({ shortlistedAt: -1 })
        .limit(5)
        .populate({ path: "jobId", select: "title" })
        .populate({ path: "applicantId", select: "name nameWithInitials" })
        .lean(),
    ]);

    const activeJobs = jobs.filter((job) => {
      const deadline = job.deadline ? new Date(job.deadline) : null;
      return job.status === "active" && (!deadline || deadline >= now);
    }).length;

    const recentActivity = [
      ...recentApplications.map((application: any) => {
        const meta = getActivityMeta(application.status);
        const applicantName =
          application.applicantId?.nameWithInitials ||
          application.applicantId?.name ||
          "an applicant";
        const jobTitle = application.jobId?.title || "a job posting";

        return {
          id: `app-${application._id}`,
          type: meta.type,
          message: `${meta.verb} ${applicantName} for ${jobTitle}`,
          time: getRelativeTime(application.appliedAt || application.createdAt),
          icon: meta.icon,
          timestamp: new Date(application.appliedAt || application.createdAt),
        };
      }),
      ...recentShortlists.map((shortlist: any) => {
        const applicantName =
          shortlist.applicantId?.nameWithInitials ||
          shortlist.applicantId?.name ||
          "an applicant";
        const jobTitle = shortlist.jobId?.title || "a job posting";

        return {
          id: `short-${shortlist._id}`,
          type: "shortlist",
          message: `Shortlisted ${applicantName} for ${jobTitle}`,
          time: getRelativeTime(shortlist.shortlistedAt || shortlist.createdAt),
          icon: "⭐",
          timestamp: new Date(shortlist.shortlistedAt || shortlist.createdAt),
        };
      }),
    ]
      .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
      .slice(0, 6)
      .map(({ timestamp, ...item }) => item);

    return NextResponse.json(
      {
        success: true,
        data: {
          stats: {
            activeJobs,
            totalApplications,
            newApplicationsToday,
            interviewsScheduled,
            offersExtended,
            shortlistedCount,
          },
          recentActivity,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Company dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load company dashboard data",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});