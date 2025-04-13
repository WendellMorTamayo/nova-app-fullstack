import type { WebhookEvent } from "@clerk/nextjs/server";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const handleClerkWebhook = httpAction(async (ctx, request) => {
  try {
    const event = await validateRequest(request);
    if (!event) {
      console.error("Invalid Clerk webhook request");
      return new Response("Invalid request", { status: 400 });
    }

    console.log(`Processing Clerk webhook event: ${event.type}`);

    switch (event.type) {
      case "user.created":
        try {
          if (!event.data.email_addresses || event.data.email_addresses.length === 0) {
            console.error("No email address found in Clerk webhook user.created event");
            return new Response("Missing email address", { status: 400 });
          }

          // Get the primary or first email
          const emailObj = event.data.email_addresses.find(email => email.id === event.data.primary_email_address_id) ||
            event.data.email_addresses[0];

          // Get a proper name (firstName + lastName or default to email username)
          const firstName = event.data.first_name || '';
          const lastName = event.data.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || emailObj.email_address.split('@')[0];

          // Set a default image if none is provided
          const imageUrl = event.data.image_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

          console.log(`Creating user: ${fullName} (${emailObj.email_address})`);

          await ctx.runMutation(internal.users.createUser, {
            clerkId: event.data.id,
            email: emailObj.email_address,
            imageUrl: imageUrl,
            name: fullName,
          });

          console.log(`Successfully created user: ${event.data.id}`);
        } catch (error) {
          console.error("Error in Clerk user.created webhook:", error);
          return new Response("Error creating user: " + (error as Error).message, { status: 500 });
        }
        break;

      case "user.updated":
        try {
          if (!event.data.email_addresses || event.data.email_addresses.length === 0) {
            console.error("No email address found in Clerk webhook user.updated event");
            return new Response("Missing email address", { status: 400 });
          }

          // Get the primary or first email
          const emailObj = event.data.email_addresses.find(email => email.id === event.data.primary_email_address_id) ||
            event.data.email_addresses[0];

          // Set a default image if none is provided
          const imageUrl = event.data.image_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

          console.log(`Updating user: ${event.data.id}`);

          await ctx.runMutation(internal.users.updateUser, {
            clerkId: event.data.id,
            imageUrl: imageUrl,
            email: emailObj.email_address,
          });

          console.log(`Successfully updated user: ${event.data.id}`);
        } catch (error) {
          console.error("Error in Clerk user.updated webhook:", error);
          return new Response("Error updating user: " + (error as Error).message, { status: 500 });
        }
        break;

      case "user.deleted":
        try {
          console.log(`Deleting user: ${event.data.id}`);

          await ctx.runMutation(internal.users.deleteUser, {
            clerkId: event.data.id as string,
          });

          console.log(`Successfully deleted user: ${event.data.id}`);
        } catch (error) {
          console.error("Error in Clerk user.deleted webhook:", error);
          return new Response("Error deleting user: " + (error as Error).message, { status: 500 });
        }
        break;

      default:
        console.log(`Ignoring unhandled Clerk event type: ${event.type}`);
    }

    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    console.error("Unexpected error in Clerk webhook handler:", error);
    return new Response("Server error: " + (error as Error).message, { status: 500 });
  }
});

const http = httpRouter();
http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature: string = request.headers.get("stripe-signature") as string;
    const result = await ctx.runAction(internal.stripe.fulfill, {
      signature,
      payload: await request.text(),
    });
    if (result.success) {
      return new Response(null, {
        status: 200,
      });
    } else {
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

http.route({
  path: "/clerk",
  method: "POST",
  handler: handleClerkWebhook,
});

const validateRequest = async (
  req: Request
): Promise<WebhookEvent | undefined> => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not defined - please check your environment variables");
    return undefined;
  }

  try {
    const payloadString = await req.text();
    const headerPayload = req.headers;

    // Log the webhook payload for debugging (avoid this in production)
    console.log("Clerk webhook payload received:", payloadString.substring(0, 200) + "...");

    // Check for required Svix headers
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing svix headers - are you sure the webhook is configured correctly in Clerk?");
      console.error("Headers received:", Object.fromEntries(headerPayload.entries()));
      return undefined;
    }

    const svixHeaders = {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    };

    console.log("Attempting to verify webhook with signature:", svixSignature);

    const wh = new Webhook(webhookSecret);
    const event = wh.verify(payloadString, svixHeaders);
    const webhookEvent = event as WebhookEvent;
    console.log("Webhook successfully verified for event type:", webhookEvent.type);
    return event as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error validating webhook:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return undefined;
  }
};

export default http;
