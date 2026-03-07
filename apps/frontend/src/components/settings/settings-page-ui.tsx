"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useUserProfile } from "@/stores/user-profile-store";
import { userService } from "@/middle-service/users";
import { authService } from "@/middle-service/supabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PersonalFormState = {
  fullName: string;
  email: string;
  phone: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const initialPersonalForm: PersonalFormState = {
  fullName: "",
  email: "",
  phone: "",
};

const initialPasswordForm: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function SettingsPageUI() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading, setProfile, clearProfile } = useUserProfile();
  const backendUserId = profile?.id ?? null;
  const [personalForm, setPersonalForm] =
    useState<PersonalFormState>(initialPersonalForm);
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(initialPasswordForm);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string>("");
  const [profileError, setProfileError] = useState<string>("");
  const [securityMessage, setSecurityMessage] = useState<string>("");
  const [securityError, setSecurityError] = useState<string>("");
  const [dangerMessage, setDangerMessage] = useState<string>("");

  // Sync form from cached store profile; fall back to Supabase metadata
  useEffect(() => {
    if (profile) {
      setPersonalForm({
        fullName: profile.full_name ?? "",
        email: profile.email,
        phone: profile.phone ?? "",
      });
    } else if (!isProfileLoading) {
      // Profile not bootstrapped — seed from Supabase session metadata
      setPersonalForm((prev) => ({
        ...prev,
        fullName:
          prev.fullName ||
          (typeof user?.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : ""),
        email: prev.email || user?.email || "",
      }));
    }
  }, [profile, isProfileLoading, user]);

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage("");
    setProfileError("");
    try {
      const updated = await userService.updateCurrentUserProfile({
        full_name: personalForm.fullName.trim() || undefined,
        email: personalForm.email.trim() || undefined,
        phone: personalForm.phone.trim() || undefined,
      });
      setProfile(updated);
      setProfileMessage("Profile updated successfully.");
    } catch {
      setProfileError("Failed to save profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSecurity = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSecurityError("");
    setSecurityMessage("");

    if (passwordForm.newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSecurityError("New password and confirmation do not match.");
      return;
    }

    const email = user?.email;
    if (!email) {
      setSecurityError(
        "Unable to determine your account email. Please refresh."
      );
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error: signInError } = await authService.signIn(
        email,
        passwordForm.currentPassword
      );
      if (signInError) {
        setSecurityError("Current password is incorrect.");
        return;
      }
      const { error: updateError } = await authService.updatePassword(
        passwordForm.newPassword
      );
      if (updateError) {
        setSecurityError("Failed to update password. Please try again.");
        return;
      }
      setSecurityMessage("Password updated successfully.");
      setPasswordForm(initialPasswordForm);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!backendUserId) {
      setDangerMessage(
        "Cannot delete account: user ID not found. Please refresh."
      );
      return;
    }
    setIsDeletingAccount(true);
    try {
      await userService.deleteUser(backendUserId);
      clearProfile();
      await authService.signOut();
      router.push("/");
    } catch {
      setDangerMessage("Failed to delete account. Please try again.");
      setIsDeletingAccount(false);
    }
  };

  const filledProfileFields = [
    personalForm.fullName,
    personalForm.email,
    personalForm.phone,
  ].filter((value) => value.trim() !== "").length;
  const profileCompletion = Math.round((filledProfileFields / 3) * 100);
  const displayName =
    personalForm.fullName ||
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "") ||
    user?.email?.split("@")[0] ||
    "User";
  const displayEmail = personalForm.email || user?.email || "No email added";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join("")
    .toUpperCase();

  return (
    <section className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="size-16 rounded-2xl ring-4 ring-primary/10">
              <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                User Settings
              </h1>

              <p className="max-w-2xl text-sm text-muted-foreground">
                Manage your profile details, security controls, and account
                ownership settings from one place.
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1.5">
                  <Mail className="size-3.5" />
                  {displayEmail}
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  {profileCompletion}% profile complete
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-3 bg-transparent p-0 md:grid-cols-3">
          <TabsTrigger
            value="personal"
            className="h-auto flex-col items-start gap-1 rounded-xl border bg-card px-4 py-4 text-left data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <UserRound className="size-4" />
              Personal Information
            </span>
            <span className="text-xs text-muted-foreground">
              Contact details and profile summary
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-auto flex-col items-start gap-1 rounded-xl border bg-card px-4 py-4 text-left data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="size-4" />
              Security
            </span>
            <span className="text-xs text-muted-foreground">
              Password controls and sign-in protection
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="danger"
            className="h-auto flex-col items-start gap-1 rounded-xl border bg-card px-4 py-4 text-left data-[state=active]:border-destructive/30 data-[state=active]:bg-destructive/5 data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4" />
              Danger Zone
            </span>
            <span className="text-xs text-muted-foreground">
              Irreversible account ownership actions
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-0">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_320px]">
            <Card className="rounded-xl">
              <CardHeader className="space-y-2 border-b">
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>
                  Manage the details shown across your account profile.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveProfile}>
                <CardContent className="space-y-4 pt-6">
                  {isProfileLoading ? (
                    <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground animate-pulse">
                      Loading profile…
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          value={personalForm.fullName}
                          onChange={(event) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              fullName: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={personalForm.email}
                          onChange={(event) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              email: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter your phone number"
                          value={personalForm.phone}
                          onChange={(event) =>
                            setPersonalForm((prev) => ({
                              ...prev,
                              phone: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                  {profileError ? (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {profileError}
                    </div>
                  ) : null}
                  {!profileError && profileMessage ? (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                      {profileMessage}
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="justify-end border-t pt-6">
                  <Button
                    type="submit"
                    disabled={isSavingProfile || isProfileLoading}
                  >
                    {isSavingProfile ? "Saving…" : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="rounded-xl">
              <CardHeader className="space-y-2 border-b">
                <CardTitle className="text-lg">Profile Preview</CardTitle>
                <CardDescription>
                  A quick snapshot of how your account details are shaping up.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 rounded-xl">
                      <AvatarFallback className="rounded-xl bg-primary/10 font-semibold text-primary">
                        {initials || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{displayName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Profile completion
                    </span>
                    <span className="font-medium">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground/80 transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4" />
                    <span className="truncate">{displayEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    <span>{personalForm.phone || "Add a phone number"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_320px]">
            <Card className="rounded-xl">
              <CardHeader className="space-y-2 border-b">
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>
                  Update your password and security controls.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSaveSecurity}>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Current password"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="New password"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {securityError ? (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {securityError}
                    </div>
                  ) : null}
                  {!securityError && securityMessage ? (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                      {securityMessage}
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="justify-end border-t pt-6">
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Updating…" : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="rounded-xl">
              <CardHeader className="space-y-2 border-b">
                <CardTitle className="text-lg">Security Snapshot</CardTitle>
                <CardDescription>
                  Quick guidance for keeping your account access healthy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-sm">
                <div className="space-y-3">
                  <div className="rounded-xl border p-4 text-muted-foreground">
                    Use at least 8 characters and avoid reusing old passwords.
                  </div>
                  <div className="rounded-xl border p-4 text-muted-foreground">
                    Your current password is verified before any change is
                    applied. You will remain signed in after a successful
                    update.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="danger" className="mt-0">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_320px]">
            <Card className="rounded-xl border-destructive/40">
              <CardHeader className="space-y-2 border-b">
                <CardTitle className="text-lg text-destructive">
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanently removing your account cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {dangerMessage ? (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {dangerMessage}
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="justify-end border-t pt-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={isDeletingAccount}
                    >
                      <Trash2 className="mr-2 size-4" />
                      {isDeletingAccount ? "Deleting…" : "Delete Account"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently deactivate your account and sign
                        you out. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                      >
                        {isDeletingAccount ? "Deleting…" : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>

            <Card className="rounded-xl border-destructive/30">
              <CardHeader className="space-y-2 border-b">
                <CardTitle className="text-lg">Before You Proceed</CardTitle>
                <CardDescription>
                  What happens when you delete your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
                <div className="rounded-xl border p-4">
                  Your account will be deactivated and all associated resumes,
                  analyses, and profile data will be inaccessible.
                </div>
                <div className="rounded-xl border p-4">
                  You will be signed out immediately after deletion and
                  redirected to the home page.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
