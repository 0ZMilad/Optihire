"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "./ui/spinner";
import { authService } from "@/middle-service/supabase";

export default function ResetPassword() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error } = await authService.resetPassword(email);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Reset link sent! Check your email.");
      }
    } catch (error) {
      console.error("Reset failed:", error);
      setErrorMessage("Error occurred, check logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await authService.updatePassword(newPassword);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Password updated successfully!");
      }
    } catch (error) {
      console.error("Reset failed:", error);
      setErrorMessage("Error occurred, check logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("reset");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
                {errorMessage && (
                  <div className="rounded bg-destructive/10 border border-destructive/20 p-2">
                    <p className="text-xs font-medium text-destructive">
                      ⚠️ {errorMessage}
                    </p>
                  </div>
                )}
                {successMessage && (
                  <div className="rounded bg-green-500/10 border border-green-500/20 p-2">
                    <p className="text-xs font-medium text-green-600">
                      ✅ {successMessage}
                    </p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="mt-4 w-full py-2 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="h-4 w-4" />
                      <span>Sending Link...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
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
                    onChange={(e) => setNewPassword(e.target.value)}
                    value={newPassword}
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                  />
                </div>
                {errorMessage && (
                  <div className="rounded bg-destructive/10 border border-destructive/20 p-2">
                    <p className="text-xs font-medium text-destructive">
                      ⚠️ {errorMessage}
                    </p>
                  </div>
                )}
                {successMessage && (
                  <div className="rounded bg-green-500/10 border border-green-500/20 p-2">
                    <p className="text-xs font-medium text-green-600">
                      ✅ {successMessage}
                    </p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="mt-4 w-full py-2 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="h-4 w-4" />
                      <span>Updating Password...</span>
                    </div>
                  ) : (
                    "Update Password"
                  )}
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
