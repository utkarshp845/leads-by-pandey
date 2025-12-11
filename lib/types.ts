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

