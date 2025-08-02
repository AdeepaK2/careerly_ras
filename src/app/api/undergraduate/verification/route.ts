import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";
import { verifyUndergradAuth } from "@/lib/auth/undergraduate/middleware";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Authenticate undergraduate
    const authResult = await verifyUndergradAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: authResult.error || "Authentication failed"
      }, { status: 401 });
    }

    // Find the undergraduate with verification details
    const undergraduate = await UndergradModel.findById(authResult.user.id)
      .select('name universityEmail index education batch isVerified verificationStatus verificationPriority verificationRequestedAt verifiedAt verificationNotes verificationDocuments createdAt')
      .lean() as any;

    if (!undergraduate) {
      return NextResponse.json({
        success: false,
        message: "Student account not found"
      }, { status: 404 });
    }

    // Calculate days since verification request
    const daysSinceRequest = undergraduate.verificationRequestedAt ? 
      Math.floor((new Date().getTime() - new Date(undergraduate.verificationRequestedAt).getTime()) / (1000 * 60 * 60 * 24)) : 
      Math.floor((new Date().getTime() - new Date(undergraduate.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    // Determine required documents based on student status
    const requiredDocuments = [
      { type: 'student_id', name: 'Student ID Card', required: true },
      { type: 'enrollment_certificate', name: 'Enrollment Certificate', required: true },
      { type: 'transcript', name: 'Academic Transcript', required: false }
    ];

    // Check which documents are submitted
    const submittedDocuments = undergraduate.verificationDocuments || [];
    const documentsStatus = requiredDocuments.map(doc => ({
      ...doc,
      submitted: submittedDocuments.some((sub: any) => sub.type === doc.type),
      submittedDoc: submittedDocuments.find((sub: any) => sub.type === doc.type)
    }));

    const response = {
      student: {
        id: undergraduate._id,
        name: undergraduate.name,
        universityEmail: undergraduate.universityEmail,
        index: undergraduate.index,
        faculty: undergraduate.education.faculty,
        degreeProgramme: undergraduate.education.degreeProgramme,
        batch: undergraduate.batch,
        isVerified: undergraduate.isVerified,
        verificationStatus: undergraduate.verificationStatus || 'pending',
        verificationPriority: undergraduate.verificationPriority || 'medium',
        verificationRequestedAt: undergraduate.verificationRequestedAt || undergraduate.createdAt,
        verifiedAt: undergraduate.verifiedAt,
        daysSinceRequest,
      },
      verification: {
        status: undergraduate.verificationStatus || 'pending',
        canSubmitDocuments: ['pending', 'under_review'].includes(undergraduate.verificationStatus || 'pending'),
        requiredDocuments: documentsStatus,
        submittedDocuments: submittedDocuments.length,
        requiredDocumentsCount: requiredDocuments.filter(doc => doc.required).length,
        notes: (undergraduate.verificationNotes || []).map((note: any) => ({
          note: note.note,
          addedAt: note.addedAt,
          isFromAdmin: note.addedBy === 'admin'
        })).sort((a: any, b: any) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      },
      nextSteps: getNextSteps(undergraduate.verificationStatus || 'pending', documentsStatus)
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error("Error fetching student verification status:", error);
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
    
    // Authenticate undergraduate
    const authResult = await verifyUndergradAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: authResult.error || "Authentication failed"
      }, { status: 401 });
    }

    const body = await request.json();
    const { action, documents, message } = body;

    const undergraduate = await UndergradModel.findById(authResult.user.id);
    if (!undergraduate) {
      return NextResponse.json({
        success: false,
        message: "Student account not found"
      }, { status: 404 });
    }

    // Check if student can perform this action
    if (!['pending', 'under_review'].includes(undergraduate.verificationStatus || 'pending')) {
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
                addedBy: undergraduate._id.toString(),
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

    // Update the undergraduate
    const updatedUndergraduate = await UndergradModel.findByIdAndUpdate(
      authResult.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('verificationStatus verificationRequestedAt');

    return NextResponse.json({
      success: true,
      message: "Verification request updated successfully",
      data: {
        verificationStatus: updatedUndergraduate.verificationStatus,
        verificationRequestedAt: updatedUndergraduate.verificationRequestedAt
      }
    });

  } catch (error: any) {
    console.error("Error updating student verification:", error);
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
      steps.push('Wait for admin review (typically 2-3 business days)');
      break;

    case 'under_review':
      steps.push('Your verification request is being reviewed by our team');
      steps.push('You may receive additional requests for information');
      steps.push('Average processing time: 2-3 business days');
      break;

    case 'approved':
      steps.push('Congratulations! Your account is verified');
      steps.push('You can now apply for jobs and access all platform features');
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
