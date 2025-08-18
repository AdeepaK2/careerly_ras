import { NextResponse, NextRequest } from "next/server";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";
import JobModel from "@/lib/models/job";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "No token given" }, { status: 401 });
  }

  const undergrad = await verifyUndergradAccessToken(token);
  if (!undergrad || !undergrad.payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    await connect();

    // Fetch ALL active job opportunities (no degree filtering)
    const jobs = await JobModel.find({
      status: "active"
    })
    .populate({
      path: 'companyId',
      model: CompanyModel, 
      select: 'companyName' 
    })
    .sort({ posted_date: -1 });

    return NextResponse.json(
      {
        jobs: jobs,
        warning: "These jobs include positions that may not match your degree program"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching all job opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch job opportunities" },
      { status: 500 }
    );
  }
}
