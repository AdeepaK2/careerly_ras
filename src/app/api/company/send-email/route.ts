import { NextRequest, NextResponse } from "next/server";
import { verifyCompanyAccessToken } from "@/lib/auth/company/jwt";
import { sendEmail } from "@/lib/services/emailService";
import connectToDatabase from "@/utils/db";
import Application from "@/lib/models/application";
import Undergraduate from "@/lib/models/undergraduate";
import Job from "@/lib/models/job";

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token - check Authorization header first, then cookies
    let token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      token = request.cookies.get("token")?.value;
    }
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await verifyCompanyAccessToken(token);
    if (!company) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const companyId = company.id;
    const { to, subject, message, applicationId } = await request.json();

    if (!to || !subject || !message || !applicationId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify the application belongs to this company
    const application = await Application.findById(applicationId)
      .populate("jobId")
      .populate("applicantId");

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if ((application.jobId as any).companyId.toString() !== companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Send email
    const emailResult = await sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8243ff 0%, #9333ea 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Careerly RAS</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Recruitment Application System</p>
          </div>
          <div style="padding: 30px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
              ${message.split('\n').map((line: string) => `<p style="margin-bottom: 16px; line-height: 1.6; color: #334155;">${line}</p>`).join('')}
            </div>
          </div>
          <div style="background: #334155; color: white; text-align: center; padding: 20px;">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">
              This email was sent from the Careerly RAS platform
            </p>
          </div>
        </div>
      `,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
