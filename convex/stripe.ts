"use node";

import { v } from "convex/values";
import Stripe from "stripe";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

type Metadata = {
  userId: string;
};

export const pay = action({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await ctx.auth.getUserIdentity();

      if (!user) {
        return { error: true, message: "You must be logged in to subscribe" };
      }

      if (!user.emailVerified) {
        return { error: true, message: "You must have a verified email to subscribe" };
      }

      const domain = process.env.HOSTING_URL ?? "http://localhost:3000";
      const stripe = new Stripe(process.env.STRIPE_KEY!, {
        apiVersion: "2024-06-20",
      });
      
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: process.env.PRICE_ID!, quantity: 1 }],
        customer_email: user.email,
        metadata: {
          userId: user.subject,
        },
        mode: "subscription",
        success_url: `${domain}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domain}/payment/cancelled`,
        // Add automatic tax calculation if needed
        // automatic_tax: { enabled: true },
        payment_method_types: ['card'],
      });

      // You could log payment attempt here for analytics
      // await ctx.runMutation(internal.payments.logPaymentAttempt, {
      //   userId: user.subject,
      //   sessionId: session.id,
      // });

      return session.url!;
    } catch (error) {
      console.error("Payment creation error:", error);
      return {
        error: true,
        message: (error as Error).message || "Failed to create payment session",
      };
    }
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2024-06-20",
    });

    const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET!;
    try {
      const event = stripe.webhooks.constructEvent(
        args.payload,
        args.signature,
        webhookSecret
      );

      const completedEvent = event.data.object as Stripe.Checkout.Session & {
        metadata: Metadata;
      };

      if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
          completedEvent.subscription as string
        );

        const userId = completedEvent.metadata.userId;

        await ctx.runMutation(internal.users.updateSubscription, {
          userId,
          subscriptionId: subscription.id,
          endsOn: subscription.current_period_end * 1000,
        });
      }

      if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
          completedEvent.subscription as string
        );

        if (subscription && subscription.items.data.length > 0) {
          await ctx.runMutation(internal.users.updateSubscriptionBySubId, {
            subscriptionId: subscription.id, // Use subscription ID instead of price ID
            endsOn: subscription.current_period_end * 1000,
          });
        } else {
          console.error("Invalid subscription data received");
        }
      }

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});
