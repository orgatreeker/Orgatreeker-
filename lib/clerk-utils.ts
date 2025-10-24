import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Get the current user's Clerk ID from server components
 * Use this in Server Components and API routes
 */
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the full current user object from server components
 * Use this when you need more than just the user ID
 */
export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

/**
 * Check if user is authenticated in server components
 */
export async function isAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}
