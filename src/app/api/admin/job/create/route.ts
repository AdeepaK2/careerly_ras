import { NextResponse, NextRequest } from "next/server";
import { verifyAdminAccessToken } from "@/lib/auth/admin/jwt";
import JobModel from "@/lib/models/job";
import CompanyModel from "@/lib/models/company";
import connect from "@/utils/db";
import { sendEmail } from "@/lib/services/emailService";

connect();

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "No token given" }, { status: 401 });
  }

  const admin = await verifyAdminAccessToken(token);
  if (!admin) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();

  // Validate required fields
  if (
    !body ||
    !body.title ||
    !body.description ||
    !body.jobType ||
    !body.category ||
    !body.workPlaceType ||
    !body.location ||
    !body.deadline ||
    !body.qualifiedDegrees ||
    !Array.isArray(body.qualifiedDegrees) ||
    body.qualifiedDegrees.length === 0
  ) {
    return NextResponse.json(
      { error: "Missing required fields or invalid qualifiedDegrees" },
      { status: 400 }
    );
  }

  // Validate company selection
  if (!body.companyId && !body.customCompanyName) {
    return NextResponse.json(
      { error: "Either companyId or customCompanyName is required" },
      { status: 400 }
    );
  }

  try {
    let companyInfo = null;
    let companyName = "";
    let companyEmail = "";

    // If using registered company
    if (body.companyId) {
      companyInfo = await CompanyModel.findById(body.companyId);
      if (!companyInfo) {
        return NextResponse.json(
          { error: "Selected company not found" },
          { status: 400 }
        );
      }
      companyName = companyInfo.companyName;
      companyEmail = companyInfo.businessEmail;
    } else {
      // Using custom company name
      companyName = body.customCompanyName;
    }

    // Prepare job description with additional links
    let enhancedDescription = body.description;

    // Add company website and original ad links if provided
    if (body.companyWebsite || body.originalAdLink) {
      enhancedDescription += "\n\n--- Additional Information ---\n";

      if (body.companyWebsite) {
        enhancedDescription += `\nCompany Website: ${body.companyWebsite}`;
      }

      if (body.originalAdLink) {
        enhancedDescription += `\nOriginal Job Advertisement: ${body.originalAdLink}`;
      }
    }

    // Create job data
    const jobData: {
      title: string;
      description: string;
      jobType: string;
      category: string;
      workPlaceType: string;
      location: string;
      deadline: Date;
      qualifiedDegrees: string[];
      skillsRequired: string[];
      companyId?: string;
      customCompanyName?: string;
      companyWebsite?: string;
      originalAdLink?: string;
      postedByAdmin: boolean;
      adminId: string;
      adminUsername: string;
      salaryRange?: { min: number; max: number };
    } = {
      title: body.title,
      description: enhancedDescription,
      jobType: body.jobType,
      category: body.category,
      workPlaceType: body.workPlaceType,
      location: body.location,
      deadline: new Date(body.deadline),
      qualifiedDegrees: body.qualifiedDegrees,
      skillsRequired: body.skillsRequired || [],
      postedByAdmin: true,
      adminId: admin.id,
      adminUsername: admin.username,
    };

    // Add company information
    if (body.companyId) {
      jobData.companyId = body.companyId;
    } else {
      jobData.customCompanyName = body.customCompanyName;
    }

    // Add optional fields
    if (body.companyWebsite) {
      jobData.companyWebsite = body.companyWebsite;
    }
    if (body.originalAdLink) {
      jobData.originalAdLink = body.originalAdLink;
    }

    // Add salary range if provided
    if (
      body.salaryRange &&
      (body.salaryRange.min > 0 || body.salaryRange.max > 0)
    ) {
      jobData.salaryRange = {
        min: body.salaryRange.min || 0,
        max: body.salaryRange.max || 0,
      };
    }

    // Create the job
    const job = await JobModel.create(jobData);

    // Send notification email to company if it's a registered company
    if (companyInfo && companyEmail) {
      try {
        const emailSubject = `New Job Posted on Your Behalf - ${body.title}`;
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Job Posted on Your Behalf</h2>
            
            <p>Dear ${companyName} Team,</p>
            
            <p>Our admin team has posted a new job opportunity on your behalf on the Careerly platform.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Job Details:</h3>
              <p><strong>Job Title:</strong> ${body.title}</p>
              <p><strong>Job Type:</strong> ${body.jobType}</p>
              <p><strong>Category:</strong> ${body.category}</p>
              <p><strong>Location:</strong> ${body.location}</p>
              <p><strong>Application Deadline:</strong> ${new Date(
                body.deadline
              ).toLocaleDateString()}</p>
              <p><strong>Posted by Admin:</strong> ${admin.username}</p>
            </div>
            
            <p>You can view and manage this job posting by logging into your company dashboard on Careerly.</p>
            
            <p>If you have any questions or concerns about this job posting, please contact our admin team.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Best regards,<br>
                Careerly Admin Team
              </p>
            </div>
          </div>
        `;

        await sendEmail({
          to: companyEmail,
          subject: emailSubject,
          html: emailBody,
        });
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // Don't fail the job creation if email fails
      }
    }

    return NextResponse.json(
      {
        message: "Job created successfully",
        job,
        notification: companyEmail
          ? "Company notified via email"
          : "No email notification sent",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
