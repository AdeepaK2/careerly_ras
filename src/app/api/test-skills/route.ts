import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import UndergradModel from "@/lib/models/undergraduate";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, skills } = body;
    
    console.log('=== DIRECT SKILLS UPDATE TEST ===');
    console.log('User ID:', userId);
    console.log('Skills to set:', skills);
    
    // Check current state
    const beforeUser = await UndergradModel.findById(userId);
    console.log('Before update - user found:', !!beforeUser);
    console.log('Before update - skills exist:', beforeUser?.hasOwnProperty('skills'));
    console.log('Before update - skills value:', beforeUser?.skills);
    
    // Try direct update with $set
    const result = await UndergradModel.findByIdAndUpdate(
      userId,
      { $set: { skills: skills } },
      { new: true, runValidators: false }
    );
    
    console.log('Update result - user found:', !!result);
    console.log('Update result - skills exist:', result?.hasOwnProperty('skills'));
    console.log('Update result - skills value:', result?.skills);
    
    // Try using updateOne instead
    const updateOneResult = await UndergradModel.updateOne(
      { _id: userId },
      { $set: { skills: skills } }
    );
    console.log('UpdateOne result:', updateOneResult);
    
    // Verify by fetching again
    const verify = await UndergradModel.findById(userId);
    console.log('Final verification - skills:', verify?.skills);
    console.log('Final verification - raw document:', JSON.stringify(verify?.toObject()));
    
    return NextResponse.json({
      success: true,
      data: {
        beforeSkills: beforeUser?.skills,
        updatedSkills: result?.skills,
        verifiedSkills: verify?.skills,
        updateOneResult: updateOneResult
      }
    });
    
  } catch (error: any) {
    console.error('Direct update error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
