"use client";

import { Header } from "@/components/header";
import AuthCallback from "@/components/auth-callback";
import { Suspense } from "react";

// Loading fallback for Suspense
function CallbackLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<CallbackLoading />}>
        <AuthCallback />
      </Suspense>
    </>
  );
}
