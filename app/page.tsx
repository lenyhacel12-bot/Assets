export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="badge bg-clay-100 text-clay-700">Scaffold ready</span>
      <h1 className="text-3xl font-semibold text-charcoal">Rental Manager</h1>
      <p className="max-w-md text-charcoal-soft">
        Project scaffold and database schema are in place. UI modules
        (Dashboard, Units, Vacancy, Tenants, Payments, Expenses, Repairs,
        Reports) are built next, after the schema review.
      </p>
    </main>
  );
}
