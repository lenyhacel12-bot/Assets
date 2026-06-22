"use client";

import { useState, useTransition } from "react";
import type { Location } from "@/lib/types";
import { Modal, fieldCls, labelCls } from "@/components/Modal";
import { createLocation, updateLocation, deleteLocation } from "./actions";

export function LocationsView({
  locations,
  isAdmin,
}: {
  locations: Location[];
  isAdmin: boolean;
}) {
  const [editing, setEditing] = useState<Location | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData, isEdit: boolean) {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await updateLocation(formData)
        : await createLocation(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setAdding(false);
        setEditing(null);
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this location? Its units and related records are removed too.")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteLocation(id);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Locations</h1>
          <p className="text-sm text-charcoal-soft">{locations.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => setAdding(true)}>
          + Add location
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-clay-50 px-3 py-2 text-sm text-clay-700">{error}</p>
      )}

      {locations.length === 0 ? (
        <div className="card text-center text-charcoal-soft">
          No locations yet. Add your first site to start creating units.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {locations.map((loc) => (
            <div key={loc.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-charcoal">{loc.name}</h3>
                  {loc.address && (
                    <p className="text-sm text-charcoal-soft">{loc.address}</p>
                  )}
                </div>
              </div>
              {loc.notes && <p className="mt-2 text-sm text-charcoal-soft">{loc.notes}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  className="btn-secondary px-3 py-1.5 text-xs"
                  onClick={() => setEditing(loc)}
                >
                  Edit
                </button>
                {isAdmin && (
                  <button
                    className="px-3 py-1.5 text-xs font-medium text-clay-600 hover:underline disabled:opacity-50"
                    onClick={() => remove(loc.id)}
                    disabled={pending}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(adding || editing) && (
        <Modal
          title={editing ? "Edit location" : "Add location"}
          onClose={() => {
            setAdding(false);
            setEditing(null);
            setError(null);
          }}
        >
          <form
            action={(fd) => submit(fd, !!editing)}
            className="space-y-4"
          >
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div>
              <label className={labelCls} htmlFor="name">Name</label>
              <input id="name" name="name" required defaultValue={editing?.name ?? ""} className={fieldCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="address">Address</label>
              <input id="address" name="address" defaultValue={editing?.address ?? ""} className={fieldCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" rows={3} defaultValue={editing?.notes ?? ""} className={fieldCls} />
            </div>
            <div className="flex justify-end gap-2">
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
