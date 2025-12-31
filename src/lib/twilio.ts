import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

export const twilioClient = twilio(accountSid, authToken);

// Twilio configuration
export const TWILIO_CONFIG = {
  phoneNumber: process.env.TWILIO_PHONE_NUMBER!,
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  flexWorkspaceSid: process.env.TWILIO_FLEX_WORKSPACE_SID,
  flexWorkflowSid: process.env.TWILIO_FLEX_WORKFLOW_SID,
};

// Helper to verify Twilio webhook signatures
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, any>
): boolean {
  return twilio.validateRequest(
    authToken,
    signature,
    url,
    params
  );
}
