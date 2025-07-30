import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import { hashPassword } from "@/lib/auth/undergraduate/password";
import { generateUndergradTokens, generateEmailVerificationToken } from "@/lib/auth/undergraduate/jwt";
import { sendEmail, emailTemplates } from "@/lib/services/emailService";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    
    // Basic validation
    if (!body.universityEmail || !body.password || !body.index || !body.name) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: universityEmail, password, index, name"
      }, { status: 400 });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.universityEmail)) {
      return NextResponse.json({
        success: false,
        message: "Invalid email format"
      }, { status: 400 });
    }
    
    // Password strength validation
    if (body.password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "Password must be at least 8 characters"
      }, { status: 400 });
    }
    
    // Check if undergraduate already exists
    const existingUser = await UndergradModel.findOne({
      $or: [
        { universityEmail: body.universityEmail },
        { index: body.index }
      ]
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: existingUser.universityEmail === body.universityEmail 
          ? "Email already registered" 
          : "Index number already registered"
      }, { status: 409 });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(body.password);
    
    // Create new undergraduate
    const newUndergrad = new UndergradModel({
      ...body,
      password: hashedPassword,
      isVerified: false // Will need email verification
    });
    
    await newUndergrad.save();

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(
      newUndergrad._id.toString(),
      newUndergrad.universityEmail
    );

    // Update user with verification token
    newUndergrad.emailVerificationToken = verificationToken;
    newUndergrad.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await newUndergrad.save();

    // Send verification email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const verificationLink = `${baseUrl}/auth/undergrad/verify-email?token=${verificationToken}`;
      
      const emailTemplate = emailTemplates.verification(newUndergrad.name, verificationLink);
      await sendEmail({
        to: newUndergrad.universityEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateUndergradTokens({
      id: newUndergrad._id.toString(),
      index: newUndergrad.index,
      universityEmail: newUndergrad.universityEmail,
      name: newUndergrad.name,
      isVerified: newUndergrad.isVerified,
      type: 'undergraduate'
    });
    
    // Add refresh token to user
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await newUndergrad.addRefreshToken(refreshToken, refreshTokenExpiry);
    
    // Set secure HTTP-only cookie for refresh token
    const response = NextResponse.json({
      success: true,
      message: "Registration successful! Please verify your email.",
      data: {
        user: {
          id: newUndergrad._id,
          index: newUndergrad.index,
          name: newUndergrad.name,
          nameWithInitials: newUndergrad.nameWithInitials,
          universityEmail: newUndergrad.universityEmail,
          batch: newUndergrad.batch,
          education: newUndergrad.education,
          isVerified: newUndergrad.isVerified,
          jobSearchingStatus: newUndergrad.jobSearchingStatus,
          profilePicUrl: newUndergrad.profilePicUrl
        },
        accessToken,
        requiresEmailVerification: true
      }
    }, { status: 201 });
    
    // Set refresh token as HTTP-only cookie
    response.cookies.set('undergrad_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    return response;
    
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({
        success: false,
        message: `${field} already exists`
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
