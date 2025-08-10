import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    console.log("Starting field addition for undergraduate users...");

    // First, let's check one user before update
    const beforeUser = await UndergradModel.findOne({}).select('index name cvUrl resumeUrl skills').lean();
    console.log("User BEFORE update:", beforeUser);

    // Update all users one by one to be more explicit
    const users = await UndergradModel.find({}).select('_id');
    console.log(`Found ${users.length} users to update`);

    let updated = 0;
    for (const user of users) {
      try {
        const result = await UndergradModel.findByIdAndUpdate(
          user._id,
          {
            cvUrl: null,
            resumeUrl: null,
            skills: []
          },
          { new: true, strict: false }
        );
        if (result) {
          updated++;
          console.log(`Updated user ${user._id}`);
        }
      } catch (error) {
        console.error(`Error updating user ${user._id}:`, error);
      }
    }

    // Check one user after update
    const afterUser = await UndergradModel.findOne({}).lean();
    console.log("User AFTER update:", {
      id: (afterUser as any)?._id,
      index: (afterUser as any)?.index,
      name: (afterUser as any)?.name,
      hasSkills: afterUser?.hasOwnProperty('skills'),
      hasCvUrl: afterUser?.hasOwnProperty('cvUrl'),
      hasResumeUrl: afterUser?.hasOwnProperty('resumeUrl'),
      skillsValue: (afterUser as any)?.skills,
      cvUrlValue: (afterUser as any)?.cvUrl,
      resumeUrlValue: (afterUser as any)?.resumeUrl
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updated} out of ${users.length} users`,
      data: {
        totalUsers: users.length,
        updatedUsers: updated,
        afterUser: {
          id: (afterUser as any)?._id,
          hasSkills: afterUser?.hasOwnProperty('skills'),
          hasCvUrl: afterUser?.hasOwnProperty('cvUrl'),
          hasResumeUrl: afterUser?.hasOwnProperty('resumeUrl')
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Field addition error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to add fields",
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check current status
    const totalUsers = await UndergradModel.countDocuments();
    const usersWithSkills = await UndergradModel.countDocuments({
      skills: { $exists: true }
    });
    const usersWithCvUrl = await UndergradModel.countDocuments({
      cvUrl: { $exists: true }
    });
    const usersWithResumeUrl = await UndergradModel.countDocuments({
      resumeUrl: { $exists: true }
    });

    // Get a sample user
    const sampleUser = await UndergradModel.findOne({}).select('index name cvUrl resumeUrl skills');

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        usersWithSkills,
        usersWithCvUrl,
        usersWithResumeUrl,
        allFieldsPresent: usersWithSkills === totalUsers && usersWithCvUrl === totalUsers && usersWithResumeUrl === totalUsers,
        sampleUser
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to check status",
      error: error.message
    }, { status: 500 });
  }
}
