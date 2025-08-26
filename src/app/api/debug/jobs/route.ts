import { NextResponse, NextRequest } from "next/server";
import JobModel from "@/lib/models/job";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergradModel from "@/lib/models/undergraduate";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  
  try {
    await connect();
    
    // Get total job count
    const totalJobs = await JobModel.countDocuments();
    const activeJobs = await JobModel.countDocuments({ status: "active" });
    const pendingJobs = await JobModel.countDocuments({ status: "pending" });
    const closedJobs = await JobModel.countDocuments({ status: "closed" });
    
    // Get all jobs with details
    const allJobs = await JobModel.find()
      .populate({
        path: 'companyId',
        model: CompanyModel,
        select: 'companyName'
      })
      .select('title status qualifiedDegrees posted_date createdAt companyId')
      .sort({ createdAt: -1 });
    
    let userDegreeInfo = null;
    if (token) {
      try {
        const undergrad = await verifyUndergradAccessToken(token);
        if (undergrad?.payload?.id) {
          const undergradProfile = await UndergradModel.findById(undergrad.payload.id);
          if (undergradProfile) {
            userDegreeInfo = {
              id: undergradProfile._id,
              degree: undergradProfile.education?.degreeProgramme,
              name: undergradProfile.personalInfo?.fullName
            };
          }
        }
      } catch (authError) {
        console.log("Auth error in debug:", authError);
      }
    }
    
    // Check which jobs would match the user's degree
    const matchingJobs = userDegreeInfo?.degree 
      ? allJobs.filter(job => job.qualifiedDegrees?.includes(userDegreeInfo.degree))
      : [];

    return NextResponse.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        pendingJobs,
        closedJobs
      },
      userInfo: userDegreeInfo,
      matchingJobsCount: matchingJobs.length,
      jobs: allJobs.map(job => ({
        _id: job._id,
        title: job.title,
        company: job.companyId?.companyName || "Unknown Company",
        status: job.status,
        qualifiedDegrees: job.qualifiedDegrees,
        posted_date: job.posted_date,
        createdAt: job.createdAt,
        matchesUserDegree: userDegreeInfo?.degree ? job.qualifiedDegrees?.includes(userDegreeInfo.degree) : null
      }))
    }, { status: 200 });

  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace"
    }, { status: 500 });
  }
}
