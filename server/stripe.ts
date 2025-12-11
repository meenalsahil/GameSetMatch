// server/stripe.ts
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";

// Single Stripe client instance (or null if not configured)
export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

if (!stripeSecretKey) {
  console.warn(
    "⚠️ STRIPE_SECRET_KEY not set – Stripe Connect helpers will throw if used.",
  );
}

// ---- Types ----

type CreateAccountArgs = {
  // can be number or UUID string, we only ever stringify it
  playerId: number | string;
  email: string;
  fullName: string;
  country?: string;
  existingAccountId?: string | null;
};

type CreateSponsorCheckoutArgs = {
  playerId: number | string;
  playerName: string;
  amountCents: number;
  currency: string;
  // Connected account that should receive the funds
  stripeAccountId: string;
};

// Platform fee: 7% (GameSetMatch keeps this)
const PLATFORM_FEE_PERCENT = 7;

// ---- Helpers ----

export const stripeHelpers = {
  /**
   * Create (or look up) an Express account for a player.
   * If existingAccountId is provided, we try to retrieve it.
   * If Stripe says "no such account", we create a fresh one and let
   * routes.ts persist the new account id in the database.
   */
  async createOrGetExpressAccount(args: CreateAccountArgs) {
    if (!stripeSecretKey || !stripe) {
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
    }

    const { existingAccountId, email, fullName, country, playerId } = args;

    // Try to reuse existing account if the stored ID is valid
    if (existingAccountId) {
      try {
        const existing = await stripe.accounts.retrieve(existingAccountId);
        return existing;
      } catch (err: any) {
        // If Stripe says "no such account", fall through and create a new one
        if (err && err.code === "resource_missing") {
          console.warn(
            "Stored stripeAccountId is invalid; creating a fresh Express account",
          );
        } else {
          // Any other error is real – rethrow it
          throw err;
        }
      }
    }

    // Otherwise create a new Express account
    const account = await stripe.accounts.create({
      type: "express",
      email,
      country: country || "US",
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        playerId: String(playerId),
        fullName,
      },
      business_profile: {
        product_description: "Tennis sponsorship payouts via GameSetMatch",
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
   * Payout status helper – routes.ts can check `status.ready`, and also
   * see what requirements are still due.
   */
  async getPayoutStatus(accountId: string) {
    if (!stripeSecretKey || !stripe) {
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
    }

    const account = await stripe.accounts.retrieve(accountId);

    const payoutsEnabled = (account as any).payouts_enabled;
    const chargesEnabled = (account as any).charges_enabled;
    const detailsSubmitted = (account as any).details_submitted;

    const requirements = (account as any).requirements ?? {};
    const currentlyDue: string[] = requirements.currently_due ?? [];

    // For TEST MODE: be more lenient - just check if payouts are enabled
    // In production, you might want stricter checks
    const ready = Boolean(payoutsEnabled);

    return {
      payoutsEnabled: !!payoutsEnabled,
      chargesEnabled: !!chargesEnabled,
      detailsSubmitted: !!detailsSubmitted,
      ready,
      currentlyDue,
    };
  },

  /**
   * Get earnings/transfers for a connected account
   */
  async getAccountEarnings(stripeAccountId: string): Promise<{
    totalEarnings: number;
    availableBalance: number;
    pendingBalance: number;
    recentTransfers: Array<{
      id: string;
      amount: number;
      currency: string;
      created: Date;
      description: string | null;
      sponsorEmail?: string;
    }>;
  }> {
    if (!stripe) {
      return {
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        recentTransfers: [],
      };
    }

    try {
      // Get balance for the connected account
      const balance = await stripe.balance.retrieve({
        stripeAccount: stripeAccountId,
      });

      // Get transfers TO this connected account (from platform)
      const transfers = await stripe.transfers.list({
        destination: stripeAccountId,
        limit: 50,
      });

      // Calculate totals
      const availableBalance = balance.available.reduce(
        (sum, b) => sum + (b.currency === "usd" ? b.amount : 0),
        0
      );
      const pendingBalance = balance.pending.reduce(
        (sum, b) => sum + (b.currency === "usd" ? b.amount : 0),
        0
      );

      const totalEarnings = transfers.data.reduce((sum, t) => sum + t.amount, 0);

      // Format transfers for display
      const recentTransfers = await Promise.all(
        transfers.data.map(async (t) => {
          // Try to get the original charge to find sponsor info
          let sponsorEmail: string | undefined;
          if (t.source_transaction) {
            try {
              const charge = await stripe.charges.retrieve(t.source_transaction as string);
              sponsorEmail = charge.billing_details?.email || charge.receipt_email || undefined;
            } catch (e) {
              // Ignore - charge might not be accessible
            }
          }

          return {
            id: t.id,
            amount: t.amount,
            currency: t.currency,
            created: new Date(t.created * 1000),
            description: t.description,
            sponsorEmail,
          };
        })
      );

      return {
        totalEarnings,
        availableBalance,
        pendingBalance,
        recentTransfers,
      };
    } catch (error) {
      console.error("Error fetching account earnings:", error);
      return {
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        recentTransfers: [],
      };
    }
  },

  /**
   * Create a Checkout Session for sponsoring a player.
   * Used by /api/payments/sponsor-checkout in routes.ts
   */
  async createSponsorCheckoutSession(
    args: CreateSponsorCheckoutArgs,
  ): Promise<string> {
    if (!stripeSecretKey || !stripe) {
      throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
    }

    if (!args.stripeAccountId) {
      throw new Error("Player does not have a connected Stripe account.");
    }

    const appUrl = process.env.APP_URL || "http://localhost:5001";

    // Platform fee: 7% of the amount
    const platformFeeAmount = Math.round(
      (args.amountCents * PLATFORM_FEE_PERCENT) / 100,
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: args.currency,
            unit_amount: args.amountCents,
            product_data: {
              name: `Support for ${args.playerName}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/player/${args.playerId}?sponsored=1`,
      cancel_url: `${appUrl}/player/${args.playerId}?canceled=1`,
      payment_intent_data: {
        // Platform fee that GameSetMatch keeps
        application_fee_amount: platformFeeAmount,
        // Remaining funds go to the player's connected account
        transfer_data: {
          destination: args.stripeAccountId,
        },
      },
      metadata: {
        playerId: String(args.playerId),
        playerName: args.playerName,
        platformFeePercent: String(PLATFORM_FEE_PERCENT),
      },
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe Checkout Session.");
    }

    // routes.ts expects a plain URL string
    return session.url;
  },
};

export function isStripeEnabled() {
  return Boolean(stripeSecretKey);
}