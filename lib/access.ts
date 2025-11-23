// lib/access.ts
export function isAdmin(profile: any) {
  return profile?.role === "admin";
}

export function hasProAccess(profile: any) {
  if (!profile) return false;

  if (isAdmin(profile)) return true;

  const now = new Date();

  const isTrialActive =
    profile.subscription_status === "trialing" ||
    (profile.trial_end && new Date(profile.trial_end) > now);

  const isPaying =
    profile.subscription_status === "active" ||
    profile.subscription_status === "past_due";

  return isTrialActive || isPaying;
}
