import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// List all parts for a show
export const listPartsForShow = query({
  args: { showId: v.id("shows") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Verify show ownership
    const show = await ctx.db.get(args.showId);
    if (!show || show.userId !== identity.subject) return [];

    return await ctx.db
      .query("parts")
      .withIndex("by_show_and_position", (q) => q.eq("showId", args.showId))
      .collect();
  },
});

// Get a single part
export const getPart = query({
  args: { partId: v.id("parts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const part = await ctx.db.get(args.partId);
    if (!part) return null;

    // Verify ownership via show
    const show = await ctx.db.get(part.showId);
    if (!show || show.userId !== identity.subject) return null;

    return part;
  },
});

// Create a new part
export const createPart = mutation({
  args: {
    showId: v.id("shows"),
    name: v.string(),
    tempo: v.number(),
    beats: v.number(),
    measureStart: v.optional(v.number()),
    measureEnd: v.optional(v.number()),
    rehearsalMark: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify show ownership
    const show = await ctx.db.get(args.showId);
    if (!show || show.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Get max position for this show
    const existingParts = await ctx.db
      .query("parts")
      .withIndex("by_show_and_position", (q) => q.eq("showId", args.showId))
      .order("desc")
      .first();

    const position = (existingParts?.position ?? -1) + 1;

    const partId = await ctx.db.insert("parts", {
      showId: args.showId,
      name: args.name,
      tempo: args.tempo,
      beats: args.beats,
      measureStart: args.measureStart,
      measureEnd: args.measureEnd,
      rehearsalMark: args.rehearsalMark,
      position,
      createdAt: Date.now(),
    });

    // Update show's updatedAt
    await ctx.db.patch(args.showId, { updatedAt: Date.now() });

    return partId;
  },
});

// Update a part
export const updatePart = mutation({
  args: {
    partId: v.id("parts"),
    name: v.optional(v.string()),
    tempo: v.optional(v.number()),
    beats: v.optional(v.number()),
    measureStart: v.optional(v.number()),
    measureEnd: v.optional(v.number()),
    rehearsalMark: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const part = await ctx.db.get(args.partId);
    if (!part) throw new Error("Part not found");

    // Verify ownership via show
    const show = await ctx.db.get(part.showId);
    if (!show || show.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.partId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.tempo !== undefined && { tempo: args.tempo }),
      ...(args.beats !== undefined && { beats: args.beats }),
      ...(args.measureStart !== undefined && { measureStart: args.measureStart }),
      ...(args.measureEnd !== undefined && { measureEnd: args.measureEnd }),
      ...(args.rehearsalMark !== undefined && { rehearsalMark: args.rehearsalMark }),
    });

    // Update show's updatedAt
    await ctx.db.patch(part.showId, { updatedAt: Date.now() });
  },
});

// Delete a part
export const deletePart = mutation({
  args: { partId: v.id("parts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const part = await ctx.db.get(args.partId);
    if (!part) throw new Error("Part not found");

    // Verify ownership via show
    const show = await ctx.db.get(part.showId);
    if (!show || show.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.partId);

    // Update show's updatedAt
    await ctx.db.patch(part.showId, { updatedAt: Date.now() });
  },
});

// Reorder parts within a show
export const reorderParts = mutation({
  args: {
    showId: v.id("shows"),
    partIds: v.array(v.id("parts")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify show ownership
    const show = await ctx.db.get(args.showId);
    if (!show || show.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Update positions for each part
    for (let i = 0; i < args.partIds.length; i++) {
      const part = await ctx.db.get(args.partIds[i]);
      if (part && part.showId === args.showId) {
        await ctx.db.patch(args.partIds[i], { position: i });
      }
    }

    // Update show's updatedAt
    await ctx.db.patch(args.showId, { updatedAt: Date.now() });
  },
});

// Internal: Create parts from PDF extraction
export const createPartsFromExtraction = internalMutation({
  args: {
    showId: v.id("shows"),
    parts: v.array(
      v.object({
        name: v.string(),
        tempo: v.number(),
        beats: v.number(),
        measureStart: v.optional(v.number()),
        measureEnd: v.optional(v.number()),
        rehearsalMark: v.optional(v.string()),
        position: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const part of args.parts) {
      await ctx.db.insert("parts", {
        showId: args.showId,
        name: part.name,
        tempo: part.tempo,
        beats: part.beats,
        measureStart: part.measureStart,
        measureEnd: part.measureEnd,
        rehearsalMark: part.rehearsalMark,
        position: part.position,
        createdAt: now,
      });
    }

    // Update show's updatedAt
    await ctx.db.patch(args.showId, { updatedAt: now });
  },
});

// Internal: Delete all parts for a show
export const deleteAllPartsForShow = internalMutation({
  args: { showId: v.id("shows") },
  handler: async (ctx, args) => {
    const parts = await ctx.db
      .query("parts")
      .withIndex("by_show_id", (q) => q.eq("showId", args.showId))
      .collect();

    for (const part of parts) {
      await ctx.db.delete(part._id);
    }
  },
});
