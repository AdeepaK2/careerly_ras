import { NextResponse, NextRequest } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import JobModel from "@/lib/models/job";
import connect from "@/utils/db";

connect();

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "No token given" }, { status: 401 });
  }

  const company = await verifyCompanyAccessToken(token);
  if (!company) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const jobs = await JobModel.find({ companyId: company.id }).sort({ posted_date: -1 });
    
    return NextResponse.json({ 
      jobs: jobs 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
