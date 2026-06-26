"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/provider";

interface ToggleResult {
  error?: string;
  success?: string;
}

/**
 * Activate/deactivate button. The entity-specific server action is passed in,
 * so this stays generic across products/customers/suppliers.
 */
export function ActiveToggle({
  id,
  isActive,
  action,
}: {
  id: string;
  isActive: boolean;
  action: (id: string, active: boolean) => Promise<ToggleResult>;
}) {
  const { t } = useTranslation();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await action(id, !isActive);
      if (res.error) toast.error(res.error);
      else toast.success(res.success ?? "");
    });
  }

  return (
    <Button
      variant={isActive ? "ghost" : "secondary"}
      size="sm"
      disabled={pending}
      onClick={toggle}
    >
      {isActive ? t("list.deactivate") : t("list.activate")}
    </Button>
  );
}
