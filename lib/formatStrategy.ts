/**
 * Formats strategy content to be more human-readable
 * Aggressively removes quotes, brackets, and JSON artifacts
 * Makes content clean and professional for sales professionals
 */
export function formatStrategyContent(content: string): string {
  if (!content) return content;
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === 'object' && parsed !== null) {
      // If it's an object, format it nicely
      return formatObject(parsed);
    }
  } catch {
    // Not JSON, continue with text formatting
  }
  
  // Clean up the content aggressively
  let formatted = content.trim();
  
  // Remove JSON-like quotes and escape characters
  formatted = formatted.replace(/\\n/g, '\n');
  formatted = formatted.replace(/\\"/g, '"');
  formatted = formatted.replace(/\\'/g, "'");
  formatted = formatted.replace(/\\t/g, ' ');
  
  // Remove surrounding quotes (single, double, smart quotes)
  formatted = formatted.replace(/^["'""'']+|["'""'']+$/g, '');
  
  // Remove JSON brackets and braces that might be artifacts
  formatted = formatted.replace(/^[\[\{]+|[\]\}]+$/g, '');
  
  // Remove quote marks that wrap entire sentences or paragraphs (more aggressive)
  formatted = formatted.replace(/^["'""'']+([^"'""'']*)["'""'']+$/gm, '$1');
  
  // Remove standalone quote marks at word boundaries (but preserve apostrophes in contractions)
  // This removes quotes that are clearly JSON artifacts, not part of the content
  formatted = formatted.replace(/(^|\s)["'""''](\s|$)/g, '$1$2');
  formatted = formatted.replace(/(^|\s)["'""''](\s|$)/g, '$1$2');
  
  // Remove quotes at start/end of lines (but be careful with apostrophes)
  formatted = formatted.replace(/^[""]+|[""]+$/gm, '');
  formatted = formatted.replace(/^['']+|['']+$/gm, '');
  
  // Remove brackets that are clearly JSON artifacts (not part of content)
  // Only remove if they're at the start/end of lines or whole content
  formatted = formatted.replace(/^\[|\]$/g, '');
  formatted = formatted.replace(/^\{|\}$/g, '');
  
  // Clean up any remaining escape sequences
  formatted = formatted.replace(/\\(.)/g, '$1');
  
  // Format bullet points consistently
  formatted = formatted.replace(/^[-•*]\s*/gm, '• ');
  
  // Format numbered lists
  formatted = formatted.replace(/^\d+\.\s*/gm, (match) => match);
  
  // Remove excessive whitespace but preserve intentional spacing
  formatted = formatted.replace(/[ \t]+/g, ' ');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // Trim each line
  formatted = formatted.split('\n').map(line => line.trim()).join('\n');
  
  // Final trim
  formatted = formatted.trim();
  
  return formatted;
}

/**
 * Formats an object into readable text
 */
function formatObject(obj: any, indent = 0): string {
  if (typeof obj === 'string') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item, idx) => {
      const formatted = typeof item === 'object' 
        ? formatObject(item, indent + 1)
        : String(item);
      return `  ${idx + 1}. ${formatted}`;
    }).join('\n');
  }
  
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj)
      .map(([key, value]) => {
        const formattedValue = typeof value === 'object'
          ? formatObject(value, indent + 1)
          : String(value);
        return `${key}: ${formattedValue}`;
      })
      .join('\n');
  }
  
  return String(obj);
}

