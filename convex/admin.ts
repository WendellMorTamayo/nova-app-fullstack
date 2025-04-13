import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Helper to check if user is an admin
export const isUserAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  
  // Get the user from the database to check accountType
  const user = await ctx.db
    .query("users")
    .filter(q => q.eq(q.field("email"), identity.email))
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