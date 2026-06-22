"use client";

import { useMemo, useState, useTransition } from "react";
import type { Location, RentalType, Unit, UnitStatus } from "@/lib/types";
import {
  RENTAL_TYPE_LABELS,
  UNIT_STATUS_LABELS,
  BILLING_CYCLE_LABELS,
} from "@/lib/types";
import { UnitStatusBadge } from "@/components/StatusBadge";
import { Modal, fieldCls, labelCls } from "@/components/Modal";
import { formatPeso } from "@/lib/format";
import { createUnit, updateUnit, deleteUnit } from "./actions";

export type UnitWithLocation = Unit & { location: { name: string } | null };

const RENTAL_TYPES = Object.keys(RENTAL_TYPE_LABELS) as RentalType[];
const STATUSES = Object.keys(UNIT_STATUS_LABELS) as UnitStatus[];
const CYCLES = Object.keys(BILLING_CYCLE_LABELS) as (keyof typeof BILLING_CYCLE_LABELS)[];

export function UnitsView({
  units,
  locations,
  isAdmin,
}: {
  units: UnitWithLocation[];
  locations: Location[];
  isAdmin: boolean;
}) {
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editing, setEditing] = useState<Unit | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      units.filter(
        (u) =>
          (!locationFilter || u.location_id === locationFilter) &&
          (!typeFilter || u.rental_type === typeFilter) &&
          (!statusFilter || u.status === statusFilter),
      ),
    [units, locationFilter, typeFilter, statusFilter],
  );

  function submit(formData: FormData, isEdit: boolean) {
    setError(null);
    startTransition(async () => {
      const res = isEdit ? await updateUnit(formData) : await createUnit(formData);
      if (res.error) setError(res.error);
      else {
        setAdding(false);
        setEditing(null);
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this unit? Related tenants/payments references are affected.")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteUnit(id);
      if (res.error) setError(res.error);
    });
  }

  const canAdd = locations.length > 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Units</h1>
          <p className="text-sm text-charcoal-soft">
            {filtered.length} of {units.length} shown
          </p>
        </div>
        <button
          className="btn-primary disabled:opacity-50"
          onClick={() => setAdding(true)}
          disabled={!canAdd}
          title={canAdd ? undefined : "Add a location first"}
        >
          + Add unit
        </button>
      </div>

      {!canAdd && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Add a location first — units belong to a location.
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-clay-50 px-3 py-2 text-sm text-clay-700">{error}</p>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select className={fieldCls + " sm:w-auto"} value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <select className={fieldCls + " sm:w-auto"} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {RENTAL_TYPES.map((t) => (
            <option key={t} value={t}>{RENTAL_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select className={fieldCls + " sm:w-auto"} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{UNIT_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center text-charcoal-soft">
          {units.length === 0 ? "No units yet." : "No units match these filters."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand-100 text-left text-xs uppercase tracking-wide text-charcoal-soft">
              <tr>
                <th className="px-4 py-3">Unit</th>
                <th className="hidden px-4 py-3 sm:table-cell">Location</th>
                <th className="hidden px-4 py-3 md:table-cell">Type</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-sand-200">
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">{u.name}</div>
                    <div className="text-xs text-charcoal-soft sm:hidden">
                      {u.location?.name} · {RENTAL_TYPE_LABELS[u.rental_type]}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-charcoal-soft sm:table-cell">{u.location?.name ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-charcoal-soft md:table-cell">{RENTAL_TYPE_LABELS[u.rental_type]}</td>
                  <td className="px-4 py-3 text-charcoal">
                    {formatPeso(u.monthly_rate)}
                    <span className="block text-xs text-charcoal-soft">/{BILLING_CYCLE_LABELS[u.billing_cycle].toLowerCase()}</span>
                  </td>
                  <td className="px-4 py-3"><UnitStatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-clay-600 hover:underline" onClick={() => setEditing(u)}>
                      Edit
                    </button>
                    {isAdmin && (
                      <button
                        className="ml-3 text-xs font-medium text-clay-600 hover:underline disabled:opacity-50"
                        onClick={() => remove(u.id)}
                        disabled={pending}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(adding || editing) && (
        <Modal
          title={editing ? "Edit unit" : "Add unit"}
          onClose={() => {
            setAdding(false);
            setEditing(null);
            setError(null);
          }}
        >
          <form action={(fd) => submit(fd, !!editing)} className="space-y-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div>
              <label className={labelCls} htmlFor="location_id">Location</label>
              <select id="location_id" name="location_id" required defaultValue={editing?.location_id ?? ""} className={fieldCls}>
                <option value="" disabled>Select a location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="name">Name / number</label>
              <input id="name" name="name" required placeholder="e.g. Bed 3A, Unit 204" defaultValue={editing?.name ?? ""} className={fieldCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="rental_type">Rental type</label>
                <select id="rental_type" name="rental_type" required defaultValue={editing?.rental_type ?? "bedspace"} className={fieldCls}>
                  {RENTAL_TYPES.map((t) => (
                    <option key={t} value={t}>{RENTAL_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="billing_cycle">Billing cycle</label>
                <select id="billing_cycle" name="billing_cycle" defaultValue={editing?.billing_cycle ?? "monthly"} className={fieldCls}>
                  {CYCLES.map((c) => (
                    <option key={c} value={c}>{BILLING_CYCLE_LABELS[c]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="monthly_rate">Rate (₱)</label>
                <input id="monthly_rate" name="monthly_rate" type="number" min="0" step="0.01" defaultValue={editing?.monthly_rate ?? 0} className={fieldCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue={editing?.status ?? "vacant"} className={fieldCls}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{UNIT_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" rows={2} defaultValue={editing?.notes ?? ""} className={fieldCls} />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
