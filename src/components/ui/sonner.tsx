"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * App-wide toast/notification surface. Wraps `sonner`. Use the `toast()`
 * function from "sonner" anywhere in client code to raise notifications.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group rounded-md border bg-background text-foreground shadow-md",
        },
      }}
    />
  );
}
