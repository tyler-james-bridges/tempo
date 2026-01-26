import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// List all shows for the authenticated user
export const listUserShows = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("shows")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// List only "ready" shows for the authenticated user
export const listReadyShows = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("shows")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", identity.subject).eq("status", "ready")
      )
      .order("desc")
      .collect();
  },
});

// Get a single show by ID
export const getShow = query({
  args: { showId: v.id("shows") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const show = await ctx.db.get(args.showId);
    if (!show || show.userId !== identity.subject) return null;

    return show;
  },
});

// Get a show with all its parts
export const getShowWithParts = query({
  args: { showId: v.id("shows") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const show = await ctx.db.get(args.showId);
    if (!show || show.userId !== identity.subject) return null;

    const parts = await ctx.db
      .query("parts")
      .withIndex("by_show_and_position", (q) => q.eq("showId", args.showId))
      .collect();

    return { show, parts };
  },
});

// Create a new show (manual entry)
export const createShow = mutation({
  args: {
    name: v.string(),
    sourceType: v.optional(
      v.union(v.literal("manual"), v.literal("import"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("shows", {
      userId: identity.subject,
      name: args.name,
      sourceType: args.sourceType ?? "manual",
      status: "ready",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Create a show with uploaded PDF
export const createShowFromPdf = mutation({
  args: {
    name: v.string(),
    sourceFilename: v.string(),
    pdfStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("shows", {
      userId: identity.subject,
      name: args.name,
      sourceType: "pdf_upload",
      sourceFilename: args.sourceFilename,
      pdfStorageId: args.pdfStorageId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update show metadata
export const updateShow = mutation({
  args: {
    showId: v.id("shows"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const show = await ctx.db.get(args.showId);
    if (!show || show.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.showId, {
      ...(args.name !== undefined && { name: args.name }),
      updatedAt: Date.now(),
    });
  },
});

// Update show status
export const updateShowStatus = mutation({
  args: {
    showId: v.id("shows"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const show = await ctx.db.get(args.showId);
    if (!show || show.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.showId, {
      status: args.status,
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
  },
});

// Delete a show and all its parts
export const deleteShow = mutation({
  args: { showId: v.id("shows") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const show = await ctx.db.get(args.showId);
    if (!show || show.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Delete all parts
    const parts = await ctx.db
      .query("parts")
      .withIndex("by_show_id", (q) => q.eq("showId", args.showId))
      .collect();

    for (const part of parts) {
      await ctx.db.delete(part._id);
    }

    // Delete PDF from storage
    if (show.pdfStorageId) {
      await ctx.storage.delete(show.pdfStorageId);
    }

    // Delete the show
    await ctx.db.delete(args.showId);
  },
});

// Generate upload URL for PDF
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

// Get PDF URL for a show
export const getPdfUrl = query({
  args: { showId: v.id("shows") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const show = await ctx.db.get(args.showId);
    if (!show || show.userId !== identity.subject) return null;
    if (!show.pdfStorageId) return null;

    return await ctx.storage.getUrl(show.pdfStorageId);
  },
});

// Internal: Get show for processing (no auth check)
export const getShowInternal = internalQuery({
  args: { showId: v.id("shows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.showId);
  },
});

// Internal: Get PDF URL for processing
export const getPdfUrlInternal = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Internal: Update show status (for actions)
export const updateShowStatusInternal = internalMutation({
  args: {
    showId: v.id("shows"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.showId, {
      status: args.status,
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
  },
});
