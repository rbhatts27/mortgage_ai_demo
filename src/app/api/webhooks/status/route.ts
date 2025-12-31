import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/twilio';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Webhook to handle Twilio status callbacks
 * Tracks message delivery status and call completion
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

    // Handle call status updates
    if (body.CallSid) {
      const callSid = body.CallSid as string;
      const callStatus = body.CallStatus as string;
      const from = body.From as string;

      console.log('Call status update:', { callSid, callStatus, from });

      // When call is completed, mark the voice conversation as completed
      if (callStatus === 'completed' && from) {
        const { error } = await (supabaseAdmin
          .from('conversations') as any)
          .update({ status: 'completed' })
          .eq('customer_phone', from)
          .eq('channel', 'voice')
          .eq('status', 'active');

        if (error) {
          console.error('Error updating conversation status:', error);
        } else {
          console.log(`Marked voice conversation as completed for ${from}`);
        }
      }
    }

    // Handle message status updates
    if (body.MessageSid) {
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
