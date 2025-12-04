// server/stripe.ts
import Stripe from "stripe";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
// Single Stripe client instance
export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey)
    : null;
if (!stripeSecretKey) {
    console.warn("⚠️ STRIPE_SECRET_KEY not set – Stripe Connect helpers will throw if used.");
}
export const stripeHelpers = {
    /**
     * Create (or later: look up) an Express account for a player.
     */
    async createOrGetExpressAccount(args) {
        if (!stripeSecretKey) {
            throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
        }
        const account = await stripe.accounts.create({
            type: "express",
            email: args.email,
            country: args.country || "US", // <-- use passed country or fallback
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
    async createOnboardingLink(accountId) {
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
     * Payout status helper – **must** return `ready` because routes.ts uses it.
     */
    async getPayoutStatus(accountId) {
        if (!stripeSecretKey) {
            throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
        }
        const account = await stripe.accounts.retrieve(accountId);
        const payoutsEnabled = account.payouts_enabled;
        const chargesEnabled = account.charges_enabled;
        const detailsSubmitted = account.details_submitted;
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
