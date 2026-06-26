#!/usr/bin/env bash
# ============================================================================
# Apply migrations to a throwaway Postgres database and run the RLS test suite.
#
# Usage:  scripts/db-test.sh
#
# Requires a reachable Postgres superuser connection. Configure via PSQL_SUPER,
# e.g.  PSQL_SUPER="psql -U postgres -h localhost"  (defaults to local peer:
#       sudo -u postgres psql).  The test database is dropped and recreated.
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_NAME="${DB_NAME:-threef_stage2_test}"
PSQL_SUPER="${PSQL_SUPER:-sudo -u postgres psql}"

run_super() { $PSQL_SUPER -v ON_ERROR_STOP=1 "$@"; }
run_db()    { $PSQL_SUPER -v ON_ERROR_STOP=1 -d "$DB_NAME" "$@"; }

echo "==> Recreating database '$DB_NAME'"
run_super -c "drop database if exists $DB_NAME;"
run_super -c "create database $DB_NAME;"

echo "==> Bootstrapping local Supabase stubs (auth schema, roles)"
run_db -f "$ROOT/tests/db/00_bootstrap_local.sql"

echo "==> Applying migrations"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "    - $(basename "$f")"
  run_db -f "$f" >/dev/null
done

echo "==> Seeding synthetic test users"
run_db -f "$ROOT/tests/db/10_seed_test_users.sql" >/dev/null

echo "==> Running RLS test suite"
run_db -f "$ROOT/tests/db/20_rls_tests.sql"

echo "==> Cleaning up"
run_super -c "drop database if exists $DB_NAME;" >/dev/null

echo "==> DB tests OK"
