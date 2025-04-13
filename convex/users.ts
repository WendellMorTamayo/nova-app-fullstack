import { ConvexError, v } from "convex/values";

import { internalMutation, mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUserId } from "./util";

const FREE_CREDITS = 5;

export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Make this function safe - it will never throw an error
    // If the user isn't found, it will simply return null
    try {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
        .first(); // Use first() instead of unique() to avoid errors

        // Return null instead of throwing an error when user is not found
      if (!user) {
        return null;
      }

      return user; // Return the user object directly, or null if not found
    } catch (error) {
      console.error("Error in getUserById:", error);
      return null; // Return null on error
    }
  },
});

// this query is used to get the top user by podcast count. first the podcast is sorted by views and then the user is sorted by total podcasts, so the user with the most podcasts will be at the top.
export const getTopUserByNewsCount = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").collect();

    const userData = await Promise.all(
      user.map(async (u) => {
        const news = await ctx.db
          .query("news")
          .filter((q) => q.eq(q.field("authorId"), u.clerkId))
          .collect();

        const sortedNews = news.sort((a, b) => b.views - a.views);

        return {
          ...u,
          totalNews: news.length,
          news: sortedNews.map((p) => ({
            newsTitle: p.newsTitle,
            newsId: p._id,
          })),
        };
      })
    );

    return userData.sort((a, b) => b.totalNews - a.totalNews);
  },
});

export const isUserSubscribed = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getUserId(ctx);

  if (!userId) {
    return false;
  }

  const userToCheck = await getFullUser(ctx, userId);

  return (userToCheck?.endsOn ?? 0) > Date.now();
};

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log(`Starting user creation for: ${args.email} (${args.clerkId})`);
      
      // Check if the user already exists
      const existingUser = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("clerkId"), args.clerkId))
        .first();
        
      if (existingUser) {
        console.log(`User already exists with clerkId ${args.clerkId}, skipping creation`);
        return { success: false, error: "User already exists" };
      }
      
      // Check if this is the first user (to make them admin)
      const existingUsers = await ctx.db.query("users").take(1);
      const isFirstUser = existingUsers.length === 0;
      
      console.log(`Creating user in database with account type: ${isFirstUser ? "admin" : "basic"}`);
      
      // Create user with admin privileges if they're the first user in the system
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        imageUrl: args.imageUrl,
        name: args.name,
        accountType: isFirstUser ? "admin" : "basic",
        credits: FREE_CREDITS,
      });
      
      // Log if first admin created
      if (isFirstUser) {
        console.log(`First user created with admin privileges: ${args.email}`);
      }
      
      console.log(`Successfully created user with ID: ${userId}`);
      return { success: true, userId };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Manual user creation for debugging - allows direct creation from frontend
export const manualCreateUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Get the authenticated user from Clerk
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Not authenticated");
      }
      
      // Check if the user already exists
      const existingUser = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("clerkId"), identity.subject))
        .first();
        
      if (existingUser) {
        console.log(`User already exists with clerkId ${identity.subject}`);
        return { success: false, message: "User already exists in database" };
      }
      
      // Check if this is the first user (to make them admin)
      const existingUsers = await ctx.db.query("users").take(1);
      const isFirstUser = existingUsers.length === 0;
      
      const name = args.name || identity.name || identity.email?.split('@')[0] || "User";
      const imageUrl = identity.pictureUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
      
      console.log(`Manually creating user: ${name} (${identity.email})`);
      
      // Create user record
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email || args.email,
        imageUrl: imageUrl,
        name: name,
        accountType: isFirstUser ? "admin" : "basic",
        credits: FREE_CREDITS,
      });
      
      console.log(`Successfully created user with ID: ${userId}`);
      
      return { 
        success: true, 
        message: "User created successfully",
        userId,
        isAdmin: isFirstUser 
      };
    } catch (error) {
      console.error("Error in manual user creation:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : String(error)
      };
    }
  },
});

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      imageUrl: args.imageUrl,
      email: args.email,
    });

    const news = await ctx.db
      .query("news")
      .filter((q) => q.eq(q.field("authorId"), args.clerkId))
      .collect();

    await Promise.all(
      news.map(async (p) => {
        await ctx.db.patch(p._id, {
          authorImageUrl: args.imageUrl,
        });
      })
    );
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.delete(user._id);
  },
});

export const updateAccountType = mutation({
  args: { accountType: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("NotAuthenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Validate account type
    if (!["basic", "premium", "admin"].includes(args.accountType)) {
      throw new ConvexError("Invalid account type. Must be basic, premium, or admin");
    }

    // Update the account type
    await ctx.db.patch(user._id, {
      accountType: args.accountType
    });

    return { success: true };
  },
});

// Admin mutation to update any user's account type (requires admin privileges)
export const promoteUserToAdmin = mutation({
  args: { 
    userId: v.string(),
    accountType: v.string() 
  },
  handler: async (ctx, args) => {
    // Check if the current user is an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("NotAuthenticated");
    }
    
    // Get the current user to check if they're an admin
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
      
    if (!currentUser || currentUser.accountType !== "admin") {
      throw new ConvexError("Unauthorized: Only admins can promote users");
    }
    
    // Get the target user
    const targetUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.userId))
      .first();
      
    if (!targetUser) {
      throw new ConvexError("Target user not found");
    }
    
    // Validate account type
    if (!["basic", "premium", "admin"].includes(args.accountType)) {
      throw new ConvexError("Invalid account type. Must be basic, premium, or admin");
    }
    
    // Update the account type
    await ctx.db.patch(targetUser._id, {
      accountType: args.accountType
    });
    
    return { 
      success: true,
      message: `User ${targetUser.name} has been updated to ${args.accountType}`
    };
  },
});

export const updateSubscription = internalMutation({
  args: { subscriptionId: v.string(), userId: v.string(), endsOn: v.number() },
  handler: async (ctx, args) => {
    const user = await getFullUser(ctx, args.userId);

    if (!user) {
      throw new Error("no user found with that user id");
    }

    // Update the user with subscription details AND set accountType to premium
    await ctx.db.patch(user._id, {
      subscriptionId: args.subscriptionId,
      endsOn: args.endsOn,
      accountType: "premium", // Set the account type to premium when subscribing
    });
    
    console.log(`User ${user.name} (${args.userId}) subscription updated: ${args.subscriptionId}, expires: ${new Date(args.endsOn).toISOString()}`);
  },
});

export const updateSubscriptionBySubId = internalMutation({
  args: { subscriptionId: v.string(), endsOn: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_subscriptionId", (q) =>
        q.eq("subscriptionId", args.subscriptionId)
      )
      .first();

    if (!user) {
      throw new Error("no user found with that subscription id");
    }

    // Update the subscription end date and ensure accountType is premium
    await ctx.db.patch(user._id, {
      endsOn: args.endsOn,
      accountType: "premium", // Ensure account type is set to premium on renewal
    });
    
    console.log(`User ${user.name} subscription renewed: ${args.subscriptionId}, new expiry: ${new Date(args.endsOn).toISOString()}`);
  },
});

export function getFullUser(ctx: QueryCtx | MutationCtx, userId: string) {
  return ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("clerkId", userId))
    .first();
}

export const getUser = query({
  args: {},
  handler: async (ctx, args) => {
    try {
      const userId = await getUserId(ctx);

      if (!userId) {
        return null;
      }

      return getFullUser(ctx, userId);
    } catch (error) {
      console.error("Error in getUser:", error);
      return null; // Return null if any error occurs
    }
  },
});
