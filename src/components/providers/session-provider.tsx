"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { Branch, Profile } from "@/lib/types/db";
import {
  hasPermission as hasPermissionIn,
  type PermissionCode,
} from "@/lib/auth/permissions";
import { useTranslation } from "@/i18n/provider";

export interface SessionContextValue {
  userId: string;
  email: string | null;
  profile: Profile;
  permissions: string[];
  branches: Branch[];
  can: (permission: PermissionCode) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: Omit<SessionContextValue, "can">;
  children: ReactNode;
}) {
  const { locale, setLocale } = useTranslation();

  // Keep the UI language in sync with the user's saved preference.
  useEffect(() => {
    if (value.profile.preferred_language !== locale) {
      setLocale(value.profile.preferred_language);
    }
    // Only react to a change in the stored preference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.profile.preferred_language]);

  const ctx: SessionContextValue = {
    ...value,
    can: (permission) => hasPermissionIn(value.permissions, permission),
  };

  return (
    <SessionContext.Provider value={ctx}>{children}</SessionContext.Provider>
  );
}

/** Returns the session, or null when rendered outside a SessionProvider. */
export function useOptionalSession(): SessionContextValue | null {
  return useContext(SessionContext);
}

/** Returns the session; throws if used outside a SessionProvider. */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
