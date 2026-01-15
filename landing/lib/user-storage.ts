import fs from 'fs';
import path from 'path';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  createdAt: string; // ISO string
  organization?: string;
}

const STORAGE_DIR = path.join(process.cwd(), '.fost-data');
const USERS_FILE = path.join(STORAGE_DIR, 'users.json');

// Initialize storage directory
function ensureStorageDir() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create storage directory:', error);
  }
}

// Load all users from disk
export function loadUsers(): Map<string, StoredUser> {
  const users = new Map<string, StoredUser>();
  
  try {
    ensureStorageDir();
    
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const usersList: StoredUser[] = JSON.parse(data);
      usersList.forEach(user => {
        users.set(user.id, user);
      });
    }
  } catch (error) {
    console.error('Failed to load users:', error);
  }
  
  return users;
}

// Save all users to disk
export function saveUsers(users: Map<string, StoredUser>): void {
  try {
    ensureStorageDir();
    const usersList = Array.from(users.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersList, null, 2));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
}

// Add a single user and persist
export function addUser(user: StoredUser): void {
  const users = loadUsers();
  users.set(user.id, user);
  saveUsers(users);
}

// Update a single user and persist
export function updateUserData(userId: string, updates: Partial<StoredUser>): void {
  const users = loadUsers();
  const user = users.get(userId);
  
  if (user) {
    const updated = { ...user, ...updates };
    users.set(userId, updated);
    saveUsers(users);
  }
}

// Get user by ID
export function getUserById(userId: string): StoredUser | undefined {
  const users = loadUsers();
  return users.get(userId);
}

// Get user by email
export function getUserByEmail(email: string): StoredUser | undefined {
  const users = loadUsers();
  
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  
  return undefined;
}

// Check if user exists by email
export function userExists(email: string): boolean {
  return getUserByEmail(email) !== undefined;
}
