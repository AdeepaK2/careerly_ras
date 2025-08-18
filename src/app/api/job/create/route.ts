import { NextResponse,NextRequest } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import JobModel from "@/lib/models/job";
import  connect  from "@/utils/db";


connect();

export async function POST(req: NextRequest){
  const token= req.headers.get("authorization")?.replace("Bearer ", "");
  if(!token){
    return NextResponse.json({ error:"No token Given"},{status: 401});
  }

  const company= await verifyCompanyAccessToken(token);

  if(!company){
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();

  if(!body || !body.title || !body.description || !body.jobType || !body.category || 
     !body.workPlaceType || !body.location || !body.deadline || !body.qualifiedDegrees || 
     !Array.isArray(body.qualifiedDegrees) || body.qualifiedDegrees.length === 0) {
    return NextResponse.json({ error: "Missing required fields or invalid qualifiedDegrees" }, { status: 400 });
  }

  //create the job
  try{
    const jobData: {
      title: any;
      description: any;
      jobType: any;
      category: any;
      workPlaceType: any;
      location: any;
      deadline: Date;
      qualifiedDegrees: any;
      skillsRequired: any;
      companyId: string;
      salaryRange?: { min: number; max: number };
    } = {
      title: body.title,
      description: body.description,
      jobType: body.jobType,
      category: body.category,
      workPlaceType: body.workPlaceType,
      location: body.location,
      deadline: new Date(body.deadline),
      qualifiedDegrees: body.qualifiedDegrees,
      skillsRequired: body.skillsRequired || [],
      companyId: company.id,
    };

    // Add salaryRange if provided
    if (body.salaryRange && (body.salaryRange.min > 0 || body.salaryRange.max > 0)) {
      jobData.salaryRange = {
        min: body.salaryRange.min || 0,
        max: body.salaryRange.max || 0,
      };
    }

    const job = await JobModel.create(jobData);

    return NextResponse.json({ message: "Job created successfully", job }, { status: 201 });

  }catch(error){
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }


}