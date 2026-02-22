import { NextRequest, NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import InterviewResponse from "@/models/InterviewResponse";

export async function GET(request: NextRequest) {
  try {
    await connectToMongo();
    
    const { searchParams } = new URL(request.url);
    const candidateEmail = searchParams.get('email');
    const interviewType = searchParams.get('type');
    
    // Build query
    const query: any = {};
    if (candidateEmail) query.candidateEmail = candidateEmail;
    if (interviewType) query.interviewType = interviewType;

    // Get responses
    const responses = await InterviewResponse.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      count: responses.length,
      responses: responses.map(r => ({
        id: r._id,
        candidateId: r.candidateId,
        candidateEmail: r.candidateEmail,
        interviewType: r.interviewType,
        taskId: r.taskId,
        taskTitle: r.taskTitle,
        response: r.response,
        chatHistory: r.metadata?.chatHistory || [],
        timeSpentSeconds: r.timeSpentSeconds,
        metadata: r.metadata,
        createdAt: r.createdAt,
        submittedAt: r.submittedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch responses",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
