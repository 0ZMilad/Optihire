"use client"

import { Header } from "@/components/header";
import ResetPassword from "@/components/reset-password";

import { useAuth } from "@/components/auth-provider";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);
  return (
    <>
      <Header />
      <ResetPassword />
    </>
  );
}
