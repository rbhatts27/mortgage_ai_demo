import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/twilio';
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

    // Extract voice call data
    const customerPhone = body.From as string;
    const speechResult = body.SpeechResult as string;
    const callSid = body.CallSid as string;

    // Always get or create conversation (even for initial greeting)
    const conversationId = await getOrCreateConversation(customerPhone, 'voice');

    // Save initial greeting message if this is the first interaction
    if (!speechResult) {
      await saveMessage(conversationId, 'assistant', 'Hello! I\'m Sarah, your AI mortgage assistant. How can I help you today?');
    }

    // Process user speech and generate response
    if (speechResult) {
      await saveMessage(conversationId, 'user', speechResult);

      // Get conversation history
      const history = await getConversationHistory(conversationId);

      // Generate AI response
      const aiResponse = await generateAIResponse({
        conversationId,
        customerPhone,
        channel: 'voice',
        messages: history,
      });

      // Save AI response
      await saveMessage(conversationId, 'assistant', aiResponse.message);

      // Build TwiML response
      const webhookUrl = new URL('/api/webhooks/voice', request.url).toString();

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${aiResponse.message}</Say>
  ${aiResponse.shouldHandoff
    ? '<Dial><Queue>human_agents</Queue></Dial>'
    : `<Gather input="speech" action="${webhookUrl}" timeout="5" speechTimeout="auto">
    <Say voice="Polly.Joanna">How else can I help you?</Say>
  </Gather>
  <Say voice="Polly.Joanna">I didn't hear anything. Let me connect you with a human agent.</Say>
  <Dial><Queue>human_agents</Queue></Dial>`
  }
</Response>`;

      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Initial greeting
    const webhookUrl = new URL('/api/webhooks/voice', request.url).toString();

    const greeting = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${webhookUrl}" timeout="5" speechTimeout="auto">
    <Say voice="Polly.Joanna">Hello! I'm Sarah, your AI mortgage assistant. How can I help you today?</Say>
  </Gather>
  <Say voice="Polly.Joanna">I didn't hear anything. Goodbye!</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(greeting, {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error('Voice webhook error:', error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>I apologize, but I encountered an error. Please try again later.</Say>
</Response>`;
    return new NextResponse(errorTwiml, {
      status: 500,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
