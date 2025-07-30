import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('undergrad_refresh_token')?.value;
    
    if (refreshToken) {
      // Remove the specific refresh token from user's tokens
      await UndergradModel.updateMany(
        { 'refreshTokens.token': refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    }, { status: 200 });
    
    // Clear the refresh token cookie
    response.cookies.set('undergrad_refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });
    
    return response;
    
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Logout from all devices
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    
    // Get refresh token from cookie to identify the user
    const refreshToken = request.cookies.get('undergrad_refresh_token')?.value;
    
    if (refreshToken) {
      // Find user and clear all refresh tokens
      const user = await UndergradModel.findOne({ 'refreshTokens.token': refreshToken });
      if (user) {
        await user.clearAllRefreshTokens();
      }
    }
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out from all devices successfully"
    }, { status: 200 });
    
    // Clear the refresh token cookie
    response.cookies.set('undergrad_refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });
    
    return response;
    
  } catch (error: any) {
    console.error("Logout all error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
