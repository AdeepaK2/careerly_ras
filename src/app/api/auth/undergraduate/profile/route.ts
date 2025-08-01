import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import { verifyUndergradAuth } from "@/lib/auth/undergraduate/middleware";

// Get user profile (protected)
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Authenticate user
    const authResult = await verifyUndergradAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: authResult.error || "Authentication failed"
      }, { status: 401 });
    }
    
    // Find full user data
    const user = await UndergradModel.findById(authResult.user.id);
    if (!user) {
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
          id: user._id,
          index: user.index,
          name: user.name,
          nameWithInitials: user.nameWithInitials,
          universityEmail: user.universityEmail,
          batch: user.batch,
          education: user.education,
          birthdate: user.birthdate,
          address: user.address,
          phoneNumber: user.phoneNumber,
          profilePicUrl: user.profilePicUrl,
          jobSearchingStatus: user.jobSearchingStatus,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
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
}

// Update user profile (protected)
export async function PUT(request: NextRequest) {
  try {
    await connect();
    
    // Authenticate user
    const authResult = await verifyUndergradAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: authResult.error || "Authentication failed"
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Add user ID to the update data
    body.index = authResult.user.index; // Ensure index remains the same
    
    // Basic validation - remove sensitive fields that shouldn't be updated
    const updateData = { ...body };
    delete updateData.password;
    delete updateData.isVerified;
    delete updateData.refreshTokens;
    delete updateData.emailVerificationToken;
    delete updateData.passwordResetToken;
    delete updateData._id;
    delete updateData.id;
    
    // Update user
    const updatedUser = await UndergradModel.findByIdAndUpdate(
      authResult.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          index: updatedUser.index,
          name: updatedUser.name,
          nameWithInitials: updatedUser.nameWithInitials,
          universityEmail: updatedUser.universityEmail,
          batch: updatedUser.batch,
          education: updatedUser.education,
          birthdate: updatedUser.birthdate,
          address: updatedUser.address,
          phoneNumber: updatedUser.phoneNumber,
          profilePicUrl: updatedUser.profilePicUrl,
          jobSearchingStatus: updatedUser.jobSearchingStatus,
          isVerified: updatedUser.isVerified,
          lastLogin: updatedUser.lastLogin,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Update profile error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((err: any) => err.message)
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
