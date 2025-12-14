# Leads by Pandey Solutions

A professional lead generation strategy tool powered by AI. Generate personalized 5-piece strategies for your prospects with Mr. Pandey, your AI sales mentor.

## Features

- **User Authentication**: Secure registration and login with JWT-based authentication
- **Prospect Management**: Create, save, and manage multiple prospects
- **AI-Powered Strategy Generation**: Generate comprehensive lead generation strategies including:
  - Prospect Summary
  - Pain Point Hypothesis
  - Positioning Strategy
  - Communication Tone Suggestions
  - First Message Structure
- **Persistent Storage**: All prospects and strategies are saved per user using Supabase (PostgreSQL)
- **Professional UI**: Modern, sales-focused black and gold design

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - PostgreSQL database for persistent storage
- **OpenRouter API** - AI model integration
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenRouter API key ([Get one here](https://openrouter.ai/))
- Supabase account ([Get one here](https://supabase.com)) - Free tier available

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leads-by-pandey
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase database:
   - Create a project at [supabase.com](https://supabase.com)
   - Go to **SQL Editor** and run `supabase-schema.sql`
   - Get your API credentials from **Settings** → **API**

4. Create a `.env` file in the root directory:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
JWT_SECRET=your_strong_random_secret_here
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
```

**Generate JWT secret:**
```bash
openssl rand -base64 32
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment (AWS Amplify)

### Environment Variables

Set these in AWS Amplify Console → App settings → Environment variables:

- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `JWT_SECRET` - A strong, randomly generated secret
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NODE_ENV` - Set to `production`

### Database Setup

1. Run `supabase-schema.sql` in your Supabase SQL Editor
2. The schema includes RLS policies for secure access
3. Users and prospects will persist across deployments

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── mr-pandey/    # Strategy generation
│   │   └── prospects/    # Prospect management
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── page.tsx          # Main application page
├── components/           # React components
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── db-supabase.ts   # Supabase database adapter
│   ├── openrouter.ts    # OpenRouter API client
│   └── types.ts         # TypeScript types
└── scripts/              # Utility scripts
    ├── create-test-user.ts
    └── verify-test-user.ts
```

## Security Features

- Password hashing with bcrypt
- JWT tokens with httpOnly cookies
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- User data isolation
- Protected API routes

## License

Private - All rights reserved
