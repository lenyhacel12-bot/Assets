"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/provider";

/** Submit button that reflects the enclosing form's pending state. */
export function SubmitButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? t("common.processing") : label}
    </Button>
  );
}
