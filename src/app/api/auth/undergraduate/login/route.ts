import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import { comparePassword } from "@/lib/auth/undergraduate/password";
import { generateUndergradTokens } from "@/lib/auth/undergraduate/jwt";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    
    // Basic validation
    if (!body.universityEmail || !body.password) {
      return NextResponse.json({
        success: false,
        message: "Email and password are required"
      }, { status: 400 });
    }
    
    const { universityEmail, password } = body;
    
    // Find user
    const user = await UndergradModel.findOne({ universityEmail });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password"
      }, { status: 401 });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return NextResponse.json({
        success: false,
        message: "Account is temporarily locked due to multiple failed login attempts. Please try again later."
      }, { status: 423 });
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      return NextResponse.json({
        success: false,
        message: "Invalid email or password"
      }, { status: 401 });
    }
    
    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateUndergradTokens({
      id: user._id.toString(),
      index: user.index,
      universityEmail: user.universityEmail,
      name: user.name,
      isVerified: user.isVerified,
      type: 'undergraduate'
    });
    
    // Add refresh token to user
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.addRefreshToken(refreshToken, refreshTokenExpiry);
    
    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
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
          profilePicUrl: user.profilePicUrl,
          lastLogin: user.lastLogin
        },
        accessToken,
        requiresEmailVerification: !user.isVerified
      }
    }, { status: 200 });
    
    // Set refresh token as HTTP-only cookie
    response.cookies.set('undergrad_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    return response;
    
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
