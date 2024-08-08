import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    audioStorageId: v.id("_storage"),
    imageStorageId: v.id("_storage"),
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
    const news = await ctx.db.insert("news", {
      ...args,
      user: user[0]._id,
      author: user[0].name,
      authorId: user[0].clerkId,
      authorImageUrl: user[0].imageUrl,
    });
    return news;
  },
});

export const getTrendingNews = query({
  handler: async (ctx) => {
    const news = await ctx.db.query("news").collect();
    return news;
  },
});

export const getNewsById = query({
  args: { newsId: v.id("news") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.newsId);
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
      );
  },
});

export const deleteNews = mutation({
  args: {
    newsId: v.id("news"),
    imageStorageId: v.id("_storage"),
    audioStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.newsId);

    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    await ctx.storage.delete(args.imageStorageId);
    await ctx.storage.delete(args.audioStorageId);
    return await ctx.db.delete(args.newsId);
  },
});
