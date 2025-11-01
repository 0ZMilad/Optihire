"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send a reset email
    setStep("reset");
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically submit the new password
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {step === "email" ? (
            <>
              <h3 className="text-center text-lg font-semibold text-foreground dark:text-foreground">
                Reset Password
              </h3>
              <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
              <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
                <div>
                  <Label
                    htmlFor="email-reset"
                    className="text-sm font-medium text-foreground dark:text-foreground"
                  >
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    id="email-reset"
                    name="email-reset"
                    autoComplete="email"
                    placeholder="john@example.com"
                    className="mt-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="mt-4 w-full py-2 font-medium">
                  Send Reset Link
                </Button>
              </form>
              <p className="mt-6 text-sm text-muted-foreground dark:text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/90 dark:text-primary dark:hover:text-primary/90"
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <h3 className="text-center text-lg font-semibold text-foreground dark:text-foreground">
                Create New Password
              </h3>
              <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
                Enter your new password below.
              </p>
              <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
                <div>
                  <Label
                    htmlFor="password-new"
                    className="text-sm font-medium text-foreground dark:text-foreground"
                  >
                    New Password
                  </Label>
                  <Input
                    type="password"
                    id="password-new"
                    name="password-new"
                    autoComplete="new-password"
                    placeholder="**************"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="password-confirm"
                    className="text-sm font-medium text-foreground dark:text-foreground"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    id="password-confirm"
                    name="password-confirm"
                    autoComplete="new-password"
                    placeholder="**************"
                    className="mt-2"
                    required
                  />
                </div>
                <Button type="submit" className="mt-4 w-full py-2 font-medium">
                  Reset Password
                </Button>
              </form>
              <p className="mt-6 text-sm text-muted-foreground dark:text-muted-foreground">
                Back to{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/90 dark:text-primary dark:hover:text-primary/90"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
