import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import InterviewResponse from "@/models/InterviewResponse";

export async function GET() {
  try {
    await connectToMongo();
    
    // Test creating a sample response
    const testResponse = new InterviewResponse({
      candidateId: "test-candidate-123",
      candidateEmail: "test@example.com",
      interviewType: "technical1",
      taskId: 1,
      taskTitle: "Bug Fix: Payment Processing",
      response: "Test response content",
      startedAt: new Date(),
      submittedAt: new Date(),
      timeSpentSeconds: 300,
      metadata: {
        hintsViewed: true,
        runCount: 3,
      },
    });
    
    // Save to database
    await testResponse.save();
    
    // Count total responses
    const count = await InterviewResponse.countDocuments();
    
    return NextResponse.json({ 
      success: true, 
      message: "MongoDB connected and test document created!",
      database: process.env.MONGODB_URI?.split('@')[1]?.split('/')[0] || "connected",
      testDocumentId: testResponse._id,
      totalResponses: count,
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "MongoDB connection or operation failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
