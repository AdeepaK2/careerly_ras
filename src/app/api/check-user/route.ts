import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get a specific user to check their actual fields
    const user = await UndergradModel.findOne({}).lean();
    
    return NextResponse.json({
      success: true,
      data: {
        user: user,
        fieldsCheck: {
          hasSkills: user?.hasOwnProperty('skills'),
          hasCvUrl: user?.hasOwnProperty('cvUrl'),
          hasResumeUrl: user?.hasOwnProperty('resumeUrl'),
          skillsValue: (user as any)?.skills,
          cvUrlValue: (user as any)?.cvUrl,
          resumeUrlValue: (user as any)?.resumeUrl
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Check user error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to check user",
      error: error.message
    }, { status: 500 });
  }
}
