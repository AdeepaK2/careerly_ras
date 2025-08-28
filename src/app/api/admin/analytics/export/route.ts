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
    const format = searchParams.get("format") || "json"; // json, csv
    const type = searchParams.get("type") || "summary"; // summary, users, companies, jobs, applications
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query: any = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let data: any = {};

    switch (type) {
      case "summary":
        data = await generateSummaryReport(query);
        break;
      case "users":
        data = await generateUsersReport(query);
        break;
      case "companies":
        data = await generateCompaniesReport(query);
        break;
      case "jobs":
        data = await generateJobsReport(query);
        break;
      case "applications":
        data = await generateApplicationsReport(query);
        break;
      default:
        data = await generateSummaryReport(query);
    }

    if (format === "csv") {
      const csv = convertToCSV(data, type);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-report-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data,
      generatedAt: new Date().toISOString(),
      reportType: type,
      dateRange: { startDate, endDate },
    });
  } catch (error: any) {
    console.error("Export report error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate report",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

async function generateSummaryReport(query: any) {
  const totalUsers = await UndergradModel.countDocuments(query);
  const totalCompanies = await CompanyModel.countDocuments(query);
  const totalJobs = await JobModel.countDocuments(query);
  const totalApplications = await ApplicationModel.countDocuments(query);

  const verifiedCompanies = await CompanyModel.countDocuments({
    ...query,
    isVerified: true,
  });
  const verifiedUsers = await UndergradModel.countDocuments({
    ...query,
    isVerified: true,
  });

  return {
    summary: {
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      verifiedUsers,
      verifiedCompanies,
      verificationRate: {
        users:
          totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0,
        companies:
          totalCompanies > 0
            ? ((verifiedCompanies / totalCompanies) * 100).toFixed(2)
            : 0,
      },
    },
  };
}

async function generateUsersReport(query: any) {
  const users = await UndergradModel.find(query)
    .select("name email faculty university_name createdAt isVerified lastLogin")
    .sort({ createdAt: -1 });

  return { users };
}

async function generateCompaniesReport(query: any) {
  const companies = await CompanyModel.find(query)
    .select("companyName email industry website createdAt isVerified lastLogin")
    .sort({ createdAt: -1 });

  return { companies };
}

async function generateJobsReport(query: any) {
  const jobs = await JobModel.find(query)
    .populate("companyId", "companyName")
    .select(
      "title category type location salary posted_date deadline companyId"
    )
    .sort({ posted_date: -1 });

  return { jobs };
}

async function generateApplicationsReport(query: any) {
  const applications = await ApplicationModel.find(query)
    .populate("jobId", "title")
    .populate("undergradId", "name email")
    .populate("companyId", "companyName")
    .select("jobId undergradId companyId status createdAt")
    .sort({ createdAt: -1 });

  return { applications };
}

function convertToCSV(data: any, type: string): string {
  switch (type) {
    case "summary":
      return (
        `Metric,Value\n` +
        `Total Users,${data.summary.totalUsers}\n` +
        `Total Companies,${data.summary.totalCompanies}\n` +
        `Total Jobs,${data.summary.totalJobs}\n` +
        `Total Applications,${data.summary.totalApplications}\n` +
        `Verified Users,${data.summary.verifiedUsers}\n` +
        `Verified Companies,${data.summary.verifiedCompanies}\n` +
        `User Verification Rate,${data.summary.verificationRate.users}%\n` +
        `Company Verification Rate,${data.summary.verificationRate.companies}%`
      );

    case "users":
      const userHeaders =
        "Name,Email,Faculty,University,Created At,Verified,Last Login";
      const userRows = data.users
        .map(
          (user: any) =>
            `"${user.name}","${user.email}","${user.faculty || ""}","${
              user.university_name || ""
            }","${user.createdAt}","${user.isVerified}","${
              user.lastLogin || ""
            }"`
        )
        .join("\n");
      return `${userHeaders}\n${userRows}`;

    case "companies":
      const companyHeaders =
        "Company Name,Email,Industry,Website,Created At,Verified,Last Login";
      const companyRows = data.companies
        .map(
          (company: any) =>
            `"${company.companyName}","${company.email}","${
              company.industry || ""
            }","${company.website || ""}","${company.createdAt}","${
              company.isVerified
            }","${company.lastLogin || ""}"`
        )
        .join("\n");
      return `${companyHeaders}\n${companyRows}`;

    case "jobs":
      const jobHeaders =
        "Title,Category,Type,Location,Salary,Posted Date,Deadline,Company";
      const jobRows = data.jobs
        .map(
          (job: any) =>
            `"${job.title}","${job.category || ""}","${job.type || ""}","${
              job.location || ""
            }","${job.salary || ""}","${job.posted_date}","${
              job.deadline || ""
            }","${job.companyId?.companyName || ""}"`
        )
        .join("\n");
      return `${jobHeaders}\n${jobRows}`;

    case "applications":
      const appHeaders =
        "Job Title,Student Name,Student Email,Company,Status,Applied Date";
      const appRows = data.applications
        .map(
          (app: any) =>
            `"${app.jobId?.title || ""}","${app.undergradId?.name || ""}","${
              app.undergradId?.email || ""
            }","${app.companyId?.companyName || ""}","${app.status}","${
              app.createdAt
            }"`
        )
        .join("\n");
      return `${appHeaders}\n${appRows}`;

    default:
      return "No data available";
  }
}

export const GET = withAdminAuth(handler as any);
