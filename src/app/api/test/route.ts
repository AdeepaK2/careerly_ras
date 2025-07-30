import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";

export async function GET() {
  try {
    // Test database connection
    await connect();
    
    return NextResponse.json({
      success: true,
      message: "MongoDB connection is working!",
      connectionStatus: "Connected",
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Database test failed:", error);
    
    return NextResponse.json({
      success: false,
      message: "MongoDB connection failed",
      error: error.message,
      connectionStatus: "Failed"
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Test endpoint working"
  }, { status: 200 });
}