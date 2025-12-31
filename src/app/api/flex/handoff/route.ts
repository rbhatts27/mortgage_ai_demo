import { NextRequest, NextResponse } from 'next/server';
import { twilioClient, TWILIO_CONFIG } from '@/lib/twilio';
import { markConversationHandedOff } from '@/lib/conversation';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * API route to create a Twilio Flex task for human agent handoff
 */
export async function POST(request: NextRequest) {
  try {
    const { conversationId, customerPhone, channel, reason } = await request.json();

    // Validate input
    if (!conversationId || !customerPhone) {
      return NextResponse.json(
        { error: 'conversationId and customerPhone are required' },
        { status: 400 }
      );
    }

    // Get customer profile information
    const { data } = await supabaseAdmin
      .from('customer_profiles')
      .select('name, email')
      .eq('phone', customerPhone)
      .single();

    const profile = data as { name: string | null; email: string | null } | null;

    // Create Flex task
    const task = await twilioClient.taskrouter.v1
      .workspaces(TWILIO_CONFIG.flexWorkspaceSid!)
      .tasks.create({
        workflowSid: TWILIO_CONFIG.flexWorkflowSid!,
        taskChannel: channel === 'voice' ? 'voice' : 'chat',
        attributes: JSON.stringify({
          type: 'ai_handoff',
          conversationId,
          customerPhone,
          customerName: profile?.name || 'Unknown',
          customerEmail: profile?.email || '',
          channel,
          handoffReason: reason || 'Customer requested human assistance',
          priority: 1,
        }),
      });

    // Mark conversation as handed off
    await markConversationHandedOff(conversationId);

    console.log('Flex task created:', task.sid);

    return NextResponse.json({
      success: true,
      taskSid: task.sid,
    });

  } catch (error) {
    console.error('Flex handoff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
