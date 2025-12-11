import fs from "fs";
import path from "path";
import { User, UserWithPassword, SavedProspect } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PROSPECTS_DIR = path.join(DATA_DIR, "prospects");

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PROSPECTS_DIR)) {
      fs.mkdirSync(PROSPECTS_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating data directory:", error);
    throw new Error("Failed to initialize data storage");
  }
}

// Initialize data files (only in Node.js environment)
if (typeof window === "undefined") {
  ensureDataDir();
}

/**
 * Load all users from file
 */
export function loadUsers(): UserWithPassword[] {
  ensureDataDir();
  
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const users = JSON.parse(data);
    
    // Validate structure
    if (!Array.isArray(users)) {
      console.warn("Invalid users data structure, resetting");
      return [];
    }
    
    return users;
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

/**
 * Save users to file
 */
export function saveUsers(users: UserWithPassword[]): void {
  ensureDataDir();
  
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error saving users:", error);
    throw error;
  }
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): UserWithPassword | null {
  const users = loadUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Find user by ID
 */
export function findUserById(id: string): UserWithPassword | null {
  const users = loadUsers();
  return users.find((u) => u.id === id) || null;
}

/**
 * Create a new user
 */
export function createUser(
  email: string,
  name: string,
  passwordHash: string
): UserWithPassword {
  const users = loadUsers();
  
  // Check if user already exists
  if (findUserByEmail(email)) {
    throw new Error("User with this email already exists");
  }

  const newUser: UserWithPassword = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);

  return newUser;
}

/**
 * Load prospects for a user
 */
export function loadUserProspects(userId: string): SavedProspect[] {
  ensureDataDir();
  
  // Sanitize userId to prevent directory traversal
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9\-_]/g, "");
  if (sanitizedUserId !== userId) {
    console.error("Invalid userId format");
    return [];
  }
  
  const prospectsFile = path.join(PROSPECTS_DIR, `${sanitizedUserId}.json`);
  
  if (!fs.existsSync(prospectsFile)) {
    return [];
  }

  try {
    const data = fs.readFileSync(prospectsFile, "utf-8");
    const prospects = JSON.parse(data);
    
    // Validate structure
    if (!Array.isArray(prospects)) {
      console.warn("Invalid prospects data structure, resetting");
      return [];
    }
    
    return prospects;
  } catch (error) {
    console.error("Error loading prospects:", error);
    return [];
  }
}

/**
 * Save prospects for a user
 */
export function saveUserProspects(userId: string, prospects: SavedProspect[]): void {
  ensureDataDir();
  
  // Sanitize userId to prevent directory traversal
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9\-_]/g, "");
  if (sanitizedUserId !== userId) {
    throw new Error("Invalid userId format");
  }
  
  // Validate prospects array
  if (!Array.isArray(prospects)) {
    throw new Error("Prospects must be an array");
  }
  
  const prospectsFile = path.join(PROSPECTS_DIR, `${sanitizedUserId}.json`);
  
  try {
    // Write atomically using a temp file then rename (safer)
    const tempFile = `${prospectsFile}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(prospects, null, 2), "utf-8");
    fs.renameSync(tempFile, prospectsFile);
  } catch (error) {
    console.error("Error saving prospects:", error);
    throw error;
  }
}

