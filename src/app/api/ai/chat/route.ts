import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateConversation, saveMessage, getConversationHistory, generateAIResponse } from '@/lib/conversation';

/**
 * API route for testing AI chat functionality
 * Can be used for dashboard testing or web chat interface
 */
export async function POST(request: NextRequest) {
  try {
    const { customerPhone, message, channel } = await request.json();

    // Validate input
    if (!customerPhone || !message) {
      return NextResponse.json(
        { error: 'customerPhone and message are required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    const conversationId = await getOrCreateConversation(
      customerPhone,
      channel || 'sms'
    );

    // Save user message
    await saveMessage(conversationId, 'user', message);

    // Get conversation history
    const history = await getConversationHistory(conversationId);

    // Generate AI response
    const aiResponse = await generateAIResponse({
      conversationId,
      customerPhone,
      channel: channel || 'sms',
      messages: history,
    });

    // Save AI response
    await saveMessage(conversationId, 'assistant', aiResponse.message);

    return NextResponse.json({
      success: true,
      response: aiResponse.message,
      shouldHandoff: aiResponse.shouldHandoff,
      conversationId,
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
