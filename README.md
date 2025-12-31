# Mortgage AI Demo

A Next.js 14 application demonstrating AI-powered customer conversations with Twilio and OpenAI, featuring seamless handoff to Twilio Flex agents.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o
- **Channels**: Twilio (Voice, SMS, WhatsApp)
- **Agent UI**: Twilio Flex

## Project Structure

```
mortgage-ai-demo/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/
│   │   │   ├── webhooks/  # Twilio webhook handlers
│   │   │   ├── ai/        # AI chat endpoint
│   │   │   └── flex/      # Flex task creation
│   │   └── dashboard/     # Dashboard UI
│   ├── lib/               # Core libraries
│   │   ├── supabase.ts    # Supabase client
│   │   ├── twilio.ts      # Twilio client
│   │   ├── openai.ts      # OpenAI client
│   │   ├── conversation.ts # Conversation logic
│   │   └── types.ts       # TypeScript types
│   └── components/        # React components
└── supabase/
    ├── migrations/        # Database migrations
    └── seed.sql          # Demo data
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Twilio account
- OpenAI API key

### Installation

1. Clone the repository and install dependencies:

```bash
cd mortgage-ai-demo
npm install
```

2. Copy the environment file:

```bash
cp .env.local.example .env.local
```

3. Configure your environment variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI
OPENAI_API_KEY=your_openai_key
```

4. Set up the database:

```bash
# Run migrations in your Supabase project
# Copy the contents of supabase/migrations/001_initial_schema.sql
# and run it in the Supabase SQL editor

# Optional: Load seed data
# Copy and run supabase/seed.sql in the SQL editor
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Configure Twilio Webhooks

1. Go to your Twilio Console
2. Navigate to Phone Numbers → Your Number
3. Set webhook URLs:
   - **SMS/MMS**: `https://your-domain.vercel.app/api/webhooks/sms`
   - **Voice**: `https://your-domain.vercel.app/api/webhooks/voice`
   - **Status Callback**: `https://your-domain.vercel.app/api/webhooks/status`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import your repository in Vercel

3. Configure environment variables in Vercel dashboard

4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

## Features

- **Multi-channel Support**: Voice, SMS, and WhatsApp
- **AI-powered Conversations**: OpenAI GPT-4o for intelligent responses
- **Smart Handoff**: Automatic detection when human agent is needed
- **Twilio Flex Integration**: Seamless task creation for agent handoff
- **Conversation History**: Full message tracking in Supabase
- **Real-time Dashboard**: Monitor conversations and AI performance

## API Endpoints

- `POST /api/webhooks/voice` - Twilio voice webhook handler
- `POST /api/webhooks/sms` - Twilio SMS/WhatsApp webhook handler
- `POST /api/webhooks/status` - Message status callbacks
- `POST /api/ai/chat` - Direct AI chat endpoint (for testing)
- `POST /api/flex/handoff` - Create Flex task for agent handoff

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT
