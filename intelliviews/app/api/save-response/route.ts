import { NextRequest, NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import InterviewResponse from "@/models/InterviewResponse";

export async function POST(request: NextRequest) {
  try {
    await connectToMongo();
    
    const body = await request.json();
    const {
      candidateId,
      candidateEmail,
      interviewType,
      taskId,
      taskTitle,
      response,
      chatHistory,
      metadata,
    } = body;

    // Validation
    if (!candidateId || !candidateEmail || !interviewType || !taskId || !taskTitle) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new response document
    const interviewResponse = await InterviewResponse.create({
      candidateId,
      candidateEmail,
      interviewType,
      taskId,
      taskTitle,
      response: response || JSON.stringify(chatHistory), // Store chat history as response
      startedAt: new Date(),
      submittedAt: new Date(),
      timeSpentSeconds: 0,
      metadata: {
        chatHistory: chatHistory || [],
        ...metadata,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Response saved successfully",
      responseId: interviewResponse._id,
    });
  } catch (error) {
    console.error("Error saving interview response:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save response",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
