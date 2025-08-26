import { NextRequest, NextResponse } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import connectToDatabase from "@/utils/db";
import Application from "@/lib/models/application";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await updateApplicationStatus(request, { params });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await updateApplicationStatus(request, { params });
}

async function updateApplicationStatus(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify JWT token - check Authorization header first, then cookies
    let token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      token = request.cookies.get("token")?.value;
    }
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await verifyCompanyAccessToken(token);
    if (!company) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    const { status } = await request.json();
    const applicationId = params.id;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "applied",
      "shortlisted",
      "interview_called",
      "selected",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the application and verify it belongs to this company
    const application = await Application.findById(applicationId).populate(
      "jobId"
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if ((application.jobId as any).companyId.toString() !== company.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the application status
    application.status = status;
    await application.save();

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
      application: {
        id: application._id,
        status: application.status,
      },
    });
  } catch (error) {
    console.error("Update application status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
