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
  try {
    ensureDataDir();
  } catch (error) {
    console.error("Failed to ensure data directory exists:", error);
    return [];
  }
  
  if (!fs.existsSync(USERS_FILE)) {
    // File doesn't exist yet, return empty array (first run)
    return [];
  }

  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    if (!data || data.trim() === "") {
      // Empty file, return empty array
      return [];
    }
    
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
  try {
    ensureDataDir();
  } catch (error) {
    console.error("Failed to ensure data directory exists:", error);
    throw new Error("Failed to create data directory");
  }
  
  try {
    // Write atomically using a temp file then rename (safer)
    const tempFile = `${USERS_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), "utf-8");
    fs.renameSync(tempFile, USERS_FILE);
  } catch (error) {
    console.error("Error saving users:", error);
    throw error;
  }
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): UserWithPassword | null {
  try {
    ensureDataDir();
  } catch (error) {
    console.error("Failed to ensure data directory exists:", error);
    return null;
  }
  
  const users = loadUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
  
  if (user) {
    console.log(`User found by email: ${user.email} (ID: ${user.id})`);
  } else {
    console.log(`✗ User not found by email: ${normalizedEmail}`);
    console.log(`  Available users: ${users.map(u => u.email).join(", ") || "none"}`);
  }
  
  return user;
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
  try {
    ensureDataDir();
  } catch (error) {
    console.error("Failed to ensure data directory exists:", error);
    throw new Error("Failed to initialize data storage");
  }
  
  const users = loadUsers();
  
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if user already exists
  if (findUserByEmail(normalizedEmail)) {
    throw new Error("User with this email already exists");
  }

  const newUser: UserWithPassword = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
    createdAt: Date.now(),
  };

  users.push(newUser);
  
  try {
    saveUsers(users);
    console.log(`User created successfully: ${newUser.email} (ID: ${newUser.id})`);
    console.log(`   Total users in database: ${users.length}`);
    
    // Verify the user was saved
    const verifyUser = findUserByEmail(normalizedEmail);
    if (!verifyUser) {
      console.error("ERROR: User was not found after creation - save may have failed");
      throw new Error("User creation verification failed");
    }
    console.log(`User verification successful: ${verifyUser.email}`);
  } catch (error) {
    console.error("Failed to save user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to save user. Please try again.");
  }

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

