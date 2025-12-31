import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Admin endpoint to close old active conversations
 * This is useful for cleaning up stuck conversations
 */
export async function POST() {
  try {
    // Find voice conversations that are active but older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { error } = await (supabaseAdmin
      .from('conversations') as any)
      .update({ status: 'completed' })
      .eq('channel', 'voice')
      .eq('status', 'active')
      .lt('updated_at', tenMinutesAgo);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Old voice conversations marked as completed',
    });

  } catch (error) {
    console.error('Error closing old conversations:', error);
    return NextResponse.json(
      { error: 'Failed to close old conversations' },
      { status: 500 }
    );
  }
}
