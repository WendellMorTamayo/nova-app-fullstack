import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Helper to check if user is an admin
export const isUserAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  
  // Get the user from the database to check accountType
  const user = await ctx.db
    .query("users")
    .filter((q: { eq: (arg0: any, arg1: any) => any; field: (arg0: string) => any; }) => q.eq(q.field("email"), identity.email))
    .first();
  
  // Check if user's accountType is admin
  return user?.accountType === 'admin';
};

// Get admin dashboard stats
export const getStats = query({
  handler: async (ctx) => {
    // Ensure user is admin
    const isAdmin = await isUserAdmin(ctx);
    if (!isAdmin) throw new ConvexError("Unauthorized access");

    // Get all users
    const users = await ctx.db.query("users").collect();
    const subscribedUsers = users.filter(u => (u.endsOn ?? 0) > Date.now());
    
    // Get news content metrics
    const allNews = await ctx.db.query("news").collect();
    
    // Get recent registrations
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const newUsersLastMonth = users.filter(u => u._creationTime > thirtyDaysAgo).length;
    
    // Get new content in the last month
    const newNewsLastMonth = allNews.filter(n => n._creationTime > thirtyDaysAgo).length;
    
    // Calculate total views
    const totalViews = allNews.reduce((acc, news) => acc + news.views, 0);
    
    // Calculate average views per news
    const avgViewsPerNews = allNews.length > 0 
      ? (totalViews / allNews.length).toFixed(1)
      : "0";
    
    // Calculate conversion rate
    const conversionRate = users.length > 0
      ? ((subscribedUsers.length / users.length) * 100).toFixed(2)
      : "0.00";
    
    // Estimated MRR calculation (assuming $4/month per premium user)
    const premiumPrice = 4;
    const estimatedMRR = subscribedUsers.length * premiumPrice;
    
    return {
      users: {
        total: users.length,
        newNewsLastMonth,
        premium: subscribedUsers.length,
        conversionRate
      },
      content: {
        totalNews: allNews.length,
        newLastMonth: newNewsLastMonth,
        avgViewsPerNews,
        totalViews
      },
      financial: {
        mrr: estimatedMRR,
        estimatedAnnualRevenue: estimatedMRR * 12
      }
    };
  }
});

// Pagination options validator
const paginationOptsValidator = v.object({
  numItems: v.optional(v.number()),
  cursor: v.optional(v.string())
});

// Get all users with subscription data
export const getUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    filter: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Ensure user is admin
    const isAdmin = await isUserAdmin(ctx);
    if (!isAdmin) throw new ConvexError("Unauthorized access");

    // Start with base query and add pagination
    const userQuery = ctx.db.query("users");
    
    // Use the paginate method with the provided options
    const paginationResult = await userQuery.paginate({
      ...args.paginationOpts,
      cursor: args.paginationOpts?.cursor ?? null,
      numItems: args.paginationOpts?.numItems ?? 10
    });
    const users = paginationResult.page;
    
    // For each user, calculate additional metrics
    const enhancedUsers = await Promise.all(users.map(async user => {
      // Get user's news
      const news = await ctx.db
        .query("news")
        .filter(q => q.eq(q.field("authorId"), user.clerkId))
        .collect();
      
      // Get total views for this user
      const totalViews = news.reduce((sum, item) => sum + item.views, 0);
      
      // Subscription status
      const isSubscribed = (user.endsOn ?? 0) > Date.now();
      
      return {
        ...user,
        news: {
          count: news.length,
          totalViews
        },
        isSubscribed,
        subscriptionStatus: isSubscribed ? "active" : (user.subscriptionId ? "expired" : "free")
      };
    }));
    
    return {
      users: enhancedUsers,
      continueCursor: paginationResult.continueCursor,
      hasMore: !paginationResult.isDone
    };
  }
});

// Get subscription details for a specific user
export const getUserSubscription = query({
  args: { 
    userId: v.string()
  },
  handler: async (ctx, args) => {
    // Ensure user is admin
    const isAdmin = await isUserAdmin(ctx);
    if (!isAdmin) throw new ConvexError("Unauthorized access");
    
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.userId))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    const subscriptionInfo = {
      subscriptionId: user.subscriptionId,
      endsOn: user.endsOn,
      isSubscribed: (user.endsOn ?? 0) > Date.now(),
      daysRemaining: user.endsOn 
        ? Math.ceil((user.endsOn - Date.now()) / (24 * 60 * 60 * 1000))
        : 0
    };
    
    return subscriptionInfo;
  }
});

// Admin action to extend a user's subscription by a number of days
export const extendSubscription = mutation({
  args: {
    userId: v.string(),
    days: v.number()
  },
  handler: async (ctx, args) => {
    // Ensure user is admin
    const isAdmin = await isUserAdmin(ctx);
    if (!isAdmin) throw new ConvexError("Unauthorized access");
    
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.userId))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Calculate new expiration date
    const currentEndsOn = user.endsOn ?? Date.now();
    const extendedDate = currentEndsOn + (args.days * 24 * 60 * 60 * 1000);
    
    // Update the user's subscription
    await ctx.db.patch(user._id, {
      endsOn: extendedDate,
      // If no subscription ID, create a manual one
      subscriptionId: user.subscriptionId ?? `manual_${Date.now()}`
    });
    
    return {
      success: true,
      newExpiryDate: extendedDate
    };
  }
});

// Get recent content with view metrics
export const getRecentContent = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Ensure user is admin
    const isAdmin = await isUserAdmin(ctx);
    if (!isAdmin) throw new ConvexError("Unauthorized access");
    
    const limit = args.limit ?? 10;
    
    // Get recent news ordered by creation time
    const recentNews = await ctx.db
      .query("news")
      .order("desc")
      .take(limit);
    
    // Enhance with author information
    const enhancedNews = await Promise.all(recentNews.map(async news => {
      return {
        ...news,
        createdAt: news._creationTime,
        views: news.views,
        trending_score: news.trending_score ?? 0
      };
    }));
    
    return enhancedNews;
  }
});

// Get user's subscription history 
export const getUserSubscriptionHistory = query({
  args: { 
    userId: v.string()
  },
  handler: async (ctx, args) => {
    // Ensure user is admin
    const isAdmin = await isUserAdmin(ctx);
    if (!isAdmin) throw new ConvexError("Unauthorized access");
    
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.userId))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Get subscription events from the database
    // Note: We'll need to create a subscription_events table in the future
    // For now, we'll generate some mock data based on user's subscription details
    
    let history = [];
    
    // If user has a subscription, add it to history
    if (user.subscriptionId) {
      // For current/last subscription
      const now = Date.now();
      const creationTimePlusDay = user._creationTime + (24 * 60 * 60 * 1000);
      
      // Add first subscription purchase
      history.push({
        type: "stripe",
        date: user._creationTime,
        startDate: user._creationTime,
        endDate: creationTimePlusDay + (30 * 24 * 60 * 60 * 1000), // 30 days after creation
        status: "success",
        transactionId: `tr_${Math.random().toString(36).substring(2, 10)}`,
        amount: 4.00,
        notes: "Initial subscription purchase"
      });
      
      // If they have an endsOn date far in the future, add renewal(s)
      if (user.endsOn && user.endsOn > now) {
        const daysSinceCreation = Math.floor((now - user._creationTime) / (24 * 60 * 60 * 1000));
        
        // Add some renewals if the account is old enough
        if (daysSinceCreation > 60) {
          // One renewal 30 days after signup
          history.push({
            type: "stripe",
            date: creationTimePlusDay + (30 * 24 * 60 * 60 * 1000),
            startDate: creationTimePlusDay + (30 * 24 * 60 * 60 * 1000),
            endDate: creationTimePlusDay + (60 * 24 * 60 * 60 * 1000),
            status: "success",
            transactionId: `tr_${Math.random().toString(36).substring(2, 10)}`,
            amount: 4.00,
            notes: "Automatic renewal"
          });
        }
        
        // If they have an extension, add that too
        if (user.endsOn > (user._creationTime + (60 * 24 * 60 * 60 * 1000))) {
          history.push({
            type: "manual",
            date: now - (7 * 24 * 60 * 60 * 1000), // 7 days ago
            startDate: creationTimePlusDay + (60 * 24 * 60 * 60 * 1000),
            endDate: user.endsOn,
            status: "success",
            notes: "Manual extension by administrator"
          });
        }
      }
    }
    
    // Sort by date, newest first
    return history.sort((a, b) => b.date - a.date);
  }
});

// Update user details (admin only)
export const updateUserDetails = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    accountType: v.string(),
    credits: v.number()
  },
  handler: async (ctx, args) => {
    // Ensure user is admin
    const isAdmin = await isUserAdmin(ctx);
    if (!isAdmin) throw new ConvexError("Unauthorized access");
    
    // Validate account type
    if (!["basic", "premium", "admin"].includes(args.accountType)) {
      throw new ConvexError("Invalid account type");
    }
    
    // Find the user to update
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.userId))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Update the user in the database
    await ctx.db.patch(user._id, {
      name: args.name,
      accountType: args.accountType,
      credits: args.credits
    });
    
    // If the user is being promoted to premium but doesn't have a subscription end date,
    // set one for 30 days from now
    if (args.accountType === "premium" && !user.endsOn) {
      await ctx.db.patch(user._id, {
        endsOn: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        subscriptionId: `manual_${Date.now()}`
      });
    }
    
    return { success: true };
  }
});