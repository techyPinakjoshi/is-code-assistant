
import { supabase } from '../lib/supabaseClient';
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
            queriesToday: 0, 
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

export const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                access_type: 'offline',
                prompt: 'select_account',
            },
        },
    });

    if (error) throw new Error(error.message);
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
};

export const updateUserPlan = async (user: User, newPlan: { id: PlanId, name: string }): Promise<User> => {
    const { data, error } = await supabase.auth.updateUser({
        data: {
            plan_id: newPlan.id,
            plan_name: newPlan.name
        }
    });

    if (error) {
        console.error("Failed to update plan", error);
        return user;
    }

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
    return []; 
};

export const getCurrentSession = async (): Promise<User | null> => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
        return mapSupabaseUser(data.session.user);
    }
    return null;
};
