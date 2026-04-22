import { NextResponse } from "next/server";
import connect from "@/utils/db";
import CompanyModel from "@/lib/models/company";

export async function GET() {
  try {
    await connect();

    const companies = await CompanyModel.find({})
      .select(
        "_id companyName registrationNumber businessEmail phoneNumber industry companySize foundedYear isVerified isActive jobPostingLimits createdAt lastLogin"
      )
      .sort({ createdAt: -1 })
      .lean();

    const formattedCompanies = companies.map((c) => ({
        _id: c._id,
        id: c._id,
        name: c.companyName,
        companyName: c.companyName,
        registrationNumber: c.registrationNumber,
        email: c.businessEmail,
        businessEmail: c.businessEmail,
        phoneNumber: c.phoneNumber,
        industry: c.industry,
        companySize: c.companySize,
        foundedYear: c.foundedYear,
        isVerified: c.isVerified,
        isActive: c.isActive,
        jobPostingLimits: c.jobPostingLimits,
        createdAt: c.createdAt,
        lastLogin: c.lastLogin,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCompanies,
      count: formattedCompanies.length,
    });
  } catch (error: any) {
    console.error("Company fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch companies",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
