import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import { verifyUndergradRefreshToken, generateUndergradTokens } from "@/lib/auth/undergraduate/jwt";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('undergrad_refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: "Refresh token not found"
      }, { status: 401 });
    }
    
    // Verify refresh token
    const tokenVerification = verifyUndergradRefreshToken(refreshToken);
    if (!tokenVerification.valid || !tokenVerification.payload) {
      return NextResponse.json({
        success: false,
        message: "Invalid refresh token"
      }, { status: 401 });
    }
    
    // Find user and check if refresh token exists
    const user = await UndergradModel.findOne({
      _id: tokenVerification.payload.id,
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found or refresh token expired"
      }, { status: 401 });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateUndergradTokens({
      id: user._id.toString(),
      index: user.index,
      universityEmail: user.universityEmail,
      name: user.name,
      isVerified: user.isVerified,
      type: 'undergraduate'
    });
    
    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    const newRefreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.addRefreshToken(newRefreshToken, newRefreshTokenExpiry);
    
    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        accessToken,
        user: {
          id: user._id,
          index: user.index,
          name: user.name,
          nameWithInitials: user.nameWithInitials,
          universityEmail: user.universityEmail,
          batch: user.batch,
          education: user.education,
          isVerified: user.isVerified,
          jobSearchingStatus: user.jobSearchingStatus,
          profilePicUrl: user.profilePicUrl
        }
      }
    }, { status: 200 });
    
    // Set new refresh token as HTTP-only cookie
    response.cookies.set('undergrad_refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    return response;
    
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
