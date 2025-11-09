"use client";

import {
  createContext,
  PropsWithChildren,
  useState,
  useEffect,
  useContext,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "@/middle-service/supabase";

import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  session: Session | null;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const pathname = usePathname();

  const [currentSession, setSession] = useState<Session | null>(null);

  const [currentUser, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session && (pathname === "/login" || pathname === "/sign-up")) {
        router.push("/dashboard");
      }

      if (session == null && pathname === "/dashboard") {
        router.push("/login");
      }
    });
    return () => subscription?.unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider
      value={{ session: currentSession, user: currentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (context == null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
