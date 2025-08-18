import { NextResponse, NextRequest } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import JobModel from "@/lib/models/job";
import connect from "@/utils/db";

connect();

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {

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

  try {
    const job = await JobModel.findOneAndDelete({ 
      _id: jobId, 
      companyId: company.id 
    });
    
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Job deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
