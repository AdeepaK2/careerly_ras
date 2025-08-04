import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import { verifyCompanyAuth } from "@/lib/auth/company/middleware";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Authenticate company
    const authResult = await verifyCompanyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: authResult.error || "Authentication failed"
      }, { status: 401 });
    }

    // Find the company with verification details
    const company = await CompanyModel.findById(authResult.user.id)
      .select('companyName businessEmail isVerified verificationStatus verificationPriority verificationRequestedAt verifiedAt verificationNotes verificationDocuments createdAt')
      .lean() as any;

    if (!company) {
      return NextResponse.json({
        success: false,
        message: "Company not found"
      }, { status: 404 });
    }

    // Calculate days since verification request
    const daysSinceRequest = company.verificationRequestedAt ? 
      Math.floor((new Date().getTime() - new Date(company.verificationRequestedAt).getTime()) / (1000 * 60 * 60 * 24)) : 
      Math.floor((new Date().getTime() - new Date(company.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    // Determine required documents based on company type
    const requiredDocuments = [
      { type: 'business_registration', name: 'Business Registration Certificate', required: true },
      { type: 'tax_certificate', name: 'Tax Registration Certificate', required: true },
      { type: 'incorporation_certificate', name: 'Certificate of Incorporation', required: false }
    ];

    // Check which documents are submitted
    const submittedDocuments = company.verificationDocuments || [];
    const documentsStatus = requiredDocuments.map(doc => ({
      ...doc,
      submitted: submittedDocuments.some((sub: any) => sub.type === doc.type),
      submittedDoc: submittedDocuments.find((sub: any) => sub.type === doc.type)
    }));

    const response = {
      company: {
        id: company._id,
        companyName: company.companyName,
        businessEmail: company.businessEmail,
        isVerified: company.isVerified,
        verificationStatus: company.verificationStatus || 'pending',
        verificationPriority: company.verificationPriority || 'medium',
        verificationRequestedAt: company.verificationRequestedAt || company.createdAt,
        verifiedAt: company.verifiedAt,
        daysSinceRequest,
      },
      verification: {
        status: company.verificationStatus || 'pending',
        canSubmitDocuments: ['pending', 'under_review'].includes(company.verificationStatus || 'pending'),
        requiredDocuments: documentsStatus,
        submittedDocuments: submittedDocuments.length,
        requiredDocumentsCount: requiredDocuments.filter(doc => doc.required).length,
        notes: (company.verificationNotes || []).map((note: any) => ({
          note: note.note,
          addedAt: note.addedAt,
          isFromAdmin: note.addedBy === 'admin'
        })).sort((a: any, b: any) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      },
      nextSteps: getNextSteps(company.verificationStatus || 'pending', documentsStatus)
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error("Error fetching company verification status:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch verification status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Authenticate company
    const authResult = await verifyCompanyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: authResult.error || "Authentication failed"
      }, { status: 401 });
    }

    const body = await request.json();
    const { action, documents, message } = body;

    const company = await CompanyModel.findById(authResult.user.id);
    if (!company) {
      return NextResponse.json({
        success: false,
        message: "Company not found"
      }, { status: 404 });
    }

    // Check if company can perform this action
    if (!['pending', 'under_review'].includes(company.verificationStatus || 'pending')) {
      return NextResponse.json({
        success: false,
        message: "Cannot modify verification request in current status"
      }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'submit_documents':
        if (documents && Array.isArray(documents)) {
          // Add new documents
          updateData = {
            $push: {
              verificationDocuments: {
                $each: documents.map((doc: any) => ({
                  ...doc,
                  uploadedAt: new Date(),
                  isVerified: false
                }))
              }
            },
            verificationStatus: 'under_review',
            verificationRequestedAt: new Date()
          };
        }
        break;

      case 'add_message':
        if (message) {
          updateData = {
            $push: {
              verificationNotes: {
                note: message,
                addedBy: company._id.toString(),
                addedAt: new Date()
              }
            }
          };
        }
        break;

      case 'request_verification':
        updateData = {
          verificationStatus: 'pending',
          verificationRequestedAt: new Date()
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          message: "Invalid action"
        }, { status: 400 });
    }

    // Update the company
    const updatedCompany = await CompanyModel.findByIdAndUpdate(
      authResult.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('verificationStatus verificationRequestedAt');

    return NextResponse.json({
      success: true,
      message: "Verification request updated successfully",
      data: {
        verificationStatus: updatedCompany.verificationStatus,
        verificationRequestedAt: updatedCompany.verificationRequestedAt
      }
    });

  } catch (error: any) {
    console.error("Error updating company verification:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update verification request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

function getNextSteps(status: string, documentsStatus: any[]): string[] {
  const steps: string[] = [];

  switch (status) {
    case 'pending':
      const missingDocs = documentsStatus.filter(doc => doc.required && !doc.submitted);
      if (missingDocs.length > 0) {
        steps.push(`Upload required documents: ${missingDocs.map(doc => doc.name).join(', ')}`);
      }
      steps.push('Submit verification request once all documents are uploaded');
      steps.push('Wait for admin review (typically 3-5 business days)');
      break;

    case 'under_review':
      steps.push('Your verification request is being reviewed by our team');
      steps.push('You may receive additional requests for information');
      steps.push('Average processing time: 3-5 business days');
      break;

    case 'approved':
      steps.push('Congratulations! Your account is verified');
      steps.push('You can now access all platform features');
      break;

    case 'rejected':
      steps.push('Please review the feedback provided');
      steps.push('Address any issues mentioned in the notes');
      steps.push('Submit a new verification request when ready');
      break;

    default:
      steps.push('Contact support for assistance');
  }

  return steps;
}
