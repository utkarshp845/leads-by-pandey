import { User, UserWithPassword, SavedProspect, UserSettings, Reminder, Template, AnalyticsData } from "./types";
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
  if (!isSupabaseAvailable()) {
    console.log('⚠️  Supabase not available, using file-based storage fallback');
    return fsDb.findUserByEmail(email);
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Searching for user in Supabase: "${normalizedEmail}"`);
    
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

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
      strategy: prospect.strategy ? (typeof prospect.strategy === 'string' ? JSON.parse(prospect.strategy) : prospect.strategy) : null,
      strategyGeneratedAt: prospect.strategy_generated_at 
        ? new Date(prospect.strategy_generated_at).getTime() 
        : null,
      followUpDate: prospect.follow_up_date 
        ? new Date(prospect.follow_up_date).getTime() 
        : null,
      status: prospect.status || 'new',
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
        strategy: prospect.strategy ? (typeof prospect.strategy === 'string' ? prospect.strategy : JSON.stringify(prospect.strategy)) : null,
        strategy_generated_at: prospect.strategyGeneratedAt 
          ? new Date(prospect.strategyGeneratedAt).toISOString() 
          : null,
        follow_up_date: prospect.followUpDate 
          ? new Date(prospect.followUpDate).toISOString() 
          : null,
        status: prospect.status || 'new',
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

/**
 * Load user settings
 */
export async function loadUserSettings(userId: string): Promise<UserSettings | null> {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return null
        return null;
      }
      console.error("Error loading user settings:", error);
      return null;
    }

    return {
      userId: data.user_id,
      notificationPreferences: data.notification_preferences || {
        emailEnabled: true,
        emailFrequency: 'daily',
        strategyUpdates: true,
        reminderNotifications: true,
        weeklySummary: true,
      },
      aiPreferences: {
        model: data.ai_model_preference || 'openrouter/auto',
      },
      exportDefaultFormat: data.export_default_format || 'json',
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
  } catch (error) {
    console.error("Error loading user settings:", error);
    return null;
  }
}

/**
 * Save user settings
 */
export async function saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  if (!isSupabaseAvailable()) {
    return;
  }

  try {
    const { error } = await supabase!
      .from('user_settings')
      .upsert({
        user_id: userId,
        notification_preferences: settings.notificationPreferences || {},
        ai_model_preference: settings.aiPreferences?.model || 'openrouter/auto',
        export_default_format: settings.exportDefaultFormat || 'json',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error("Error saving user settings:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error saving user settings:", error);
    throw error;
  }
}

/**
 * Load reminders for a user
 */
export async function loadReminders(userId: string): Promise<Reminder[]> {
  if (!isSupabaseAvailable()) {
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('reminder_date', { ascending: true });

    if (error) {
      console.error("Error loading reminders:", error);
      return [];
    }

    return (data || []).map((reminder: any) => ({
      id: reminder.id,
      userId: reminder.user_id,
      prospectId: reminder.prospect_id,
      title: reminder.title,
      description: reminder.description,
      reminderDate: new Date(reminder.reminder_date).getTime(),
      status: reminder.status,
      createdAt: new Date(reminder.created_at).getTime(),
      updatedAt: new Date(reminder.updated_at).getTime(),
    }));
  } catch (error) {
    console.error("Error loading reminders:", error);
    return [];
  }
}

/**
 * Save a reminder
 */
export async function saveReminder(reminder: Omit<Reminder, 'createdAt' | 'updatedAt'>): Promise<Reminder> {
  if (!isSupabaseAvailable()) {
    throw new Error("Supabase not available");
  }

  try {
    const now = new Date();
    const reminderData = {
      id: reminder.id,
      user_id: reminder.userId,
      prospect_id: reminder.prospectId || null,
      title: reminder.title,
      description: reminder.description || null,
      reminder_date: new Date(reminder.reminderDate).toISOString(),
      status: reminder.status,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const { data, error } = await supabase!
      .from('reminders')
      .insert(reminderData)
      .select()
      .single();

    if (error) {
      console.error("Error saving reminder:", error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      prospectId: data.prospect_id,
      title: data.title,
      description: data.description,
      reminderDate: new Date(data.reminder_date).getTime(),
      status: data.status,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw error;
  }
}

/**
 * Update a reminder
 */
export async function updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
  if (!isSupabaseAvailable()) {
    throw new Error("Supabase not available");
  }

  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.reminderDate !== undefined) updateData.reminder_date = new Date(updates.reminderDate).toISOString();
    if (updates.status !== undefined) updateData.status = updates.status;

    const { error } = await supabase!
      .from('reminders')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating reminder:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }
}

/**
 * Delete a reminder
 */
export async function deleteReminder(id: string): Promise<void> {
  if (!isSupabaseAvailable()) {
    throw new Error("Supabase not available");
  }

  try {
    const { error } = await supabase!
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting reminder:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
}

/**
 * Load templates for a user
 */
export async function loadTemplates(userId: string): Promise<Template[]> {
  if (!isSupabaseAvailable()) {
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading templates:", error);
      return [];
    }

    return (data || []).map((template: any) => ({
      id: template.id,
      userId: template.user_id,
      name: template.name,
      prospectData: template.prospect_data,
      createdAt: new Date(template.created_at).getTime(),
      updatedAt: new Date(template.updated_at).getTime(),
    }));
  } catch (error) {
    console.error("Error loading templates:", error);
    return [];
  }
}

/**
 * Save a template
 */
export async function saveTemplate(template: Omit<Template, 'createdAt' | 'updatedAt'>): Promise<Template> {
  if (!isSupabaseAvailable()) {
    throw new Error("Supabase not available");
  }

  try {
    const now = new Date();
    const templateData = {
      id: template.id,
      user_id: template.userId,
      name: template.name,
      prospect_data: template.prospectData,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const { data, error } = await supabase!
      .from('templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error("Error saving template:", error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      prospectData: data.prospect_data,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
  } catch (error) {
    console.error("Error saving template:", error);
    throw error;
  }
}

/**
 * Update a template
 */
export async function updateTemplate(id: string, updates: Partial<Template>): Promise<void> {
  if (!isSupabaseAvailable()) {
    throw new Error("Supabase not available");
  }

  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.prospectData !== undefined) updateData.prospect_data = updates.prospectData;

    const { error } = await supabase!
      .from('templates')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error updating template:", error);
    throw error;
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<void> {
  if (!isSupabaseAvailable()) {
    throw new Error("Supabase not available");
  }

  try {
    const { error } = await supabase!
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}

/**
 * Get analytics data for a user
 */
export async function getAnalytics(userId: string): Promise<AnalyticsData> {
  if (!isSupabaseAvailable()) {
    return {
      totalProspects: 0,
      totalStrategies: 0,
      activeProspects: 0,
      prospectsByMonth: [],
      strategiesByMonth: [],
      recentActivity: [],
    };
  }

  try {
    // Load all prospects for the user
    const prospects = await loadUserProspects(userId);
    
    const totalProspects = prospects.length;
    const totalStrategies = prospects.filter(p => p.strategy !== null).length;
    const activeProspects = prospects.filter(p => 
      p.status === 'new' || p.status === 'contacted' || p.status === 'follow-up'
    ).length;

    // Group by month
    const prospectsByMonthMap = new Map<string, number>();
    const strategiesByMonthMap = new Map<string, number>();

    prospects.forEach(prospect => {
      const month = new Date(prospect.createdAt).toISOString().slice(0, 7); // YYYY-MM
      prospectsByMonthMap.set(month, (prospectsByMonthMap.get(month) || 0) + 1);
      
      if (prospect.strategyGeneratedAt) {
        const strategyMonth = new Date(prospect.strategyGeneratedAt).toISOString().slice(0, 7);
        strategiesByMonthMap.set(strategyMonth, (strategiesByMonthMap.get(strategyMonth) || 0) + 1);
      }
    });

    const prospectsByMonth = Array.from(prospectsByMonthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const strategiesByMonth = Array.from(strategiesByMonthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const prospectActivities = prospects
      .filter(p => p.createdAt >= thirtyDaysAgo)
      .map(p => ({
        type: 'prospect_created' as const,
        description: `Created prospect: ${p.name} at ${p.company}`,
        timestamp: p.createdAt,
      }));
    
    const strategyActivities = prospects
      .filter(p => p.strategyGeneratedAt && p.strategyGeneratedAt >= thirtyDaysAgo)
      .map(p => ({
        type: 'strategy_generated' as const,
        description: `Generated strategy for ${p.name}`,
        timestamp: p.strategyGeneratedAt!,
      }));
    
    const recentActivity = [...prospectActivities, ...strategyActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return {
      totalProspects,
      totalStrategies,
      activeProspects,
      prospectsByMonth,
      strategiesByMonth,
      recentActivity,
    };
  } catch (error) {
    console.error("Error getting analytics:", error);
    return {
      totalProspects: 0,
      totalStrategies: 0,
      activeProspects: 0,
      prospectsByMonth: [],
      strategiesByMonth: [],
      recentActivity: [],
    };
  }
}

