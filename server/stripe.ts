// server/stripe.ts
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";

// Single Stripe client instance
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : (null as unknown as Stripe);

if (!stripeSecretKey) {
  console.warn(
    "⚠️ STRIPE_SECRET_KEY not set – Stripe helpers will throw if used.",
  );
}

// NOTE: routes.ts passes player.country as well,
// so country MUST be part of this type.
type CreateAccountArgs = {
  playerId: number;
  email: string;
  fullName: string;
  country?: string;
  existingAccountId?: string;
};

type CreateSponsorCheckoutSessionArgs = {
  playerId: number;
  playerName: string;
  stripeAccountId: string;
};

export const stripeHelpers = {
  /**
   * Create (or later: look up) an Express account for a player.
   */
  async createOrGetExpressAccount(args: CreateAccountArgs) {
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
    }

    // If we already have an account id, you could look it up.
    if (args.existingAccountId) {
      const existing = await stripe.accounts.retrieve(args.existingAccountId);
      if (!("deleted" in existing && existing.deleted)) {
        return existing;
      }
      // if it was deleted, fall through and create new
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: args.email,
      country: args.country || "US",
      business_type: "individual",
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        playerId: String(args.playerId),
        fullName: args.fullName,
      },
    });

    return account;
  },

  /**
   * Create an onboarding link so the player can complete their Stripe details.
   */
  async createOnboardingLink(accountId: string) {
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
    }

    const appUrl = process.env.APP_URL || "http://localhost:5001";

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard`,
      return_url: `${appUrl}/dashboard`,
      type: "account_onboarding",
    });

    return link.url;
  },

  /**
   * Payout status helper – routes.ts checks `status.ready`.
   */
  async getPayoutStatus(accountId: string) {
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
    }

    const account = await stripe.accounts.retrieve(accountId);

    const payoutsEnabled = (account as any).payouts_enabled;
    const chargesEnabled = (account as any).charges_enabled;
    const detailsSubmitted = (account as any).details_submitted;

    return {
      payoutsEnabled,
      chargesEnabled,
      detailsSubmitted,
      ready: Boolean(payoutsEnabled && chargesEnabled && detailsSubmitted),
    };
  },

  /**
   * Create a Stripe Checkout session for sponsoring a player.
   * This assumes a fixed example amount – you can tune this later.
   */
  async createSponsorCheckoutSession(
    args: CreateSponsorCheckoutSessionArgs,
  ): Promise<string> {
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
    }

    const appUrl = process.env.APP_URL || "http://localhost:5001";

    // Example: $25.00 USD one-time payment routed to the player's account
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 2500, // 25.00 USD
            product_data: {
              name: `Sponsorship for ${args.playerName}`,
            },
          },
        },
      ],
      success_url: `${appUrl}/players/${args.playerId}?sponsored=1`,
      cancel_url: `${appUrl}/players/${args.playerId}?canceled=1`,
      // Route the funds to the player's connected account
      payment_intent_data: {
        transfer_data: {
          destination: args.stripeAccountId,
        },
      },
    });

    if (!session.url) {
      throw new Error("Stripe Checkout session did not return a URL");
    }

    return session.url;
  },
};

export function isStripeEnabled() {
  return Boolean(stripeSecretKey);
}
