import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Check schema definition
    const schemaFields = Object.keys(UndergradModel.schema.paths);
    console.log('Schema fields:', schemaFields);
    console.log('Skills field in schema:', 'skills' in UndergradModel.schema.paths);
    console.log('Skills field definition:', UndergradModel.schema.paths.skills);
    
    // Get a user and check their structure
    const user = await UndergradModel.findById('689093c6e8bf20afc1df896e');
    console.log('User found:', !!user);
    console.log('User keys:', user ? Object.keys(user.toObject()) : 'none');
    console.log('Skills in user object:', user?.skills);
    
    return NextResponse.json({
      success: true,
      data: {
        schemaHasSkills: 'skills' in UndergradModel.schema.paths,
        userHasSkills: user ? 'skills' in user.toObject() : false,
        skillsValue: user?.skills,
        allFields: schemaFields
      }
    });
    
  } catch (error: any) {
    console.error('Schema check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
