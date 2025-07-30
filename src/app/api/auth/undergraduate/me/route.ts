import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import { withUndergradAuth } from "@/lib/auth/undergraduate/middleware";

// Get user profile (protected)
export const GET = withUndergradAuth(async (request: NextRequest, user) => {
  try {
    await connect();
    
    // Find full user data
    const fullUser = await UndergradModel.findById(user.id);
    if (!fullUser) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: {
          id: fullUser._id,
          index: fullUser.index,
          name: fullUser.name,
          nameWithInitials: fullUser.nameWithInitials,
          universityEmail: fullUser.universityEmail,
          batch: fullUser.batch,
          education: fullUser.education,
          birthdate: fullUser.birthdate,
          address: fullUser.address,
          phoneNumber: fullUser.phoneNumber,
          profilePicUrl: fullUser.profilePicUrl,
          jobSearchingStatus: fullUser.jobSearchingStatus,
          isVerified: fullUser.isVerified,
          lastLogin: fullUser.lastLogin,
          createdAt: fullUser.createdAt,
          updatedAt: fullUser.updatedAt
        }
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Get profile error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
});
