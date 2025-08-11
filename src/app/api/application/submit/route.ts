import { verify } from "crypto";
import { NextRequest,NextResponse } from "next/server";
import { verifyUndergradAuth } from "@/lib/auth/undergraduate/middleware";
import connect from "@/utils/db";
import ApplicationModel from "@/lib/models/application";



connect();


export async function POST(req: NextRequest, res: NextResponse) {
  const authResult=verifyUndergradAuth(req);
    if(!authResult.success || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body= await req.json();

  if( !body){
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const application = await  ApplicationModel.create({
    jobId: body.jobId,
    applicantId: authResult.user.id,
    applicantDegree: body.applicantDegree,
    expectingSalary: body.expectingSalary,
    skills: body.skills,
    cv: body.cv,
    coverLetter: body.coverLetter,
    status: body.status,
    appliedAt: body.appliedAt,
    interviewCall: body.interviewCall
  });

  return NextResponse.json(application, { status: 201 });
}

