# Pandey Solutions - AI Sales Mentor

A professional lead generation strategy tool powered by AI. Get personalized 5-piece strategies for your prospects with Mr. Pandey, your AI sales mentor.

## Features

- **User Authentication**: Secure registration and login with JWT-based authentication
- **Prospect Management**: Create, save, and manage multiple prospects
- **AI-Powered Strategy Generation**: Generate comprehensive lead generation strategies including:
  - Prospect Summary
  - Pain Point Hypothesis
  - Positioning Strategy
  - Communication Tone Suggestions
  - First Message Structure
- **Persistent Storage**: All prospects and strategies are saved per user
- **Professional UI**: Modern, sales-focused black and gold design

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **OpenRouter API** - AI model integration
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Leads
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your environment variables:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
JWT_SECRET=your_strong_random_secret_here
```

**Important**: For production, generate a strong JWT secret:
```bash
openssl rand -base64 32
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Environment Variables for Production

Make sure to set:
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `JWT_SECRET` - A strong, randomly generated secret (required)
- `NODE_ENV=production` - Set to production mode

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
│   ├── ErrorBoundary.tsx
│   ├── ProspectForm.tsx
│   ├── ProspectList.tsx
│   └── StrategyPanel.tsx
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── auth-context.tsx  # Auth React context
│   ├── db.ts             # File-based database
│   ├── openrouter.ts     # OpenRouter API client
│   └── types.ts          # TypeScript types
└── data/                 # User data storage (created automatically)
```

## Data Storage

The application uses file-based storage in the `data/` directory:
- `data/users.json` - User accounts
- `data/prospects/` - User-specific prospect files

**Note**: For production, consider migrating to a proper database (PostgreSQL, MongoDB, etc.)

## Security Features

- Password hashing with bcrypt
- JWT tokens with httpOnly cookies
- Input validation and sanitization
- User data isolation
- Protected API routes

## License

Private - All rights reserved

