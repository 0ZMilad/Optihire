"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { logger } from "@/lib/logger";

import { authService } from "@/middle-service/supabase";

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [currentEmail, setEmail] = useState("");
  const [currentPassword, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    setErrorMessage("");
    setSuccessMessage("");

    if (agreedToTerms == false) {
      setErrorMessage("You must agree to the terms first when signing up");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await authService.signUp(
        currentEmail,
        currentPassword
      );
      if (error) {
        setErrorMessage(error?.message);
      } else {
        if (data?.user && !data.session) {
          setSuccessMessage("Please check your email to verify your account.");
        } else if (data?.session) {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error) {
      logger.error("Signup failed", { error: error instanceof Error ? error.message : "Unknown error" });
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
            Create Account
          </h3>
          <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
            Join us today and get started with your journey.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSignUp}>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="mt-1"
                onChange={(e) => setEmail(e.target.value)}
                value={currentEmail}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="**************"
                  className="pr-10 mt-1"
                  onChange={(e) => setPassword(e.target.value)}
                  value={currentPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked === true)
                }
              />
              <label
                htmlFor="terms"
                className="text-xs sm:text-sm text-muted-foreground"
              >
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
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
              className="mt-6 w-full py-2 font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span>Signing up...</span>
                </div>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground dark:text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/90 dark:text-primary dark:hover:text-primary/90"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
