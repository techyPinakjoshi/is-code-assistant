import { User, Plan, PlanId } from '../types';

// This is a mock authentication service.
// In a real application, this would make API calls to a backend.
export const login = async (email: string, password?: string): Promise<User> => {
  console.log(`Authenticating user: ${email}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real app, you'd check if the user exists and validate credentials.
  // Here, we'll create a new user profile for any email provided to simulate both login and signup.
  if (email) {
    const name = email.split('@')[0];
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/[^a-zA-Z0-9]/g, ' ');

    return {
      name: capitalizedName, // e.g., 'Pinak' from 'pinak@example.com'
      email: email,
      planId: 'free',
      planName: 'Free',
      planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 30 days from now
      usage: {
        queriesToday: 0, // Start with 0 queries for a new user
        maxQueries: 10,
      }
    };
  }

  throw new Error('Invalid credentials');
};

export const updateUserPlan = (user: User, newPlan: Plan): User => {
  // In a real app, this would be an API call.
  // Here we just update the user object locally.
  console.log(`Upgrading user ${user.email} to ${newPlan.name}`);
  return {
    ...user,
    planId: newPlan.id,
    planName: newPlan.name,
    planExpiry: undefined, // Or set a new expiry date, e.g., one year from now
    usage: {
      ...user.usage,
      maxQueries: Infinity, // Paid plans have unlimited queries
    },
  };
};