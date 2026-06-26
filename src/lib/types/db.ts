/** Shared domain types for Stage 2 entities. */

import type { Locale } from "@/i18n/config";

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string | null;
  contact_person: string | null;
  contact_number: string | null;
  email: string | null;
  doc_prefix: string;
  is_active: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  preferred_language: Locale;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

/** A user row enriched with role codes and assigned branch ids (admin views). */
export interface UserSummary {
  profile: Profile;
  roleCodes: string[];
  branchIds: string[];
}
