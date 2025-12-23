
import { supabase } from '../src/lib/supabaseClient';
import { User, PlanId } from '../types';

// Map Supabase User to App User Type
const mapSupabaseUser = (sbUser: any): User => {
    const meta = sbUser.user_metadata || {};
    return {
        name: meta.full_name || sbUser.email?.split('@')[0] || 'User',
        email: sbUser.email || '',
        planId: meta.plan_id || 'free',
        planName: meta.plan_name || 'Free Tier',
        planExpiry: meta.plan_expiry,
        joinedAt: new Date(sbUser.created_at).toLocaleDateString(),
        usage: {
            queriesToday: 0, // In a real app, fetch from DB
            maxQueries: meta.plan_id === 'free' ? 10 : Infinity,
        }
    };
};

export const login = async (email: string, password?: string): Promise<User> => {
  if (!email || !password) throw new Error("Email and password required.");
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Login failed.");

  return mapSupabaseUser(data.user);
};

export const signup = async (name: string, email: string, password?: string): Promise<User> => {
  if (!email || !password) throw new Error("Email and password required.");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            full_name: name,
            plan_id: 'free',
            plan_name: 'Free Tier'
        }
    }
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Signup failed. Please check your email for verification.");

  return mapSupabaseUser(data.user);
};

export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('is_code_user');
};

export const updateUserPlan = async (user: User, newPlan: { id: PlanId, name: string }): Promise<User> => {
    // 1. Update Supabase User Metadata
    const { data, error } = await supabase.auth.updateUser({
        data: {
            plan_id: newPlan.id,
            plan_name: newPlan.name
        }
    });

    if (error) {
        console.error("Failed to update plan", error);
        return user; // Fallback
    }

    // 2. Return updated local user object
    const updatedUser = {
        ...user,
        planId: newPlan.id,
        planName: newPlan.name,
        usage: {
            ...user.usage,
            maxQueries: Infinity
        }
    };
    return updatedUser;
};

export const getAllUsers = async (): Promise<User[]> => {
    // This requires Admin privileges in Supabase or a public profiles table.
    // For now, we'll return an empty array or fetch from a 'profiles' table if you create one.
    // In strict Row Level Security (RLS), regular users cannot see other users.
    return []; 
};

// Check for existing session on load
export const getCurrentSession = async (): Promise<User | null> => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
        return mapSupabaseUser(data.session.user);
    }
    return null;
};
