import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced from Clerk via webhook
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Shows table - musical shows/scores
  shows: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    sourceType: v.union(
      v.literal("pdf_upload"),
      v.literal("manual"),
      v.literal("import")
    ),
    sourceFilename: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_created", ["userId", "createdAt"]),

  // Parts table - sections/movements within a show
  parts: defineTable({
    showId: v.id("shows"),
    name: v.string(),
    tempo: v.number(),
    beats: v.number(),
    measureStart: v.optional(v.number()),
    measureEnd: v.optional(v.number()),
    rehearsalMark: v.optional(v.string()),
    position: v.number(),
    createdAt: v.number(),
  })
    .index("by_show_id", ["showId"])
    .index("by_show_and_position", ["showId", "position"]),
});
