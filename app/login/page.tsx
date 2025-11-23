"use client";

import { Suspense } from "react";

import AuthSection from "@/components/AuthSection";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthSection />
    </Suspense>
  );
}
