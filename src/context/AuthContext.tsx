"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/api/config/supabase";
import { User } from "@supabase/supabase-js";
import { api } from "@/api";

interface AuthContextType {
  user: User | null;
  company: any | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  company: null,
  isAuthenticated: false,
  isOnboarded: false,
  loading: true,
  logout: async () => {},
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<any | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkOnboardingStatus = React.useCallback(async () => {
    try {
      const companyData = await api.companies.getMyCompany();
      setCompany(companyData);
      const onboarded = !!companyData;
      setIsOnboarded(onboarded);
      return onboarded;
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setIsOnboarded(false);
      setCompany(null);
      return false;
    }
  }, []);

  const refreshAuth = React.useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    
    if (currentUser) {
      await checkOnboardingStatus();
    } else {
      setIsOnboarded(false);
      setCompany(null);
    }
    setLoading(false);
  }, [checkOnboardingStatus]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await checkOnboardingStatus();
      } else {
        setIsOnboarded(false);
        setCompany(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshAuth, checkOnboardingStatus]);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = pathname.startsWith("/signin") || pathname.startsWith("/signup");
    const isAuthenticated = !!user;

    if (!isAuthenticated && !isPublicRoute) {
      router.push("/signin");
    } else if (isAuthenticated && !isOnboarded && !pathname.startsWith("/onboarding")) {
      router.push("/onboarding");
    } else if (isAuthenticated && isOnboarded && (isPublicRoute || pathname.startsWith("/onboarding"))) {
      router.push("/");
    }
  }, [user, isOnboarded, loading, pathname, router]);

  const logout = async () => {
    try {
      // Clear state first for immediate UI response
      setUser(null);
      setCompany(null);
      setIsOnboarded(false);
      
      // Attempt to sign out from Supabase (async)
      await api.auth.signOut();
      
      // Clear any potential local storage or cookies if they exist
      if (typeof window !== "undefined") {
        localStorage.clear();
        // Redirect to signin
        router.push("/signin");
        // Force reload if needed after a short delay to ensure clean state
        setTimeout(() => {
          if (window.location.pathname !== "/signin") {
            window.location.href = "/signin";
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Fallback redirect
      window.location.href = "/signin";
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      company,
      isAuthenticated: !!user, 
      isOnboarded, 
      loading, 
      logout,
      refreshAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
