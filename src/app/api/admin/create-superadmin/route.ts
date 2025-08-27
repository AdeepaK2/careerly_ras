import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/utils/db";
import AdminModel from "@/lib/models/admin";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if superadmin already exists
    const existingAdmin = await AdminModel.findOne({ role: "superadmin" });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: "Superadmin already exists" },
        { status: 400 }
      );
    }

    // Default superadmin credentials
    const username = "superadmin";
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const superadmin = new AdminModel({
      username,
      password: hashedPassword,
      role: "superadmin",
      email: "admin@careerly.com",
    });

    await superadmin.save();

    return NextResponse.json({
      success: true,
      message: "Superadmin created successfully",
      data: {
        username,
        password, // Only for initial setup
        email: "admin@careerly.com",
      },
    });
  } catch (error) {
    console.error("Error creating superadmin:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create superadmin" },
      { status: 500 }
    );
  }
}
