"use client";

import { Header } from "@/components/header";
import Login from "@/components/login";

import { useAuth } from "@/components/auth-provider";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

export default function LoginPage() {
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
      <Login />
    </>
  );
}
