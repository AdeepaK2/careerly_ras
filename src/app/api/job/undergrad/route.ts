import { NextResponse, NextRequest } from "next/server";
import { verifyUndergradAccessToken } from "@/lib/auth/undergraduate/jwt";
import JobModel from "@/lib/models/job";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
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

    // Fetch the undergraduate profile
    const undergradProfile = await UndergradModel.findById(
      undergrad.payload.id
    );

    // Fetch job opportunities based on the undergraduate degree
    const jobs = await JobModel.find({
      qualifiedDegrees: undergradProfile.education.degreeProgramme,
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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching job opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch job opportunities" },
      { status: 500 }
    );
  }
}
