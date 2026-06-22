// Application types mirroring the database schema (supabase/migrations/0001_init.sql).
// Hand-maintained for the Supabase-client-only setup. Regenerate with the
// Supabase CLI (`supabase gen types typescript`) later if desired.

export type RentalType =
  | "bedspace"
  | "apartment"
  | "commercial"
  | "room_rental"
  | "short_term";

export type UnitStatus = "vacant" | "occupied" | "under_repair";
export type TenantStatus = "active" | "past" | "pending_moveout";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type PaymentMethod = "cash" | "gcash" | "bank_transfer" | "check" | "other";
export type ExpenseCategory = "repair" | "utilities" | "supplies" | "other";
export type RepairStatus = "reported" | "in_progress" | "done";
export type DocumentType = "id" | "requirement" | "contract" | "other";

export interface Location {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  location_id: string;
  name: string;
  rental_type: RentalType;
  monthly_rate: number;
  status: UnitStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  unit_id: string | null;
  move_in_date: string | null;
  contract_end_date: string | null;
  monthly_rate: number;
  status: TenantStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantDocument {
  id: string;
  tenant_id: string;
  doc_type: DocumentType;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  unit_id: string | null;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: PaymentStatus;
  method: PaymentMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  location_id: string;
  unit_id: string | null;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description: string | null;
  receipt_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Repair {
  id: string;
  unit_id: string;
  description: string;
  status: RepairStatus;
  date_reported: string;
  date_resolved: string | null;
  cost: number | null;
  expense_id: string | null;
  created_at: string;
  updated_at: string;
}

// Friendly labels for UI rendering of enum values.
export const RENTAL_TYPE_LABELS: Record<RentalType, string> = {
  bedspace: "Bedspace",
  apartment: "Apartment",
  commercial: "Commercial",
  room_rental: "Room Rental",
  short_term: "Short-Term",
};

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  under_repair: "Under Repair",
};
