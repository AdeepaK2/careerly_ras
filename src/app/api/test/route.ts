import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import TestModel from "@/lib/modals/testSchema";

export async function GET() {
  try {
    // Test database connection
    await connect();
    
    // Create a test document
    const testDoc = new TestModel({
      message: "MongoDB connection successful!",
      status: "success"
    });
    
    // Save to database
    const savedDoc = await testDoc.save();
    
    // Clean up - delete the test document
    await TestModel.findByIdAndDelete(savedDoc._id);
    
    return NextResponse.json({
      success: true,
      message: "MongoDB connection is working!",
      connectionStatus: "Connected",
      testData: {
        id: savedDoc._id,
        message: savedDoc.message,
        timestamp: savedDoc.timestamp
      }
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
  try {
    await connect();
    
    // Create and save a persistent test document
    const testDoc = new TestModel({
      message: "Test document created via POST",
      status: "success"
    });
    
    const savedDoc = await testDoc.save();
    
    return NextResponse.json({
      success: true,
      message: "Test document created successfully",
      data: savedDoc
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Failed to create test document",
      error: error.message
    }, { status: 500 });
  }
}