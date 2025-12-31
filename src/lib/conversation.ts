import { openai, AI_CONFIG, SYSTEM_PROMPT } from './openai';
import { supabaseAdmin } from './supabase';
import type { AIResponse, ConversationContext, ConversationMessage } from './types';

/**
 * Get or create a conversation for a customer
 */
export async function getOrCreateConversation(
  customerPhone: string,
  channel: 'voice' | 'sms' | 'whatsapp'
): Promise<string> {
  // Check for existing active conversation
  const { data: existing } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('customer_phone', customerPhone)
    .eq('status', 'active')
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new conversation
  const { data: newConv, error } = await supabaseAdmin
    .from('conversations')
    .insert({
      customer_phone: customerPhone,
      channel,
      status: 'active',
      ai_enabled: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return newConv.id;
}

/**
 * Get conversation history
 */
export async function getConversationHistory(
  conversationId: string
): Promise<ConversationMessage[]> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
  }));
}

/**
 * Save a message to the conversation
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    });

  if (error) throw error;
}

/**
 * Generate AI response based on conversation context
 */
export async function generateAIResponse(
  context: ConversationContext
): Promise<AIResponse> {
  try {
    // Build messages array for OpenAI
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...context.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages,
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
    });

    const aiMessage = completion.choices[0].message.content || 'I apologize, I could not generate a response.';

    // Determine if handoff is needed
    const shouldHandoff = detectHandoffIntent(aiMessage, context);

    return {
      message: aiMessage,
      shouldHandoff,
      handoffReason: shouldHandoff ? 'Customer requested human assistance' : undefined,
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      message: 'I apologize, but I encountered an error. Let me connect you with a human agent.',
      shouldHandoff: true,
      handoffReason: 'AI error',
    };
  }
}

/**
 * Detect if the conversation should be handed off to a human agent
 */
function detectHandoffIntent(aiMessage: string, context: ConversationContext): boolean {
  const handoffKeywords = [
    'connect you with',
    'transfer you to',
    'speak with a person',
    'human agent',
    'specialist',
  ];

  return handoffKeywords.some((keyword) =>
    aiMessage.toLowerCase().includes(keyword)
  );
}

/**
 * Mark conversation as handed off
 */
export async function markConversationHandedOff(conversationId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('conversations')
    .update({ status: 'handed_off' })
    .eq('id', conversationId);

  if (error) throw error;
}
