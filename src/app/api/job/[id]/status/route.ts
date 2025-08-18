import { NextResponse, NextRequest } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import JobModel from "@/lib/models/job";
import connect from "@/utils/db";

connect();

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  
  const params = await context.params;
  const jobId = params.id;

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "No token given" }, { status: 401 });
  }

  const company = await verifyCompanyAccessToken(token);
  if (!company) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.status || !["active", "closed", "pending"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const job = await JobModel.findOneAndUpdate(
      { _id: jobId, companyId: company.id },
      { status: body.status },
      { new: true }
    );
    
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Job status updated successfully",
      job: job 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json({ error: "Failed to update job status" }, { status: 500 });
  }
}
