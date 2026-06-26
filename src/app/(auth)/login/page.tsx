import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  // Already signed in with an active profile → go to the app.
  if (isSupabaseConfigured()) {
    const session = await getSession();
    if (session) redirect("/dashboard");
  }

  const { reason } = await searchParams;
  return <LoginForm unconfigured={reason === "unconfigured"} />;
}
