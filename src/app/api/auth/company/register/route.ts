import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import { hashPassword } from "@/lib/auth/company/password";
import { generateCompanyTokens, generateCompanyEmailVerificationToken } from "@/lib/auth/company/jwt";
import { sendEmail, emailTemplates } from "@/lib/services/emailService";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    
    // Basic validation
    const requiredFields = [
      'companyName', 'registrationNumber', 'businessEmail', 'password', 
      'phoneNumber', 'industry', 'companySize', 'foundedYear', 'address', 'contactPerson'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          message: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }
    
    // Address validation
    const requiredAddressFields = ['street', 'city', 'province', 'postalCode'];
    for (const field of requiredAddressFields) {
      if (!body.address[field]) {
        return NextResponse.json({
          success: false,
          message: `Missing required address field: ${field}`
        }, { status: 400 });
      }
    }
    
    // Contact person validation
    const requiredContactFields = ['name', 'designation', 'email', 'phone'];
    for (const field of requiredContactFields) {
      if (!body.contactPerson[field]) {
        return NextResponse.json({
          success: false,
          message: `Missing required contact person field: ${field}`
        }, { status: 400 });
      }
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.businessEmail)) {
      return NextResponse.json({
        success: false,
        message: "Invalid business email format"
      }, { status: 400 });
    }
    
    if (!emailRegex.test(body.contactPerson.email)) {
      return NextResponse.json({
        success: false,
        message: "Invalid contact person email format"
      }, { status: 400 });
    }
    
    // Password strength validation
    if (body.password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "Password must be at least 8 characters"
      }, { status: 400 });
    }
    
    // Company size validation
    const validCompanySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
    if (!validCompanySizes.includes(body.companySize)) {
      return NextResponse.json({
        success: false,
        message: "Invalid company size"
      }, { status: 400 });
    }
    
    // Founded year validation
    const currentYear = new Date().getFullYear();
    if (body.foundedYear < 1800 || body.foundedYear > currentYear) {
      return NextResponse.json({
        success: false,
        message: "Invalid founded year"
      }, { status: 400 });
    }
    
    // Check if company already exists
    const existingCompany = await CompanyModel.findOne({
      $or: [
        { businessEmail: body.businessEmail },
        { registrationNumber: body.registrationNumber }
      ]
    });
    
    if (existingCompany) {
      return NextResponse.json({
        success: false,
        message: existingCompany.businessEmail === body.businessEmail 
          ? "Business email already registered" 
          : "Registration number already exists"
      }, { status: 409 });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(body.password);
    
    // Create new company
    const newCompany = new CompanyModel({
      ...body,
      password: hashedPassword,
      isEmailVerified: false, // Will need email verification for login
      isVerified: false, // Will need document verification by admin
      verificationStatus: 'pending'
    });
    
    await newCompany.save();

    // Generate email verification token
    const verificationToken = generateCompanyEmailVerificationToken(
      newCompany._id.toString(),
      newCompany.businessEmail
    );

    // Update company with verification token
    newCompany.emailVerificationToken = verificationToken;
    newCompany.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await newCompany.save();

    // Send verification email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const verificationLink = `${baseUrl}/auth/company/verify-email?token=${verificationToken}`;
      
      const emailTemplate = emailTemplates.verification(newCompany.companyName, verificationLink);
      await sendEmail({
        to: newCompany.businessEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateCompanyTokens({
      id: newCompany._id.toString(),
      registrationNumber: newCompany.registrationNumber,
      businessEmail: newCompany.businessEmail,
      companyName: newCompany.companyName,
      isVerified: newCompany.isVerified,
      type: 'company'
    });
    
    // Add refresh token to company
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await newCompany.addRefreshToken(refreshToken, refreshTokenExpiry);
    
    // Set secure HTTP-only cookie for refresh token
    const response = NextResponse.json({
      success: true,
      message: "Registration successful! Please verify your business email to enable login access. Complete your company verification later through the dashboard.",
      data: {
        user: {
          id: newCompany._id,
          companyName: newCompany.companyName,
          registrationNumber: newCompany.registrationNumber,
          businessEmail: newCompany.businessEmail,
          phoneNumber: newCompany.phoneNumber,
          industry: newCompany.industry,
          companySize: newCompany.companySize,
          foundedYear: newCompany.foundedYear,
          address: newCompany.address,
          description: newCompany.description,
          website: newCompany.website,
          contactPerson: newCompany.contactPerson,
          isEmailVerified: newCompany.isEmailVerified,
          isVerified: newCompany.isVerified,
          verificationStatus: newCompany.verificationStatus,
          isActive: newCompany.isActive,
          logoUrl: newCompany.logoUrl,
          jobPostingLimits: newCompany.jobPostingLimits
        },
        accessToken,
        requiresEmailVerification: true
      }
    }, { status: 201 });
    
    // Set refresh token as HTTP-only cookie
    response.cookies.set('company_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    return response;
    
  } catch (error: any) {
    console.error("Company registration error:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({
        success: false,
        message: `${field === 'businessEmail' ? 'Business email' : 'Registration number'} already exists`
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
