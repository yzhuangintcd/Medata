import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  scenario: {
    id: number;
    title: string;
    situation: string;
  };
  role: string; // e.g., "Senior Software Engineer", "Full Stack Developer"
  conversationHistory: Message[]; // Previous messages in the conversation
}

// Budget tracking (simple in-memory, reset on server restart)
let totalTokensUsed = 0;
const BUDGET_TOKENS = 20000; // ~$0.30 with Haiku pricing (10k tokens = ~$0.15)

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { scenario, role, conversationHistory = [] } = body;

    // Check budget
    if (totalTokensUsed > BUDGET_TOKENS * 0.9) {
      return NextResponse.json(
        { error: 'API budget nearly reached. Please contact support.' },
        { status: 429 }
      );
    }

    const systemPrompt = `You are a conversational technical interviewer evaluating candidates for a ${role} position.

Scenario Context: "${scenario.title}" - ${scenario.situation}

Your role:
- Have a natural conversation with the candidate about this scenario
- If this is the start (no history), ask an opening question about how they'd handle it
- If continuing a conversation, respond naturally to their answer with:
  * Follow-up questions that probe deeper
  * Requests for specific examples or clarification
  * Challenges to their reasoning (respectfully)
  * Acknowledgment of good points before asking what else they'd consider
- Keep responses concise (2-4 sentences, about 30-50 words)
- Be direct, professional, and engaging
- Guide the conversation to explore their decision-making, communication, integrity, and technical judgment
- Don't just accept surface-level answers - dig deeper

Remember: You're conducting a live interview, not writing an essay. Keep it conversational and dynamic.`;

    // Build the messages array for Claude
    // If no history, start with a request to begin the interview
    // If history exists, pass it along for context
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = 
      conversationHistory.length === 0
        ? [
            {
              role: 'user',
              content: 'Begin the behavioral interview by asking your first question about this scenario.',
            },
          ]
        : conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
          }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      temperature: 0.8,
      system: systemPrompt,
      messages,
    });

    // Extract token usage
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;
    totalTokensUsed += totalTokens;

    // Get the response text
    const aiResponse =
      response.content[0].type === 'text' ? response.content[0].text : '';

    console.log(`✅ Claude response generated`);
    console.log(`📊 Tokens used: ${totalTokens} (Total so far: ${totalTokensUsed})`);
    console.log(`💰 Approx cost: $${(totalTokensUsed * 0.00015).toFixed(4)}`);

    return NextResponse.json(
      {
        success: true,
        response: aiResponse,
        tokenUsage: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
          cumulativeTotal: totalTokensUsed,
          estimatedCost: `$${(totalTokensUsed * 0.00015).toFixed(4)}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error calling Claude API:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
