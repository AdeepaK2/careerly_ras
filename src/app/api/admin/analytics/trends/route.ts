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
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get daily trends for the specified period
    const userRegistrationTrends = await UndergradModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const companyRegistrationTrends = await CompanyModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const jobPostingTrends = await JobModel.aggregate([
      {
        $match: {
          posted_date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$posted_date" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const applicationTrends = await ApplicationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get job categories data
    const jobCategories = await JobModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get application status distribution
    const applicationStatus = await ApplicationModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        userRegistrationTrends: userRegistrationTrends.map((item) => ({
          date: item._id,
          students: item.count,
        })),
        companyRegistrationTrends: companyRegistrationTrends.map((item) => ({
          date: item._id,
          companies: item.count,
        })),
        jobPostingTrends: jobPostingTrends.map((item) => ({
          date: item._id,
          jobs: item.count,
        })),
        applicationTrends: applicationTrends.map((item) => ({
          date: item._id,
          applications: item.count,
        })),
        jobCategories: jobCategories.map((item) => ({
          category: item._id || "Uncategorized",
          count: item.count,
        })),
        applicationStatus: applicationStatus.map((item) => ({
          status: item._id || "pending",
          count: item.count,
        })),
      },
    });
  } catch (error: any) {
    console.error("Analytics trends error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics trends",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler as any);
