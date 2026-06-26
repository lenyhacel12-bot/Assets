import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { getTranslations } from "@/i18n/server";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const t = await getTranslations();
  const supabase = await createClient();
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", session.userId);

  const roleNames: string[] = Array.isArray(roleRows)
    ? roleRows
        .map((r) => {
          const roles = (r as { roles?: unknown }).roles;
          const role = Array.isArray(roles) ? roles[0] : roles;
          return typeof role === "object" && role !== null && "name" in role
            ? String((role as { name: unknown }).name)
            : null;
        })
        .filter((x): x is string => Boolean(x))
    : [];

  return (
    <div>
      <PageHeader
        title={t("profile.title")}
        description={t("profile.subtitle")}
      />
      <ProfileForm
        profile={session.profile}
        email={session.email}
        roleNames={roleNames}
        branchNames={session.branches.map((b) => b.name)}
      />
    </div>
  );
}
