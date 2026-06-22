import { login } from "@/lib/actions/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-charcoal">Rental Manager</h1>
          <p className="mt-1 text-sm text-charcoal-soft">Sign in to continue</p>
        </div>

        {searchParams.error && (
          <p className="mb-4 rounded-lg bg-clay-50 px-3 py-2 text-sm text-clay-700">
            {searchParams.error}
          </p>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-charcoal">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm focus:border-clay-400 focus:outline-none focus:ring-1 focus:ring-clay-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-charcoal">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm focus:border-clay-400 focus:outline-none focus:ring-1 focus:ring-clay-400"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
