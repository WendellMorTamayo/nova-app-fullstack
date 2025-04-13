import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  news: defineTable({
    audioStorageId: v.optional(v.id("_storage")),
    user: v.id("users"),
    newsTitle: v.string(),
    newsDescription: v.string(),
    newsType: v.string(),
    audioUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    voicePrompt: v.string(),
    imagePrompt: v.string(),
    voiceType: v.string(),
    audioDuration: v.number(),
    views: v.number(),
    trending_score: v.optional(v.number()),
    last_updated: v.optional(v.number()),
    source: v.optional(v.string()), // Source of the news (e.g., CNN, BBC)
  })
    .searchIndex("search_author", { searchField: "author" })
    .searchIndex("search_body", { searchField: "newsDescription" })
    .searchIndex("search_type", { searchField: "newsType" })
    // Combined search index that includes the title and additional fields
    .searchIndex("search_full", {
      searchField: "newsTitle",
      additionalFields: ["newsDescription", "author", "newsType"]
    })
    .index("by_trending", ["trending_score"])
    .index("by_views", ["views"]),

  users: defineTable({
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    name: v.string(),
    accountType: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    endsOn: v.optional(v.number()),
    credits: v.optional(v.number()),
  })
    .index("by_userId", ["clerkId"])
    .index("by_subscriptionId", ["subscriptionId"]),

  userRecents: defineTable({
    user: v.id("users"),
    news: v.id("news"),
    lastPlayed: v.number(),
  }),

  userLikes: defineTable({
    user: v.id("users"),
    news: v.id("news"),
  }),

  payments: defineTable({
    text: v.string(),
    stripeId: v.optional(v.string()),
    messageId: v.optional(v.id("messages")),
  }).index("stripeId", ["stripeId"]),
  messages: defineTable({
    text: v.string(),
  }),
});
