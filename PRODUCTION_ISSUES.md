# Production Issues and Solutions

## Issue 1: Environment Variables Not Accessible at Runtime ✅ FIXED

### Problem
Environment variables set in AWS Amplify Console are available during build but not accessible at runtime in Next.js API routes.

### Root Cause
AWS Amplify environment variables are only available during the build phase. Next.js API routes running at runtime cannot access these variables unless they are written to a `.env.production` file during build.

### Solution
Modified `amplify.yml` to write environment variables to `.env.production` during the preBuild phase. Next.js automatically loads this file at runtime.

### Status
✅ Fixed in `amplify.yml` - environment variables are now written to `.env.production` during build.

---

## Issue 2: User Data Not Persisting Across Deployments ⚠️ ARCHITECTURAL LIMITATION

### Problem
User accounts and data created in production are lost after each new deployment.

### Root Cause
The application uses **file-based storage** (`data/users.json` and `data/prospects/` directory). In AWS Amplify (and most serverless/containerized environments), the filesystem is **ephemeral**:
- Each deployment creates a fresh container
- Files written during runtime are stored in the container's filesystem
- When the container is destroyed (on redeploy, restart, or scale), all data is lost
- The `data/` directory is in `.gitignore` and is not persisted between deployments

### Current Behavior
- ✅ Users can register and login during a deployment
- ✅ Data persists while the container is running
- ❌ Data is lost when:
  - A new deployment is triggered
  - The container restarts
  - The application scales

### Solutions

#### Option 1: Use a Database (Recommended for Production)
Migrate to a persistent database:

**AWS Options:**
- **AWS Amplify DataStore** - Managed database with automatic sync
- **Amazon DynamoDB** - NoSQL database (serverless, scales automatically)
- **Amazon RDS** - Managed PostgreSQL/MySQL (more traditional, requires connection pooling)
- **Amazon Aurora Serverless** - Auto-scaling relational database

**Implementation Steps:**
1. Choose a database solution
2. Update `lib/db.ts` to use database instead of file system
3. Update API routes to use database queries
4. Set up database connection pooling for serverless

#### Option 2: Use AWS S3 for File Storage (Temporary Workaround)
Store user data in S3 buckets instead of local filesystem:
- More persistent than local files
- Still requires migration to proper database for production
- Can be used as interim solution

#### Option 3: Accept Ephemeral Storage (Development/Testing Only)
- Keep current file-based storage
- Document that data is temporary
- Only suitable for development/testing, not production

### Recommended Action
**For Production:** Implement Option 1 (Database) - DynamoDB is recommended for serverless Next.js applications as it:
- Scales automatically
- Has no connection pooling issues
- Works seamlessly with AWS Amplify
- Provides persistent storage
- Has a generous free tier

### Migration Path
1. Set up DynamoDB table(s) in AWS Console
2. Install AWS SDK: `npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb`
3. Create new `lib/db-dynamodb.ts` with database functions
4. Update API routes to use new database functions
5. Deploy and test
6. (Optional) Migrate existing data if needed

---

## Current Status

- ✅ **Environment Variables**: Fixed - now accessible at runtime
- ⚠️ **User Persistence**: Architectural limitation - requires database migration for production use

## Next Steps

1. **Immediate**: Deploy the environment variable fix
2. **Short-term**: Plan database migration (DynamoDB recommended)
3. **Long-term**: Implement proper database solution for production

