// server/stripe.ts
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";

// Single Stripe client instance (or null if not configured)
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null;

if (!stripeSecretKey) {
  console.warn(
    "⚠️ STRIPE_SECRET_KEY not set – Stripe Connect helpers will throw if used."
  );
}

// NOTE: routes.ts passes player.country and existingAccountId as well
type CreateAccountArgs = {
  playerId: number;
  email: string;
  fullName: string;
  country?: string;
  existingAccountId?: string;
};

export const stripeHelpers = {
  /**
   * Create (or look up) an Express account for a player.
   * If existingAccountId is provided, we just retrieve and return that account.
   */
  async createOrGetExpressAccount(args: CreateAccountArgs) {
    if (!stripeSecretKey || !stripe) {
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
    }

    // Reuse existing account if we already have one
    if (args.existingAccountId) {
      const existing = await stripe.accounts.retrieve(args.existingAccountId);
      return existing;
    }

    // Otherwise create a new Express account
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
    if (!stripeSecretKey || !stripe) {
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
   * Payout status helper – **must** return `ready` because routes.ts uses it.
   */
  async getPayoutStatus(accountId: string) {
    if (!stripeSecretKey || !stripe) {
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
      // routes.ts checks `status.ready`
      ready: Boolean(payoutsEnabled && chargesEnabled && detailsSubmitted),
    };
  },
};

export function isStripeEnabled() {
  return Boolean(stripeSecretKey);
}
