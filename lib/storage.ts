import { SavedProspect, Prospect } from "./types";

const STORAGE_KEY = "pandey-prospects";

/**
 * Load all prospects from localStorage
 * @returns Array of saved prospects, or empty array if none exist
 */
export function loadProspects(): SavedProspect[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const prospects = JSON.parse(stored) as SavedProspect[];
    // Validate that we got an array
    if (!Array.isArray(prospects)) {
      console.warn("Invalid data in localStorage, resetting");
      return [];
    }

    return prospects;
  } catch (error) {
    console.error("Error loading prospects from localStorage:", error);
    return [];
  }
}

/**
 * Save prospects to localStorage
 * @param prospects Array of prospects to save
 */
export function saveProspects(prospects: SavedProspect[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded. Cannot save prospects.");
      alert("Storage limit reached. Please delete some prospects to free up space.");
    } else {
      console.error("Error saving prospects to localStorage:", error);
    }
  }
}

/**
 * Generate a unique prospect ID
 * @returns Unique string ID (timestamp + random)
 */
export function generateProspectId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Find a prospect by ID
 * @param id Prospect ID to find
 * @returns Prospect if found, null otherwise
 */
export function getProspectById(id: string): SavedProspect | null {
  const prospects = loadProspects();
  return prospects.find((p) => p.id === id) || null;
}

/**
 * Create a new saved prospect from prospect data
 * @param prospect Prospect data (without ID)
 * @returns SavedProspect with generated ID and timestamps
 */
export function createSavedProspect(prospect: Prospect): SavedProspect {
  return {
    ...prospect,
    id: generateProspectId(),
    createdAt: Date.now(),
    strategy: null,
    strategyGeneratedAt: null,
  };
}

