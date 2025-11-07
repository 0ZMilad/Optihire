"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormEvent, useState } from "react";
import { authService } from "@/middle-service/supabase";

export default function Login() {
  const [currentEmail, setEmail] = useState("");

  const [currentPassword, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    setErrorMessage("");

    try {
      const { error } = await authService.signIn(currentEmail, currentPassword);
      if (error) {
        setErrorMessage(error?.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Error occurred, check logs");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h3 className="text-center text-lg font-semibold text-foreground dark:text-foreground">
            Welcome Back
          </h3>
          <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
            Enter your credentials to access your account.
          </p>
          <form
            action="#"
            method="post"
            className="mt-6 space-y-4"
            onSubmit={handleLogin}
          >
            <div>
              <Label
                htmlFor="email-login-03"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Email
              </Label>
              <Input
                type="email"
                id="email-login-03"
                name="email-login-03"
                autoComplete="email"
                placeholder="Milad.@example.com"
                className="mt-2"
                onChange={(e) => setEmail(e.target.value)}
                value={currentEmail}
              />
            </div>
            <div>
              <Label
                htmlFor="password-login-03"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Password
              </Label>
              <Input
                type="password"
                id="password-login-03"
                name="password-login-03"
                autoComplete="password"
                placeholder="**************"
                className="mt-2"
                onChange={(e) => setPassword(e.target.value)}
                value={currentPassword}
              />
            </div>
            {errorMessage && (
              <div className="rounded bg-destructive/10 border border-destructive/20 p-2">
                <p className="text-xs font-medium text-destructive">
                  ⚠️ {errorMessage}
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="mt-4 w-full py-2 font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-1">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-background border-t-foreground" />
                  <span className="text-sm">Signing in...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-6 space-y-3">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/reset-password">Forgot your password?</Link>
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/sign-up">Create new account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
