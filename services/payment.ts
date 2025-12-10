import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo';

export class PaymentService {
    private stripePromise: Promise<Stripe | null>;

    constructor() {
        this.stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }

    // Create a checkout session for subscription
    async createCheckoutSession(priceId: string): Promise<string> {
        // In production, this would call your backend API
        // which creates a Stripe Checkout Session

        // Mock implementation for now
        console.log('Creating checkout session for price:', priceId);

        // This would normally return a session ID from your backend
        // For now, we'll simulate the flow
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('mock_session_id');
            }, 1000);
        });
    }

    // Handle successful subscription
    async handleSubscriptionSuccess(sessionId: string): Promise<void> {
        // Verify the session with your backend
        // Update user's subscription status in Firestore
        console.log('Subscription successful:', sessionId);

        // Store premium status
        localStorage.setItem('vitality_premium', 'true');
        localStorage.setItem('vitality_subscription_id', sessionId);
    }

    // Check subscription status
    async checkSubscriptionStatus(): Promise<boolean> {
        // In production, verify with Stripe via your backend
        const isPremium = localStorage.getItem('vitality_premium') === 'true';
        return isPremium;
    }

    // Cancel subscription
    async cancelSubscription(): Promise<void> {
        // Call your backend to cancel the Stripe subscription
        console.log('Cancelling subscription');

        localStorage.removeItem('vitality_premium');
        localStorage.removeItem('vitality_subscription_id');
    }

    // Get subscription details
    async getSubscriptionDetails(): Promise<{
        status: 'active' | 'cancelled' | 'none';
        planName: string;
        nextBillingDate?: string;
    }> {
        const isPremium = await this.checkSubscriptionStatus();

        if (isPremium) {
            return {
                status: 'active',
                planName: 'Vita+ Annual',
                nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            };
        }

        return {
            status: 'none',
            planName: 'Free'
        };
    }
}

export const paymentService = new PaymentService();

// Stripe Price IDs (create these in your Stripe Dashboard)
export const STRIPE_PRICES = {
    ANNUAL: 'price_annual_vitality_plus', // Replace with actual price ID
    MONTHLY: 'price_monthly_vitality_plus' // Replace with actual price ID
};
