import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { SupabaseService } from '../services/supabaseService';

export interface AuthContextValue {
  isSignedIn: boolean;
  isLoaded: boolean;
  userId: string | null;
  userEmail: string | null;
  clerkConfigured: boolean;
  isPremium: boolean;
  subscriptionPlan: 'free' | 'essenziale' | 'avanzato' | 'maestro' | null;
  refreshSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isSignedIn: false,
  isLoaded: true,
  userId: null,
  userEmail: null,
  clerkConfigured: false,
  isPremium: false,
  subscriptionPlan: null,
  refreshSubscription: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Proveedor interno que usa hooks de Clerk.
 * Solo se renderiza cuando ClerkProvider está presente en el árbol.
 */
function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, userId, signOut: clerkSignOut } = useClerkAuth();
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;

  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'essenziale' | 'avanzato' | 'maestro' | null>(null);

  const refreshSubscription = useCallback(async () => {
    if (!userId) return;
    const sub = await SupabaseService.getSubscription(userId);
    const active = sub?.status === 'active';
    setIsPremium(active);
    setSubscriptionPlan(active ? (sub?.plan_type as any) : 'free');
  }, [userId]);

  // Sincronizar usuario con Supabase tras sign in y cargar suscripción
  useEffect(() => {
    if (isSignedIn && userId && userEmail) {
      SupabaseService.upsertUser(userId, userEmail);
      SupabaseService.ensureFreeSubscription(userId);
      refreshSubscription();
    } else if (!isSignedIn) {
      setIsPremium(false);
      setSubscriptionPlan(null);
    }
  }, [isSignedIn, userId, userEmail]);

  const signOut = async () => {
    await clerkSignOut();
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: isSignedIn ?? false,
        isLoaded,
        userId: userId ?? null,
        userEmail,
        clerkConfigured: true,
        isPremium,
        subscriptionPlan,
        refreshSubscription,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Proveedor fallback cuando Clerk no está configurado.
 * El usuario es tratado como visitante anónimo (tier free).
 */
function GuestAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        isSignedIn: false,
        isLoaded: true,
        userId: null,
        userEmail: null,
        clerkConfigured: false,
        isPremium: false,
        subscriptionPlan: null,
        refreshSubscription: async () => {},
        signOut: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const CLERK_CONFIGURED = !!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * AuthProvider — envuelve la app y expone el estado de autenticación.
 *
 * Si EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY está configurado, usa Clerk.
 * Si no, permite el uso de la app como visitante (free, sin auth).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (CLERK_CONFIGURED) {
    return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
  }
  return <GuestAuthProvider>{children}</GuestAuthProvider>;
}
