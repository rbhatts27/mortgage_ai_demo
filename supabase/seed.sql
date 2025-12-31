-- Seed data for demo: Sarah's customer profile
INSERT INTO customer_profiles (phone, name, email, notes)
VALUES
  ('+15555551234', 'Sarah Johnson', 'sarah.johnson@example.com', 'Demo customer - Active mortgage application in progress')
ON CONFLICT (phone) DO NOTHING;

-- Sample conversation
INSERT INTO conversations (customer_phone, channel, status, ai_enabled)
VALUES
  ('+15555551234', 'sms', 'completed', TRUE)
ON CONFLICT DO NOTHING;

-- You can add more demo data here as needed
