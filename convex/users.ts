import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get the current authenticated user's profile
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Internal: Create or update user from Clerk webhook
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Internal: Delete user from Clerk webhook
export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      // Cascade delete: shows and parts
      const shows = await ctx.db
        .query("shows")
        .withIndex("by_user_id", (q) => q.eq("userId", args.clerkId))
        .collect();

      for (const show of shows) {
        // Delete parts
        const parts = await ctx.db
          .query("parts")
          .withIndex("by_show_id", (q) => q.eq("showId", show._id))
          .collect();

        for (const part of parts) {
          await ctx.db.delete(part._id);
        }

        // Delete storage file if exists
        if (show.pdfStorageId) {
          await ctx.storage.delete(show.pdfStorageId);
        }

        await ctx.db.delete(show._id);
      }

      await ctx.db.delete(user._id);
    }
  },
});
