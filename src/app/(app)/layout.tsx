import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { SessionProvider } from "@/components/providers/session-provider";
import { getSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    // Unauthenticated or deactivated → out to login.
    redirect("/login");
  }

  return (
    <SessionProvider
      value={{
        userId: session.userId,
        email: session.email,
        profile: session.profile,
        permissions: session.permissions,
        branches: session.branches,
      }}
    >
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
