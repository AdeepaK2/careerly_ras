import { NextResponse } from "next/server";
import connect from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";

export async function GET() {
  try {
    await connect();

    const users = await UndergradModel.find({})
      .select(
        "_id index name nameWithInitials universityEmail batch education isVerified jobSearchingStatus createdAt lastLogin"
      )
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}