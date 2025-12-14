/**
 * Input Validation & Sanitization Utilities
 * Centralized validation for security and data integrity
 */

/**
 * Email validation with enhanced regex and length limits
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  // Enhanced email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Password validation with strength requirements
 */
export function validatePassword(password: string): { valid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }

  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: 'Password is too common. Please choose a stronger password' };
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;

  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return { valid: true, strength };
}

/**
 * Sanitize text input to prevent XSS attacks
 */
export function sanitizeText(text: string, maxLength: number = 10000): string {
  if (typeof text !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().slice(0, maxLength);
  
  return sanitized;
}

/**
 * Validate and sanitize URL
 */
export function validateUrl(url: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL is too long' };
  }

  try {
    // Only allow http, https protocols
    const urlObj = new URL(trimmed);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use http or https protocol' };
    }

    return { valid: true, sanitized: urlObj.toString() };
  } catch {
    // If URL parsing fails, try adding https://
    try {
      const urlWithProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      const urlObj = new URL(urlWithProtocol);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Invalid URL format' };
      }
      return { valid: true, sanitized: urlObj.toString() };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }
}

/**
 * Validate name field
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name is too long' };
  }

  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { valid: true };
}

/**
 * Validate prospect data
 */
export function validateProspect(prospect: {
  name?: string;
  title?: string;
  company?: string;
  industry?: string;
  notes?: string;
  knownPainPoints?: string;
  links?: string[];
  priorInteractions?: string;
}): { valid: boolean; error?: string } {
  if (!prospect.name || typeof prospect.name !== 'string' || prospect.name.trim().length < 2) {
    return { valid: false, error: 'Prospect name is required and must be at least 2 characters' };
  }

  if (prospect.name.length > 200) {
    return { valid: false, error: 'Prospect name is too long' };
  }

  if (prospect.company && prospect.company.length > 200) {
    return { valid: false, error: 'Company name is too long' };
  }

  if (prospect.title && prospect.title.length > 200) {
    return { valid: false, error: 'Title is too long' };
  }

  if (prospect.industry && prospect.industry.length > 100) {
    return { valid: false, error: 'Industry is too long' };
  }

  if (prospect.notes && prospect.notes.length > 10000) {
    return { valid: false, error: 'Notes are too long' };
  }

  if (prospect.knownPainPoints && prospect.knownPainPoints.length > 5000) {
    return { valid: false, error: 'Pain points text is too long' };
  }

  if (prospect.priorInteractions && prospect.priorInteractions.length > 5000) {
    return { valid: false, error: 'Prior interactions text is too long' };
  }

  if (prospect.links && Array.isArray(prospect.links)) {
    if (prospect.links.length > 20) {
      return { valid: false, error: 'Too many links (maximum 20)' };
    }
    for (const link of prospect.links) {
      if (typeof link !== 'string' || link.length > 2048) {
        return { valid: false, error: 'Invalid link format' };
      }
    }
  }

  return { valid: true };
}

/**
 * Validate request body size (prevent DoS)
 */
export function validateRequestBodySize(body: any, maxSize: number = 1000000): { valid: boolean; error?: string } {
  try {
    const bodyString = JSON.stringify(body);
    const sizeInBytes = new Blob([bodyString]).size;
    
    if (sizeInBytes > maxSize) {
      return { valid: false, error: 'Request body is too large' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid request body' };
  }
}

/**
 * Type validation helpers
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

