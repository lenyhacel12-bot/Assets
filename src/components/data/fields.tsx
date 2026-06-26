"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  required,
  hint,
  step,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  hint?: string;
  step?: string;
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint}>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue ?? ""}
      />
    </Field>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  includeBlank,
  required,
}: {
  name: string;
  label: string;
  options: SelectOption[];
  defaultValue?: string | null;
  includeBlank?: boolean;
  required?: boolean;
}) {
  return (
    <Field label={label} htmlFor={name}>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {includeBlank && <option value="">—</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4"
      />
      {label}
    </label>
  );
}
