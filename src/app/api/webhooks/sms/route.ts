import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature, twilioClient, TWILIO_CONFIG } from '@/lib/twilio';
import { getOrCreateConversation, saveMessage, getConversationHistory, generateAIResponse } from '@/lib/conversation';

export async function POST(request: NextRequest) {
  try {
    // Get form data from Twilio webhook
    const formData = await request.formData();
    const body = Object.fromEntries(formData);

    // Verify Twilio signature for security
    const signature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;

    if (!validateTwilioSignature(signature, url, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Extract SMS data
    const customerPhone = body.From as string;
    const messageBody = body.Body as string;
    const messageSid = body.MessageSid as string;

    // Determine channel (SMS or WhatsApp)
    const channel = customerPhone.startsWith('whatsapp:') ? 'whatsapp' : 'sms';

    // Get or create conversation
    const conversationId = await getOrCreateConversation(
      customerPhone.replace('whatsapp:', ''),
      channel
    );

    // Save user message
    await saveMessage(conversationId, 'user', messageBody);

    // Get conversation history
    const history = await getConversationHistory(conversationId);

    // Generate AI response
    const aiResponse = await generateAIResponse({
      conversationId,
      customerPhone: customerPhone.replace('whatsapp:', ''),
      channel,
      messages: history,
    });

    // Save AI response
    await saveMessage(conversationId, 'assistant', aiResponse.message);

    // Send SMS/WhatsApp response
    await twilioClient.messages.create({
      body: aiResponse.message,
      from: channel === 'whatsapp'
        ? TWILIO_CONFIG.whatsappNumber
        : TWILIO_CONFIG.phoneNumber,
      to: customerPhone,
    });

    // If handoff is needed, create Flex task
    if (aiResponse.shouldHandoff) {
      // This would trigger Flex task creation
      // Implementation in /api/flex/handoff
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/flex/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          customerPhone: customerPhone.replace('whatsapp:', ''),
          channel,
          reason: aiResponse.handoffReason,
        }),
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('SMS webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
