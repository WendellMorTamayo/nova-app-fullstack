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
      );
  },
});

export const getNewsBySearch = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.search === "") {
      return await ctx.db.query("news").order("desc").collect();
    }

    const authorSearch = await ctx.db
      .query("news")
      .withSearchIndex("search_author", (q) => q.search("author", args.search))
      .take(10);

    if (authorSearch.length > 0) {
      return authorSearch;
    }

    const titleSearch = await ctx.db
      .query("news")
      .withSearchIndex("search_title", (q) =>
        q.search("newsTitle", args.search)
      )
      .take(10);

    if (titleSearch.length > 0) {
      return titleSearch;
    }

    const descriptionSearch = await ctx.db
      .query("news")
      .withSearchIndex("search_body", (q) =>
        q.search("newsDescription", args.search)
      )
      .take(10);

    if (descriptionSearch.length > 0) {
      return descriptionSearch;
    } else if (titleSearch.length > 0) {
      return titleSearch;
    } else {
      return await ctx.db
        .query("news")
        .withSearchIndex("search_body", (q) =>
          q.search("newsDescription", args.search)
        )
        .take(10);
    }
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
      await ctx.db.insert("userRecents", { user: user[0]._id, news: newsId });
    } else {
      await ctx.db.patch(news[0]._id, { _creationTime: Date.now() });
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

export const createPlaylist = mutation({
  args: { playlistName: v.string() },
  handler: async (ctx, args) => {
    const { playlistName } = args;

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

    await ctx.db.insert("userPlaylist", {
      user: user[0]._id,
      playlistName: playlistName,
    });
  },
});

export const getUserPlaylists = query({
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

    const playlists = await ctx.db
      .query("userPlaylist")
      .filter((playlist) => playlist.eq(playlist.field("user"), user[0]._id))
      .collect();

    return playlists;
  },
});

export const getPlaylistContents = query({
  args: { playlistId: v.id("userPlaylist") },
  handler: async (ctx, args) => {
    const { playlistId } = args;

    const news = await ctx.db
      .query("playlistContent")
      .filter((content) => content.eq(content.field("playlist"), playlistId))
      .collect();

    return news;
  },
});
