import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Get all conversations with customer info
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        customer_phone,
        channel,
        status,
        ai_enabled,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Get message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { count } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);

        return {
          ...conv,
          messageCount: count || 0,
        };
      })
    );

    // Calculate stats
    const activeCount = conversations?.filter(c => c.status === 'active').length || 0;
    const handedOffToday = conversations?.filter(c => {
      const today = new Date().toDateString();
      const convDate = new Date(c.updated_at).toDateString();
      return c.status === 'handed_off' && convDate === today;
    }).length || 0;

    const totalCompleted = conversations?.filter(c => c.status === 'completed').length || 0;
    const totalHandedOff = conversations?.filter(c => c.status === 'handed_off').length || 0;
    const aiResolutionRate = totalCompleted + totalHandedOff > 0
      ? Math.round((totalCompleted / (totalCompleted + totalHandedOff)) * 100)
      : 0;

    return NextResponse.json({
      conversations: conversationsWithCounts,
      stats: {
        active: activeCount,
        handedOffToday,
        aiResolutionRate,
      },
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
