import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/twilio';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Webhook to handle Twilio message status callbacks
 * Tracks delivery, read receipts, and failures
 */
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

    // Extract status data
    const messageSid = body.MessageSid as string;
    const messageStatus = body.MessageStatus as string;
    const errorCode = body.ErrorCode as string;
    const errorMessage = body.ErrorMessage as string;

    // Log status update
    console.log('Message status update:', {
      messageSid,
      messageStatus,
      errorCode,
      errorMessage,
    });

    // Store status update in database (optional)
    // You could create a message_status table to track this
    if (errorCode) {
      console.error('Message delivery error:', {
        messageSid,
        errorCode,
        errorMessage,
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Status webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
