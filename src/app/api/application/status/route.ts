import { NextRequest, NextResponse } from "next/server";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";
import connectToDatabase from "@/utils/db";
import ApplicationModel from "@/lib/models/application";
import JobModel from "@/lib/models/job";
import CompanyModel from "@/lib/models/company";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Ensure models are registered
    JobModel;
    CompanyModel;
    ApplicationModel;

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const undergrad = await verifyUndergradAccessToken(token);
    if (!undergrad || !undergrad.payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get all applications for this undergraduate with populated job details
    const applications = await ApplicationModel.find({
      applicantId: undergrad.payload.id
    })
    .populate({
      path: 'jobId',
      select: 'title companyId jobType location deadline'
    })
    .sort({ appliedAt: -1 })
    .lean();

    // Manually populate company details for each job
    const applicationsWithCompany = await Promise.all(
      applications.map(async (app: any) => {
        if (app.jobId && app.jobId.companyId) {
          const company = await CompanyModel.findById(app.jobId.companyId)
            .select('companyName logo')
            .lean();
          
          return {
            ...app,
            jobId: {
              ...app.jobId,
              companyId: company || { companyName: 'Unknown Company', logo: null }
            }
          };
        }
        return app;
      })
    );

    // Transform the data to include status information
    const applicationsWithStatus = applicationsWithCompany.map(app => ({
      _id: app._id,
      applicationId: app._id,
      jobId: app.jobId,
      status: app.status,
      appliedAt: app.appliedAt,
      coverLetter: app.coverLetter,
      cv: app.cv,
      specialRequirements: app.specialRequirements,
      // Add status display information
      statusInfo: getStatusInfo(app.status),
      // Add formatted dates
      appliedDate: new Date(app.appliedAt).toLocaleDateString(),
      appliedTimeAgo: getTimeAgo(app.appliedAt)
    }));

    return NextResponse.json({
      success: true,
      data: applicationsWithStatus
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get applications with status error:", error);
    return NextResponse.json({
      error: "Failed to fetch applications"
    }, { status: 500 });
  }
}

// Helper function to get status display information
function getStatusInfo(status: string) {
  const statusMap = {
    'applied': {
      label: 'Applied',
      color: 'bg-blue-100 text-blue-800',
      icon: '📝',
      description: 'Your application has been submitted and is under review.'
    },
    'shortlisted': {
      label: 'Shortlisted',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⭐',
      description: 'Great news! You have been shortlisted by the company.'
    },
    'interview_called': {
      label: 'Interview Called',
      color: 'bg-orange-100 text-orange-800',
      icon: '📞',
      description: 'You have been called for an interview. Check your email for details.'
    },
    'interviewed': {
      label: 'Interviewed',
      color: 'bg-purple-100 text-purple-800',
      icon: '🎯',
      description: 'You have completed the interview process.'
    },
    'selected': {
      label: 'Selected',
      color: 'bg-green-100 text-green-800',
      icon: '🎉',
      description: 'Congratulations! You have been selected for this position.'
    },
    'offered': {
      label: 'Job Offered',
      color: 'bg-emerald-100 text-emerald-800',
      icon: '💼',
      description: 'You have received a job offer. Check your email for details.'
    },
    'accepted': {
      label: 'Offer Accepted',
      color: 'bg-teal-100 text-teal-800',
      icon: '✅',
      description: 'You have accepted the job offer.'
    },
    'rejected': {
      label: 'Not Selected',
      color: 'bg-red-100 text-red-800',
      icon: '❌',
      description: 'Unfortunately, you were not selected for this position.'
    }
  };

  return statusMap[status as keyof typeof statusMap] || {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800',
    icon: '❓',
    description: 'Status information is not available.'
  };
}

// Helper function to get time ago
function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now.getTime() - past.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
}
