import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { connectToMongo } from '@/lib/mongodb';
import InterviewResponse from '@/models/InterviewResponse';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ResponseData {
  interviewType: string;
  taskTitle: string;
  timeSpentSeconds: number;
  response?: string;
  metadata?: any;
  chatHistory?: Array<{ role: string; text: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const { candidateEmail, jobRequirements, cultureValues } = await req.json();

    if (!candidateEmail) {
      return NextResponse.json(
        { error: 'Candidate email is required' },
        { status: 400 }
      );
    }

    // Fetch all responses for this candidate
    await connectToMongo();

    const responseDocs = await InterviewResponse
      .find({ candidateEmail })
      .sort({ createdAt: 1 });

    if (responseDocs.length === 0) {
      return NextResponse.json(
        { error: 'No interview responses found for this candidate' },
        { status: 404 }
      );
    }

    // Map to ResponseData type
    const responses: ResponseData[] = responseDocs.map((doc) => ({
      interviewType: doc.interviewType,
      taskTitle: doc.taskTitle,
      timeSpentSeconds: doc.timeSpentSeconds,
      response: doc.response,
      metadata: doc.metadata,
      chatHistory: doc.metadata?.chatHistory,
    }));

    // Organize responses by interview type
    const technical1 = responses.filter((r: ResponseData) => r.interviewType === 'technical1');
    const technical2 = responses.filter((r: ResponseData) => r.interviewType === 'technical2');
    const behavioural = responses.filter((r: ResponseData) => r.interviewType === 'behavioural');

    // Build context for AI analysis
    let context = `You are an expert hiring manager analyzing a candidate's complete interview performance. Please provide a comprehensive hiring recommendation.

CANDIDATE EMAIL: ${candidateEmail}

JOB REQUIREMENTS:
${jobRequirements?.map((req: any) => `- ${req.quality} (${req.importance})`).join('\n') || 'Not specified'}

COMPANY CULTURE VALUES:
${cultureValues?.map((cv: any) => `- ${cv.value}: ${cv.description}`).join('\n') || 'Not specified'}

INTERVIEW PERFORMANCE:

`;

    // Add Technical 1 responses
    if (technical1.length > 0) {
      context += `=== TECHNICAL ASSESSMENT 1 - CODING ===\n`;
      technical1.forEach((resp: ResponseData) => {
        context += `\nTask: ${resp.taskTitle}\n`;
        context += `Difficulty: ${resp.metadata?.difficulty || 'N/A'}\n`;
        context += `Time Spent: ${Math.floor(resp.timeSpentSeconds / 60)}m ${resp.timeSpentSeconds % 60}s\n`;
        context += `Completed: ${resp.metadata?.completed ? 'Yes' : 'No'}\n`;
        if (resp.response) {
          context += `Solution:\n${resp.response}\n`;
        }
      });
    }

    // Add Technical 2 responses
    if (technical2.length > 0) {
      context += `\n=== TECHNICAL ASSESSMENT 2 - SCENARIOS ===\n`;
      technical2.forEach((resp: ResponseData) => {
        context += `\nTask: ${resp.taskTitle}\n`;
        context += `Difficulty: ${resp.metadata?.difficulty || 'N/A'}\n`;
        context += `Time Spent: ${Math.floor(resp.timeSpentSeconds / 60)}m ${resp.timeSpentSeconds % 60}s\n`;
        context += `Completed: ${resp.metadata?.completed ? 'Yes' : 'No'}\n`;
        if (resp.response) {
          context += `Analysis:\n${resp.response}\n`;
        }
      });
    }

    // Add Behavioural responses
    if (behavioural.length > 0) {
      context += `\n=== BEHAVIORAL ASSESSMENT ===\n`;
      behavioural.forEach((resp: ResponseData) => {
        context += `\nScenario: ${resp.taskTitle}\n`;
        if (resp.metadata?.question) {
          context += `Question: ${resp.metadata.question}\n`;
        }
        if (resp.response) {
          context += `Response: ${resp.response}\n`;
        }
        if (resp.chatHistory && resp.chatHistory.length > 0) {
          context += `Conversation:\n`;
          resp.chatHistory.forEach((msg: any) => {
            context += `${msg.role === 'candidate' ? 'Candidate' : 'AI'}: ${msg.text}\n`;
          });
        }
      });
    }

    context += `\n\nBased on this complete interview performance, provide a structured recommendation in the following JSON format:
{
  "decision": "hire" | "reject" | "review",
  "reasoning": "2-3 sentences explaining your recommendation",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "overallScore": 1-10,
  "technicalScore": 1-10,
  "behavioralScore": 1-10,
  "culturalFit": 1-10,
  "emailSubject": "appropriate email subject line",
  "emailBody": "professional email body (3-4 paragraphs)"
}

Decision guidelines:
- "hire": Strong candidate, scores 8+ overall, minimal concerns
- "reject": Weak candidate, scores below 6, significant concerns
- "review": Borderline candidate, scores 6-7, needs discussion

For "hire" decision, draft a positive next-steps email.
For "reject" decision, draft a polite rejection email.
For "review" decision, draft an email requesting additional information or next round.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: context,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI recommendation');
    }

    const recommendationData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      recommendation: recommendationData,
    });
  } catch (error: any) {
    console.error('Error generating recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation', details: error.message },
      { status: 500 }
    );
  }
}
