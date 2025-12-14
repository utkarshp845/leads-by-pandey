/**
 * Prospect model - represents a sales prospect
 */
export interface Prospect {
  name: string;
  title: string;
  company: string;
  industry: string;
  notes: string;
  knownPainPoints: string;
  links: string[];
  priorInteractions: string;
}

/**
 * Prospect with unique identifier and creation timestamp
 */
export interface ProspectWithId extends Prospect {
  id: string;
  createdAt: number;
}

/**
 * Saved prospect with optional strategy
 */
export interface SavedProspect extends ProspectWithId {
  strategy: StrategyResponse | null;
  strategyGeneratedAt: number | null;
  followUpDate?: number | null;
  status?: 'new' | 'contacted' | 'follow-up' | 'closed';
}

/**
 * Strategy response from Mr. Pandey - 5-piece lead generation strategy
 */
export interface StrategyResponse {
  prospectSummary: string;
  painPointHypothesis: string;
  positioningStrategy: string;
  toneSuggestions: string;
  firstMessageStructure: string;
}

/**
 * OpenRouter API response structure
 */
export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter API error response
 */
export interface OpenRouterError {
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}

/**
 * User model for authentication
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

/**
 * User with password hash (server-side only)
 */
export interface UserWithPassword extends User {
  passwordHash: string;
}

/**
 * Auth response
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  emailEnabled: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  strategyUpdates: boolean;
  reminderNotifications: boolean;
  weeklySummary: boolean;
}

/**
 * AI preferences
 */
export interface AIPreferences {
  model: string;
  strategyTone?: 'professional' | 'casual' | 'friendly' | 'formal';
  strategyLength?: 'brief' | 'standard' | 'detailed';
  customInstructions?: string;
}

/**
 * User settings
 */
export interface UserSettings {
  userId: string;
  notificationPreferences: NotificationPreferences;
  aiPreferences: AIPreferences;
  exportDefaultFormat: 'json' | 'csv' | 'pdf';
  createdAt: number;
  updatedAt: number;
}

/**
 * Reminder model
 */
export interface Reminder {
  id: string;
  userId: string;
  prospectId?: string | null;
  title: string;
  description?: string;
  reminderDate: number; // timestamp
  status: 'pending' | 'completed' | 'dismissed';
  createdAt: number;
  updatedAt: number;
}

/**
 * Template model
 */
export interface Template {
  id: string;
  userId: string;
  name: string;
  prospectData: Prospect;
  createdAt: number;
  updatedAt: number;
}

/**
 * Analytics data
 */
export interface AnalyticsData {
  totalProspects: number;
  totalStrategies: number;
  activeProspects: number;
  prospectsByMonth: Array<{ month: string; count: number }>;
  strategiesByMonth: Array<{ month: string; count: number }>;
  recentActivity: Array<{
    type: 'prospect_created' | 'strategy_generated' | 'prospect_updated';
    description: string;
    timestamp: number;
  }>;
}

