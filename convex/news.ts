import {ConvexError, v} from "convex/values";
import {mutation, query} from "./_generated/server";

export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },

  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const createNews = mutation({
  args: {
    newsTitle: v.string(),
    newsDescription: v.string(),
    audioUrl: v.string(),
    imageUrl: v.string(),
    voiceType: v.string(),
    newsType: v.string(),
    imagePrompt: v.string(),
    voicePrompt: v.string(),
    views: v.number(),
    audioDuration: v.number(),
    audioStorageId: v.optional(v.id("_storage")),
    imageStorageId: v.optional(v.id("_storage")),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const newsType = "";
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("NotAuthenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();

    if (user.length == 0) {
      throw new ConvexError("user not found");
    }

    const currentTime = Date.now();
    
    // Initialize with a default trending score based on recency
    // New content gets a small boost to be discoverable
    const initialTrendingScore = 0.3;
    
    return await ctx.db.insert("news", {
      ...args,
      user: user[0]._id,
      author: user[0].name,
      authorId: user[0].clerkId,
      authorImageUrl: user[0].imageUrl,
      trending_score: initialTrendingScore,
      last_updated: currentTime,
    });
  },
});

export const getTrendingNews = query({
  args: {
    // No args until we regenerate the types
  },
  handler: async (ctx, args) => {
    const limit = 20; // Fixed limit until we regenerate types
    
    // Fetch all news
    const allNews = await ctx.db.query("news").collect();
    
    // Sort by trending_score if available, otherwise fall back to views
    const sortedNews = allNews.sort((a, b) => {
      // Use trending_score if both items have it
      if (a.trending_score !== undefined && b.trending_score !== undefined) {
        return b.trending_score - a.trending_score;
      }
      // Otherwise fall back to views
      return b.views - a.views;
    });
    
    // Return limited results
    return sortedNews.slice(0, limit);
  },
});

export const getAllNews = query({
  handler: async (ctx) => {
    const news = await ctx.db.query("news").collect();
    return news;
  },
});

export const getNewsByAuthorId = query({
  args: {
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const news = await ctx.db
      .query("news")
      .filter((q) => q.eq(q.field("authorId"), args.authorId))
      .collect();

    const totalListeners = news.reduce((sum, news) => sum + news.views, 0);

    return { news, listeners: totalListeners };
  },
});

export const getNewsById = query({
  args: { newsId: v.id("news") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.newsId);
  },
});

export const getNewsByMultipleIds = query({
  args: {
    newsIds: v.array(v.id("news")),
  },
  handler: async (ctx, args) => {
    const { newsIds } = args;
    
    // Handle empty array case
    if (newsIds.length === 0) {
      return [];
    }
    
    // Get all news items in parallel
    const news = await Promise.all(
      newsIds.map(async (id) => {
        return await ctx.db.get(id);
      })
    );
    
    // Filter out any nulls (in case an ID doesn't exist)
    return news.filter(item => item !== null);
  },
});

export const getNewsByVoiceType = query({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.newsId);

    return await ctx.db
      .query("news")
      .filter((q) =>
        q.and(
          q.eq(q.field("voiceType"), news?.voiceType),
          q.neq(q.field("_id"), args.newsId)
        )
      )
      .collect();
  },
});

export const getNewsByNewsType = query({
  args: { newsId: v.id("news") },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.newsId);

    return await ctx.db
      .query("news")
      .filter((q) =>
        q.and(
          q.eq(q.field("newsType"), news?.newsType),
          q.neq(q.field("_id"), args.newsId)
        )
      )
      .collect();
  },
});

export const getNewsBySearch = query({
  args: {
    search: v.optional(v.string()),
    categories: v.optional(v.union(v.string(), v.array(v.string()))),
    // sort and limit params will be added after regenerating types
  },
  handler: async (ctx, args) => {
    // Start with a basic query
    let query = ctx.db.query("news");
    
    // Handle search case
    if (args.search) {
      // Use full-text search on multiple fields
      // Create a more flexible search that will match partial words
      const searchTerm = args.search!.trim();
      const searchResults = await query
        .withSearchIndex("search_full", (q) => 
          q.search("newsTitle", searchTerm)
        )
        .collect();
        
      // If no results found with search index, try alternative approach with broader matching
      if (searchResults.length === 0) {
        // Get all news and filter manually for a more flexible search
        const allNews = await ctx.db.query("news").collect();
        
        return allNews.filter(news => {
          const titleMatch = news.newsTitle.toLowerCase().includes(searchTerm.toLowerCase());
          const descMatch = news.newsDescription.toLowerCase().includes(searchTerm.toLowerCase());
          const typeMatch = news.newsType.toLowerCase().includes(searchTerm.toLowerCase());
          
          return titleMatch || descMatch || typeMatch;
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, 50);
      }
        
      // Apply category filter to search results in memory
      if (args.categories) {
        const categoriesArray = Array.isArray(args.categories)
          ? args.categories
          : [args.categories];
          
        if (categoriesArray.length > 0) {
          return searchResults
            .filter(news => categoriesArray.includes(news.newsType))
            .sort((a, b) => b.views - a.views)
            .slice(0, 50);
        }
      }
      
      // Just return search results sorted by views
      return searchResults
        .sort((a, b) => b.views - a.views)
        .slice(0, 50);
    }
    
    // Handle category-only case
    if (args.categories) {
      const categoriesArray = Array.isArray(args.categories)
        ? args.categories
        : [args.categories];
        
      if (categoriesArray.length > 0) {
        const categoryResults = await query
          .filter((q) => 
            q.or(...categoriesArray.map(category => 
              q.eq(q.field("newsType"), category)
            ))
          )
          .collect();
          
        return categoryResults
          .sort((a, b) => b.views - a.views)
          .slice(0, 50);
      }
    }
    
    // Default case: just return all news sorted by views
    const allNews = await query.collect();
    
    if (allNews.length === 0) {
      return { message: "No results found." };
    }
    
    return allNews
      .sort((a, b) => b.views - a.views)
      .slice(0, 50);
  },
});

export const deleteNews = mutation({
  args: {
    newsId: v.id("news"),
    imageStorageId: v.id("_storage"),
    audioStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.newsId);

    if (!news) {
      throw new ConvexError("News not found");
    }

    await ctx.storage.delete(args.imageStorageId);
    await ctx.storage.delete(args.audioStorageId);
    return await ctx.db.delete(args.newsId);
  },
});

export const updateViews = mutation({
  args: {
    newsId: v.id("news"),
    views: v.number(),
  },
  handler: async (ctx, args) => {
    const { newsId, views } = args;
    const updatedViews = views + 1;
    const currentTime = Date.now();

    // Get the existing news item
    const newsItem = await ctx.db.get(newsId);
    if (!newsItem) {
      throw new ConvexError("News item not found");
    }

    // Calculate trending score based on views and recency
    // Wilson score confidence interval for relevance + time decay
    const daysSinceCreation = (currentTime - newsItem._creationTime) / (1000 * 60 * 60 * 24);
    
    // Base the trending score on:
    // 1. Views (popularity)
    // 2. Recency (time decay)
    // Higher views and more recent = higher trending score
    const viewWeight = 0.7;
    const recencyWeight = 0.3;
    const viewScore = Math.log10(updatedViews + 1); // log scale for views to prevent domination
    const recencyScore = Math.max(0, 1 - (daysSinceCreation / 30)); // 0-1 score, decays over 30 days
    
    const trendingScore = (viewScore * viewWeight) + (recencyScore * recencyWeight);
    
    // Update the news item with new views, trending score and last_updated timestamp
    await ctx.db.patch(newsId, { 
      views: updatedViews,
      trending_score: trendingScore,
      last_updated: currentTime
    });
  },
});

export const addToRecents = mutation({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    const { newsId } = args;

    const identity = await ctx.auth.getUserIdentity();
    // If not authenticated, silently exit without error
    if (!identity || !identity.email) {
      return;
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    // If user doesn't exist, silently exit
    if (!user) {
      return;
    }

    // Check if recent entry already exists
    const existing = await ctx.db
      .query("userRecents")
      .filter((q) => q.eq(q.field("user"), user._id))
      .filter((q) => q.eq(q.field("news"), newsId))
      .first();

    // Update or create recent entry
    if (!existing) {
      await ctx.db.insert("userRecents", {
        user: user._id,
        news: newsId,
        lastPlayed: Date.now(),
      });
    } else {
      await ctx.db.patch(existing._id, { lastPlayed: Date.now() });
    }
  },
});
export const getRecents = query({
  handler: async (ctx) => {
    try {
      // Safely get user identity
      let identity;
      try {
        identity = await ctx.auth.getUserIdentity();
      } catch (e) {
        // If there's any authentication error, return empty array
        return [];
      }
      
      // If user is not authenticated, return empty array
      if (!identity || !identity.email) {
        return [];
      }

      // Find user by email - with extra error handling
      let user = null;
      try {
        user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), identity.email))
          .first();
      } catch (e) {
        // If query fails, return empty array
        return [];
      }

      // If user not found, return empty array
      if (!user) {
        return [];
      }

      // Get recent items for this user with error handling
      let recents = [];
      try {
        recents = await ctx.db
          .query("userRecents")
          .filter((q) => q.eq(q.field("user"), user._id))
          .collect();
      } catch (e) {
        // If query fails, return empty array
        return [];
      }
      
      return recents;
    } catch (error) {
      // Catch any other unexpected errors and return empty array
      console.error("Error in getRecents:", error);
      return [];
    }
  },
});

export const addToLikes = mutation({
  args: { newsId: v.id("news") },
  handler: async (ctx, args) => {
    const { newsId } = args;
    const identity = await ctx.auth.getUserIdentity();
    
    // If not authenticated, silently exit without error
    if (!identity || !identity.email) {
      return;
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    // If user doesn't exist, silently exit
    if (!user) {
      return;
    }

    // Check if like already exists
    const existing = await ctx.db
      .query("userLikes")
      .filter((q) => q.eq(q.field("user"), user._id))
      .filter((q) => q.eq(q.field("news"), newsId))
      .first();
      
    // Only add like if it doesn't already exist
    if (!existing) {
      await ctx.db.insert("userLikes", { user: user._id, news: newsId });
    }
  },
});

export const removeFromLikes = mutation({
  args: { newsId: v.id("userLikes") },
  handler: async (ctx, args) => {
    const { newsId } = args;
    const identity = await ctx.auth.getUserIdentity();
    
    // If not authenticated, silently exit without error
    if (!identity || !identity.email) {
      return;
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    // If user doesn't exist, silently exit
    if (!user) {
      return;
    }

    // Check if the like entry exists and belongs to this user
    const likeEntry = await ctx.db.get(newsId);
    if (likeEntry && likeEntry.user === user._id) {
      await ctx.db.delete(newsId);
    }
  },
});

export const getLikesByNewsId = query({
  args: { newsId: v.optional(v.id("news")) },
  handler: async (ctx, args) => {
    try {
      const { newsId } = args;
      
      // Handle case when newsId is not provided
      if (!newsId) {
        return [];
      }
      
      // Safely get user identity
      let identity;
      try {
        identity = await ctx.auth.getUserIdentity();
      } catch (e) {
        // If there's any authentication error, return empty array
        return [];
      }
      
      // If user is not authenticated, return empty array
      if (!identity || !identity.email) {
        return [];
      }

      // Find user by email - with extra error handling
      let user = null;
      try {
        user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), identity.email))
          .first();
      } catch (e) {
        // If query fails, return empty array
        return [];
      }

      // If user not found, return empty array
      if (!user) {
        return [];
      }

      // Get likes for this user and newsId
      let likes = [];
      try {
        likes = await ctx.db
          .query("userLikes")
          .filter((q) => q.eq(q.field("user"), user._id))
          .filter((q) => q.eq(q.field("news"), newsId))
          .collect();
      } catch (e) {
        // If query fails, return empty array
        return [];
      }
      
      return likes;
    } catch (error) {
      // Catch any other unexpected errors and return empty array
      console.error("Error in getLikesByNewsId:", error);
      return [];
    }
  },
});

export const getLikes = query({
  handler: async (ctx) => {
    try {
      // Safely get user identity
      let identity;
      try {
        identity = await ctx.auth.getUserIdentity();
      } catch (e) {
        // If there's any authentication error, return empty array
        return [];
      }
      
      // If user is not authenticated, return empty array
      if (!identity || !identity.email) {
        return [];
      }

      // Find user by email - with extra error handling
      let user = null;
      try {
        user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), identity.email))
          .first();
      } catch (e) {
        // If query fails, return empty array
        return [];
      }

      // If user not found, return empty array
      if (!user) {
        return [];
      }

      // Get all likes for this user with error handling
      let likes = [];
      try {
        likes = await ctx.db
          .query("userLikes")
          .filter((q) => q.eq(q.field("user"), user._id))
          .collect();
      } catch (e) {
        // If query fails, return empty array
        return [];
      }

      return likes;
    } catch (error) {
      // Catch any other unexpected errors and return empty array
      console.error("Error in getLikes:", error);
      return [];
    }
  },
});
