import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { getSessionProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const name = session.profile?.full_name || session.email || "User";
  const role = session.profile?.role ?? "staff";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Nav name={name} role={role} />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
