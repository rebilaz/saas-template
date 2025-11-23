interface StripePlan {
  name: string;
  planId: number;
  priceInUSD: number;
  compareAtPrice?: number;
  priceId: string;
  hasTrial: boolean;
}

export type StripePlanKeys = "ProMonthly" | "ProYearly";

type StripePlans = {
  [key in StripePlanKeys]: StripePlan;
};

const monthlyPriceId =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || "price_monthly_placeholder";
const yearlyPriceId =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || "price_yearly_placeholder";

export const STRIPE_PLANS: StripePlans = {
  ProMonthly: {
    name: "Pro",
    planId: 1,
    priceInUSD: 29,
    compareAtPrice: 39,
    priceId: monthlyPriceId,
    hasTrial: true,
  },
  ProYearly: {
    name: "Pro Yearly",
    planId: 2,
    priceInUSD: 290,
    compareAtPrice: 468,
    priceId: yearlyPriceId,
    hasTrial: true,
  },
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
