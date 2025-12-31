// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          customer_phone: string;
          channel: 'voice' | 'sms' | 'whatsapp';
          status: 'active' | 'handed_off' | 'completed';
          ai_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_phone: string;
          channel: 'voice' | 'sms' | 'whatsapp';
          status?: 'active' | 'handed_off' | 'completed';
          ai_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_phone?: string;
          channel?: 'voice' | 'sms' | 'whatsapp';
          status?: 'active' | 'handed_off' | 'completed';
          ai_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          created_at?: string;
        };
      };
      customer_profiles: {
        Row: {
          id: string;
          phone: string;
          name: string | null;
          email: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          name?: string | null;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          name?: string | null;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Application types
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ConversationContext {
  conversationId: string;
  customerPhone: string;
  channel: 'voice' | 'sms' | 'whatsapp';
  messages: ConversationMessage[];
}

export interface AIResponse {
  message: string;
  shouldHandoff: boolean;
  handoffReason?: string;
}
