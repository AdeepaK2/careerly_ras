import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergradModel from "@/lib/models/undergraduate";
import { sendEmail, emailTemplates } from "@/lib/services/emailService";

interface Params {
  id: string;
}

export async function GET(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    await connect();
    
    const { id } = await context.params;

    // Try to find in companies first
    let account = await CompanyModel.findById(id)
      .select('companyName businessEmail registrationNumber industry companySize foundedYear address description website logoUrl contactPerson isVerified verificationStatus verificationDocuments verificationPriority verificationNotes createdAt verificationRequestedAt')
      .lean() as any;

    let accountType = 'company';

    // If not found in companies, try undergraduates
    if (!account) {
      account = await UndergradModel.findById(id)
        .select('name universityEmail index education batch birthdate address phoneNumber profilePicUrl isVerified verificationStatus verificationDocuments verificationPriority verificationNotes createdAt verificationRequestedAt')
        .lean() as any;
      accountType = 'undergraduate';
    }

    if (!account) {
      return NextResponse.json({
        success: false,
        message: "Account not found"
      }, { status: 404 });
    }

    const response = {
      _id: account._id,
      accountType,
      isVerified: account.isVerified,
      verificationStatus: account.verificationStatus || 'pending',
      verificationPriority: account.verificationPriority || 'medium',
      verificationNotes: account.verificationNotes || [],
      verificationDocuments: account.verificationDocuments || [],
      createdAt: account.createdAt,
      verificationRequestedAt: account.verificationRequestedAt || account.createdAt,
      ...account
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error("Error fetching verification request:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch verification request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    await connect();
    
    const { id } = await context.params;
    const body = await request.json();
    const { action, accountType, priority, notes, documents } = body;

    // Determine the model to use
    const Model = accountType === 'company' ? CompanyModel : UndergradModel;
    
    let updateData: any = {};
    let emailData: any = {};

    switch (action) {
      case 'approve':
        updateData = {
          isVerified: true,
          verificationStatus: 'approved',
          verifiedAt: new Date()
        };
        break;

      case 'reject':
        updateData = {
          isVerified: false,
          verificationStatus: 'rejected'
        };
        break;

      case 'request_more_info':
        updateData = {
          verificationStatus: 'under_review'
        };
        break;

      case 'update_priority':
        if (priority && ['low', 'medium', 'high'].includes(priority)) {
          updateData = {
            verificationPriority: priority
          };
        }
        break;

      case 'add_note':
        if (notes) {
          updateData = {
            $push: {
              verificationNotes: {
                note: notes,
                addedBy: 'admin', // In a real app, this would be the admin's ID
                addedAt: new Date()
              }
            }
          };
        }
        break;

      case 'add_documents':
        if (documents && Array.isArray(documents)) {
          updateData = {
            $push: {
              verificationDocuments: {
                $each: documents.map((doc: any) => ({
                  ...doc,
                  uploadedAt: new Date()
                }))
              }
            }
          };
        }
        break;

      default:
        return NextResponse.json({
          success: false,
          message: "Invalid action"
        }, { status: 400 });
    }

    // Update the account
    const updatedAccount = await Model.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select(accountType === 'company' ? 
      'companyName businessEmail verificationStatus isVerified' : 
      'name universityEmail verificationStatus isVerified'
    );

    if (!updatedAccount) {
      return NextResponse.json({
        success: false,
        message: "Account not found"
      }, { status: 404 });
    }

    // Send email notification for status changes
    if (action === 'approve' || action === 'reject' || action === 'request_more_info') {
      try {
        const accountName = accountType === 'company' ? updatedAccount.companyName : updatedAccount.name;
        const accountEmail = accountType === 'company' ? updatedAccount.businessEmail : updatedAccount.universityEmail;
        
        let emailSubject = '';
        let emailContent = '';

        switch (action) {
          case 'approve':
            emailSubject = 'Account Verified Successfully! 🎉';
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10b981;">Account Verification Approved</h2>
                <p>Dear ${accountName},</p>
                <p>Congratulations! Your account has been successfully verified.</p>
                <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Your account is now fully activated and you can access all features of the Careerly platform.</strong></p>
                </div>
                <p>You can now:</p>
                <ul>
                  ${accountType === 'company' ? 
                    '<li>Post job opportunities</li><li>Browse student profiles</li><li>Manage applications</li>' : 
                    '<li>Apply for jobs</li><li>Complete your profile</li><li>Connect with employers</li>'
                  }
                </ul>
                <p>Thank you for choosing Careerly!</p>
                <p>Best regards,<br>The Careerly Team</p>
              </div>
            `;
            break;

          case 'reject':
            emailSubject = 'Account Verification Update';
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444;">Account Verification Decision</h2>
                <p>Dear ${accountName},</p>
                <p>Thank you for your interest in joining the Careerly platform. After reviewing your verification request, we are unable to approve your account at this time.</p>
                <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Reason:</strong> ${notes || 'Please contact support for more information.'}</p>
                </div>
                <p>If you believe this is an error or have additional information to provide, please contact our support team.</p>
                <p>Best regards,<br>The Careerly Team</p>
              </div>
            `;
            break;

          case 'request_more_info':
            emailSubject = 'Additional Information Required for Verification';
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">Additional Information Required</h2>
                <p>Dear ${accountName},</p>
                <p>We are currently reviewing your account verification request. To complete the process, we need some additional information.</p>
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Required Information:</strong></p>
                  <p>${notes || 'Please check your account dashboard for specific requirements.'}</p>
                </div>
                <p>Please log in to your account and provide the requested information to continue with the verification process.</p>
                <p>Best regards,<br>The Careerly Team</p>
              </div>
            `;
            break;
        }

        await sendEmail({
          to: accountEmail,
          subject: emailSubject,
          html: emailContent
        });

      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verification request ${action.replace('_', ' ')} successfully`,
      data: {
        id: updatedAccount._id,
        isVerified: updatedAccount.isVerified,
        verificationStatus: updatedAccount.verificationStatus
      }
    });

  } catch (error: any) {
    console.error("Error updating verification request:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update verification request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
