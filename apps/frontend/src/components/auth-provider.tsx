"use client";

import {
  Children,
  createContext,
  PropsWithChildren,
  useState,
  useEffect,
  useContext,
  use,
} from "react";
import { Session, User, SupabaseClient } from "@supabase/supabase-js";
import { supabase, authService } from "../middle-service/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [currentSession, setSession] = useState<Session | null>(null);

  const [currentUser, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

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
