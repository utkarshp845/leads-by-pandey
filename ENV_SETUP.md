# Environment Variables Setup

## Required Environment Variables

### 1. OPENROUTER_API_KEY (Required for AI Strategy Generation)

**What it is:** Your API key for OpenRouter, which provides access to AI models for generating lead generation strategies.

**How to get it:**
1. Go to https://openrouter.ai/
2. Sign up for a free account
3. Navigate to https://openrouter.ai/keys
4. Create a new API key
5. Copy the key

**How to set it:**

#### For Local Development:
1. Create a `.env` file in the root directory (if it doesn't exist)
2. Add this line:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```
3. Restart your development server (`npm run dev`)

#### For Production (AWS Amplify):
1. Go to AWS Amplify Console
2. Select your app
3. Go to "Environment variables"
4. Click "Add environment variable"
5. Key: `OPENROUTER_API_KEY`
6. Value: Your API key
7. Save and redeploy

### 2. JWT_SECRET (Required for Authentication)

**What it is:** A secret key used to sign and verify JWT tokens for user authentication.

**How to generate:**
```bash
openssl rand -base64 32
```

**How to set it:**

#### For Local Development:
Add to your `.env` file:
```
JWT_SECRET=your_generated_secret_here
```

#### For Production (AWS Amplify):
Add as an environment variable in Amplify Console.

### 3. NODE_ENV (Optional)

Set to `production` in production environments:
```
NODE_ENV=production
```

## Example .env File

Create a `.env` file in the root directory with:

```env
# OpenRouter API Key (Required for AI features)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT Secret (Required for authentication)
JWT_SECRET=your_generated_secret_here

# Environment
NODE_ENV=development
```

## Important Notes

- **Never commit your `.env` file to git** - it's already in `.gitignore`
- **Restart your dev server** after changing `.env` file
- **Keep your API keys secure** - don't share them publicly
- The `.env` file is only for local development. For production, use environment variables in your hosting platform.

## Troubleshooting

### "API configuration error" when clicking "Ask Mr Pandey"
- Check that `OPENROUTER_API_KEY` is set in your `.env` file
- Make sure you've restarted the dev server after adding it
- Verify the API key is correct at https://openrouter.ai/keys

### "Server configuration error" during registration
- Check that `JWT_SECRET` is set in your `.env` file
- Restart the dev server after adding it

