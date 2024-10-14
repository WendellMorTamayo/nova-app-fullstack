import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { useMutation } from "convex/react";

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
    const news = await Promise.all(
      newsIds.map(async (id) => {
        return await ctx.db.get(id);
      })
    );
    return news;
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
  },
  handler: async (ctx, args) => {
    let newsQuery = ctx.db.query("news");

    let titleSearch;
    if (args.search) {
      titleSearch = newsQuery.withSearchIndex("search_title", (q) =>
        q.search("newsTitle", args.search!)
      );
    }

    let categorySearch;
    if (args.categories) {
      const categoriesArray = Array.isArray(args.categories)
        ? args.categories
        : [args.categories];

      if (categoriesArray.length > 0) {
        categorySearch = titleSearch
          ? titleSearch.filter((q) =>
              q.or(
                ...categoriesArray.map((category) =>
                  q.eq(q.field("newsType"), category)
                )
              )
            )
          : newsQuery.filter((q) =>
              q.or(
                ...categoriesArray.map((category) =>
                  q.eq(q.field("newsType"), category)
                )
              )
            ).order("desc");
      }
    }

    const results = categorySearch ? await categorySearch.collect() : await newsQuery.collect();
    const sortedResults = results.sort(
      (a, b) => b._creationTime - a._creationTime
    );

    return sortedResults;
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
    await ctx.db.patch(newsId, { views: updatedViews });
  },
});

export const addToRecents = mutation({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    const { newsId } = args;

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

    const news = await ctx.db
      .query("userRecents")
      .filter((q) => q.eq(q.field("user"), user[0]._id))
      .filter((q) => q.eq(q.field("news"), newsId))
      .collect();

    if (news.length == 0) {
      await ctx.db.insert("userRecents", {
        user: user[0]._id,
        news: newsId,
        lastPlayed: Date.now(),
      });
    } else {
      await ctx.db.patch(news[0]._id, { lastPlayed: Date.now() });
    }
  },
});
export const getRecents = query({
  handler: async (ctx) => {
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

    return await ctx.db
      .query("userRecents")
      .filter((q) => q.eq(q.field("user"), user[0]._id))
      .collect();
  },
});

export const addToLikes = mutation({
  args: { newsId: v.id("news") },
  handler: async (ctx, args) => {
    const { newsId } = args;
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

    await ctx.db.insert("userLikes", { user: user[0]._id, news: newsId });
  },
});

export const removeFromLikes = mutation({
  args: { newsId: v.id("userLikes") },
  handler: async (ctx, args) => {
    const { newsId } = args;
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

    await ctx.db.delete(newsId);
  },
});

export const getLikesByNewsId = query({
  args: { newsId: v.optional(v.id("news")) },
  handler: async (ctx, args) => {
    const { newsId } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("NotAuthenticated");
    }

    console.log("Identity:", identity);
    console.log("Identity email:", identity.email);

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();

    if (user.length == 0) {
      throw new ConvexError("user not found");
    }

    const news = await ctx.db
      .query("userLikes")
      .filter((likes) => likes.eq(likes.field("user"), user[0]._id))
      .filter((likes) => likes.eq(likes.field("news"), newsId))
      .collect();
    console.log("sadasdasdsa");
    console.log(news);
    return news;
  },
});

export const getLikes = query({
  handler: async (ctx) => {
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

    const likes = await ctx.db
      .query("userLikes")
      .filter((likes) => likes.eq(likes.field("user"), user[0]._id))
      .collect();

    return likes;
  },
});
