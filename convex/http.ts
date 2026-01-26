import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// Clerk webhook handler - syncs user data from Clerk to Convex
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Verify webhook signature
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await request.text();
    const wh = new Webhook(webhookSecret);

    let evt: {
      type: string;
      data: {
        id: string;
        email_addresses?: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
        image_url?: string;
      };
    };

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as typeof evt;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle different event types
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses?.[0]?.email_address;

      if (!email) {
        return new Response("No email found", { status: 400 });
      }

      const name = [first_name, last_name].filter(Boolean).join(" ") || undefined;

      await ctx.runMutation(internal.users.upsertFromClerk, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url,
      });
    }

    if (eventType === "user.deleted") {
      await ctx.runMutation(internal.users.deleteFromClerk, {
        clerkId: evt.data.id,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
