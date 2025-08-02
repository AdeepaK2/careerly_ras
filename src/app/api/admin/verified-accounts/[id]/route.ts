import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";
import UndergraduateModel from "@/lib/models/undergraduate";
// import { withAdminAuth } from "@/lib/auth/admin/middleware";

async function patchHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    
    const { id } = params;
    const body = await request.json();
    const { action, accountType } = body; // action: 'verify' | 'unverify'
    
    if (!action || !accountType) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: action and accountType"
      }, { status: 400 });
    }

    if (!['verify', 'unverify'].includes(action)) {
      return NextResponse.json({
        success: false,
        message: "Invalid action. Must be 'verify' or 'unverify'"
      }, { status: 400 });
    }

    if (!['company', 'undergraduate'].includes(accountType)) {
      return NextResponse.json({
        success: false,
        message: "Invalid account type. Must be 'company' or 'undergraduate'"
      }, { status: 400 });
    }

    let updatedAccount;
    const isVerified = action === 'verify';

    if (accountType === 'company') {
      updatedAccount = await CompanyModel.findByIdAndUpdate(
        id,
        { 
          isVerified,
          updatedAt: new Date()
        },
        { 
          new: true,
          select: '-password -refreshTokens -loginAttempts -emailVerificationToken -passwordResetToken'
        }
      );
    } else {
      updatedAccount = await UndergraduateModel.findByIdAndUpdate(
        id,
        { 
          isVerified,
          updatedAt: new Date()
        },
        { 
          new: true,
          select: '-password -refreshTokens -emailVerificationToken -passwordResetToken'
        }
      );
    }

    if (!updatedAccount) {
      return NextResponse.json({
        success: false,
        message: "Account not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Account ${action === 'verify' ? 'verified' : 'unverified'} successfully`,
      data: {
        account: {
          ...updatedAccount.toObject(),
          accountType,
          accountName: accountType === 'company' ? updatedAccount.companyName : updatedAccount.name,
          accountEmail: accountType === 'company' ? updatedAccount.businessEmail : updatedAccount.universityEmail,
          accountId: accountType === 'company' ? updatedAccount.registrationNumber : updatedAccount.index
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Update verification status error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update verification status",
      error: error.message
    }, { status: 500 });
  }
}

// Export handlers directly for development
// In production, use: export const PATCH = withAdminAuth(patchHandler);
export const PATCH = patchHandler;
