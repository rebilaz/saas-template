interface StripePlan {
  name: string;
  planId: number;
  priceInUSD: number;
  realPriceInUSD?: number;
  monthlyGeneration: number;
  priceId: string;
  hasTrial: boolean;
}

export type StripePlanKeys = "StarterMonthly" | "StarterAnnualy";

type StripePlans = {
  [key in StripePlanKeys]: StripePlan;
};

export const STRIPE_PLANS: StripePlans = {
  StarterMonthly: {
    name: "7 days trial",
    planId: 1,
    priceInUSD: 0,
    realPriceInUSD: 19.99,
    monthlyGeneration: 30,
    priceId: "price_1OdCevHbY1putycV9eudGzcH",
    hasTrial: true,
  },
  StarterAnnualy: {
    name: "Starter",
    planId: 1,
    priceInUSD: 14.99,
    monthlyGeneration: 1000,
    priceId: "price_1OdCfyHbY1putycVhKTq9Zqa",
    hasTrial: false
  }
};

export function findPlanFromPriceId(priceId: string): StripePlan | null {
  const planValues = Object.values(STRIPE_PLANS);
  for (const plan of planValues) {
    if (plan.priceId === priceId) {
      return plan;
    }
  }
  return null;
}