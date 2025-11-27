
import { User, PlanId } from '../types';

const USERS_DB_KEY = 'is_code_users_db';
const CURRENT_USER_KEY = 'is_code_user';

interface UserRecord {
  email: string;
  passwordHash: string;
  userProfile: User;
}

interface UserDatabase {
  [email: string]: UserRecord;
}

// Helper: Hash password using Web Crypto API (SHA-256)
const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Helper: Get DB
const getDatabase = (): UserDatabase => {
  const dbStr = localStorage.getItem(USERS_DB_KEY);
  return dbStr ? JSON.parse(dbStr) : {};
};

// Helper: Save DB
const saveDatabase = (db: UserDatabase) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
};

export const login = async (email: string, password?: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  if (!email || !password) {
    throw new Error('Please provide both email and password.');
  }

  const db = getDatabase();
  const record = db[email.toLowerCase()];

  if (!record) {
    throw new Error('User not found. Please sign up first.');
  }

  const inputHash = await hashPassword(password);
  
  // Secure comparison
  if (record.passwordHash !== inputHash) {
    throw new Error('Incorrect password.');
  }

  // Update last login or refresh token logic could go here
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(record.userProfile));
  return record.userProfile;
};

export const signup = async (name: string, email: string, password?: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!email || !password || !name) {
    throw new Error('All fields are required.');
  }

  const normalizedEmail = email.toLowerCase();
  const db = getDatabase();

  if (db[normalizedEmail]) {
    throw new Error('User already exists. Please log in.');
  }

  const passwordHash = await hashPassword(password);

  const newUser: User = {
    name: name,
    email: normalizedEmail,
    planId: 'free',
    planName: 'Free Tier',
    planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 30 day trial
    joinedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    usage: {
      queriesToday: 0,
      maxQueries: 10,
    }
  };

  // Save to DB
  db[normalizedEmail] = {
    email: normalizedEmail,
    passwordHash,
    userProfile: newUser
  };
  saveDatabase(db);

  // Set as current user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const updateUserPlan = (user: User, newPlan: { id: PlanId, name: string }): User => {
  const updatedUser = {
    ...user,
    planId: newPlan.id,
    planName: newPlan.name,
    planExpiry: undefined,
    usage: {
      ...user.usage,
      maxQueries: Infinity,
    },
  };

  // Update in DB as well to persist plan change
  const db = getDatabase();
  if (db[user.email]) {
    db[user.email].userProfile = updatedUser;
    saveDatabase(db);
  }
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

/**
 * Retrieves all registered users from the simulated database.
 * Used for the Admin Insights dashboard.
 */
export const getAllUsers = (): User[] => {
    const db = getDatabase();
    return Object.values(db).map(record => record.userProfile).reverse(); // Newest first
};
