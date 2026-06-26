"use client";

import type { ReactNode } from "react";
import { Boxes } from "lucide-react";

/** Shared visual wrapper for the auth screens. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
      {footer && <div className="mt-4 text-center text-sm">{footer}</div>}
    </div>
  );
}

export function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={
        error
          ? "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          : "rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
      }
    >
      {error ?? success}
    </p>
  );
}
