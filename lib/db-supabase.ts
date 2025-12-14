import { User, UserWithPassword, SavedProspect } from "./types";
import { supabase } from "./supabase";
import * as fsDb from "./db"; // Fallback to file-based storage

/**
 * Supabase Database Adapter
 * Uses Supabase PostgreSQL for persistent storage
 * Falls back to file-based storage if Supabase is not configured
 */

// Check if Supabase is available
const isSupabaseAvailable = () => {
  return supabase !== null;
};

/**
 * Load all users from Supabase
 */
export async function loadUsers(): Promise<UserWithPassword[]> {
  if (!isSupabaseAvailable()) {
    // Fallback to file-based storage
    return fsDb.loadUsers();
  }

  try {
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error loading users from Supabase:", error);
      // Fallback to file-based storage on error
      return fsDb.loadUsers();
    }

    return (data || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.password_hash,
      createdAt: new Date(user.created_at).getTime(),
    }));
  } catch (error) {
    console.error("Error loading users:", error);
    return fsDb.loadUsers();
  }
}

/**
 * Save users to Supabase
 */
export async function saveUsers(users: UserWithPassword[]): Promise<void> {
  if (!isSupabaseAvailable()) {
    // Fallback to file-based storage
    return fsDb.saveUsers(users);
  }

  // Note: In a real app, you'd typically update individual users
  // For simplicity, we'll use upsert operations
  // This is not ideal for bulk operations, but works for MVP
  try {
    const usersToUpsert = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      password_hash: user.passwordHash,
      created_at: new Date(user.createdAt).toISOString(),
    }));

    const { error } = await supabase!
      .from('users')
      .upsert(usersToUpsert, { onConflict: 'id' });

    if (error) {
      console.error("Error saving users to Supabase:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error saving users:", error);
    // Fallback to file-based storage on error
    fsDb.saveUsers(users);
    throw error;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db-supabase.ts:90',message:'findUserByEmail entry',data:{email,supabaseAvailable:isSupabaseAvailable(),supabaseUrl:process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'none',hasSupabaseKey:!!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  if (!isSupabaseAvailable()) {
    console.log('⚠️  Supabase not available, using file-based storage fallback');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db-supabase.ts:92',message:'Supabase not available - using file fallback',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    return fsDb.findUserByEmail(email);
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Searching for user in Supabase: "${normalizedEmail}"`);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db-supabase.ts:98',message:'Querying Supabase for user',data:{normalizedEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db-supabase.ts:103',message:'Supabase query result',data:{hasData:!!data,hasError:!!error,errorCode:error?.code||'none',errorMessage:error?.message||'none',userEmail:data?.email||'none',hasPasswordHash:!!data?.password_hash},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user not found
        console.log(`❌ User not found in Supabase: "${normalizedEmail}"`);
        return null;
      }
      console.error("Error finding user by email in Supabase:", error);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.log("   Falling back to file-based storage");
      return fsDb.findUserByEmail(email);
    }

    if (!data) {
      console.log(`❌ No data returned for user: "${normalizedEmail}"`);
      return null;
    }

    console.log(`✅ User found in Supabase: ${data.email} (ID: ${data.id})`);
    console.log(`   Password hash from DB: ${data.password_hash ? data.password_hash.substring(0, 20) + '...' : 'MISSING'}`);
    console.log(`   Password hash length: ${data.password_hash?.length || 0}`);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db-supabase.ts:123',message:'User found - returning user data',data:{userId:data.id,userEmail:data.email,hasPasswordHash:!!data.password_hash,passwordHashLength:data.password_hash?.length||0,passwordHashPrefix:data.password_hash?.substring(0,30)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      passwordHash: data.password_hash,
      createdAt: new Date(data.created_at).getTime(),
    };
  } catch (error) {
    console.error("Error finding user:", error);
    return fsDb.findUserByEmail(email);
  }
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<UserWithPassword | null> {
  if (!isSupabaseAvailable()) {
    return fsDb.findUserById(id);
  }

  try {
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error("Error finding user by ID:", error);
      return fsDb.findUserById(id);
    }

    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      passwordHash: data.password_hash,
      createdAt: new Date(data.created_at).getTime(),
    };
  } catch (error) {
    console.error("Error finding user:", error);
    return fsDb.findUserById(id);
  }
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  name: string,
  passwordHash: string
): Promise<UserWithPassword> {
  if (!isSupabaseAvailable()) {
    return fsDb.createUser(email, name, passwordHash);
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const newUser: UserWithPassword = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      createdAt: Date.now(),
    };

    const { error } = await supabase!
      .from('users')
      .insert({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        password_hash: newUser.passwordHash,
        created_at: new Date(newUser.createdAt).toISOString(),
      });

    if (error) {
      console.error("Error creating user in Supabase:", error);
      throw error;
    }

    console.log(`User created successfully in Supabase: ${newUser.email} (ID: ${newUser.id})`);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    // Fallback to file-based storage
    return fsDb.createUser(email, name, passwordHash);
  }
}

/**
 * Load prospects for a user
 */
export async function loadUserProspects(userId: string): Promise<SavedProspect[]> {
  if (!isSupabaseAvailable()) {
    return fsDb.loadUserProspects(userId);
  }

  try {
    const { data, error } = await supabase!
      .from('prospects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading prospects from Supabase:", error);
      return fsDb.loadUserProspects(userId);
    }

    return (data || []).map((prospect: any) => ({
      id: prospect.id,
      name: prospect.name,
      title: prospect.title,
      company: prospect.company,
      industry: prospect.industry,
      notes: prospect.notes || '',
      knownPainPoints: prospect.known_pain_points || '',
      links: prospect.links || [],
      priorInteractions: prospect.prior_interactions || '',
      createdAt: new Date(prospect.created_at).getTime(),
      strategy: prospect.strategy ? JSON.parse(prospect.strategy) : null,
      strategyGeneratedAt: prospect.strategy_generated_at 
        ? new Date(prospect.strategy_generated_at).getTime() 
        : null,
    }));
  } catch (error) {
    console.error("Error loading prospects:", error);
    return fsDb.loadUserProspects(userId);
  }
}

/**
 * Save prospects for a user
 */
export async function saveUserProspects(userId: string, prospects: SavedProspect[]): Promise<void> {
  if (!isSupabaseAvailable()) {
    return fsDb.saveUserProspects(userId, prospects);
  }

  try {
    // Delete existing prospects for this user
    const { error: deleteError } = await supabase!
      .from('prospects')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error("Error deleting existing prospects:", deleteError);
    }

    // Insert all prospects
    if (prospects.length > 0) {
      const prospectsToInsert = prospects.map(prospect => ({
        id: prospect.id,
        user_id: userId,
        name: prospect.name,
        title: prospect.title,
        company: prospect.company,
        industry: prospect.industry,
        notes: prospect.notes || '',
        known_pain_points: prospect.knownPainPoints || '',
        links: prospect.links || [],
        prior_interactions: prospect.priorInteractions || '',
        created_at: new Date(prospect.createdAt).toISOString(),
        strategy: prospect.strategy ? JSON.stringify(prospect.strategy) : null,
        strategy_generated_at: prospect.strategyGeneratedAt 
          ? new Date(prospect.strategyGeneratedAt).toISOString() 
          : null,
      }));

      const { error: insertError } = await supabase!
        .from('prospects')
        .insert(prospectsToInsert);

      if (insertError) {
        console.error("Error saving prospects to Supabase:", insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error saving prospects:", error);
    // Fallback to file-based storage
    fsDb.saveUserProspects(userId, prospects);
    throw error;
  }
}

