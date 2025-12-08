"use client";

import { BarChart, Code, Eye, EyeOff, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { authService } from "@/middle-service/supabase";

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [currentEmail, setEmail] = useState("");
  const [currentPassword, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [currentRole, setRole] = useState("designer");
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
            Create Account
          </h3>
          <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
            Join us today and get started with your journey.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSignUp}>
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Role
              </Label>
              <Select
                defaultValue="designer"
                onValueChange={setRole}
                value={currentRole}
              >
                <SelectTrigger
                  id="role"
                  className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0">
                  <SelectItem value="designer">
                    <User size={16} aria-hidden="true" />
                    <span className="truncate">Product Designer</span>
                  </SelectItem>
                  <SelectItem value="developer">
                    <Code size={16} aria-hidden="true" />
                    <span className="truncate">Developer</span>
                  </SelectItem>
                  <SelectItem value="manager">
                    <BarChart size={16} aria-hidden="true" />
                    <span className="truncate">Product Manager</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-foreground dark:text-foreground"
                >
                  First name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="mt-1"
                  onChange={(e) => setFirstName(e.target.value)}
                  value={firstName}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-foreground dark:text-foreground"
                >
                  Last name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="mt-1"
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Username
              </Label>
              <Input
                id="username"
                placeholder="johndoe"
                className="mt-1"
                onChange={(e) => setUserName(e.target.value)}
                value={username}
              />
            </div>

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
