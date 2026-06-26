"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  TextField,
  SelectField,
  CheckboxField,
} from "@/components/data/fields";
import { useTranslation } from "@/i18n/provider";
import type { ActionResult } from "@/app/(app)/suppliers/actions";
import type { Supplier } from "@/lib/types/master";

type FormAction = (prev: ActionResult, fd: FormData) => Promise<ActionResult>;

export function SupplierForm({
  action,
  supplier,
}: {
  action: FormAction;
  supplier?: Supplier;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    {},
  );

  return (
    <form
      action={formAction}
      className="flex max-w-2xl flex-col gap-4 rounded-lg border bg-card p-6"
    >
      <FormMessage error={state.error} />
      <TextField
        name="company_name"
        label={t("supplier.company")}
        defaultValue={supplier?.company_name}
        required
      />
      <SelectField
        name="supplier_type"
        label={t("supplier.type")}
        defaultValue={supplier?.supplier_type ?? "local"}
        options={[
          { value: "local", label: t("supplier.local") },
          { value: "overseas", label: t("supplier.overseas") },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="contact_person"
          label={t("supplier.contactPerson")}
          defaultValue={supplier?.contact_person}
        />
        <TextField
          name="contact_number"
          label={t("supplier.contactNumber")}
          defaultValue={supplier?.contact_number}
        />
        <TextField
          name="email"
          label={t("supplier.email")}
          type="email"
          defaultValue={supplier?.email}
        />
        <TextField
          name="tin"
          label={t("supplier.tin")}
          defaultValue={supplier?.tin}
        />
        <TextField
          name="payment_terms"
          label={t("supplier.paymentTerms")}
          defaultValue={supplier?.payment_terms}
        />
        <TextField
          name="currency_reference"
          label={t("supplier.currency")}
          defaultValue={supplier?.currency_reference}
        />
      </div>
      <TextField
        name="address"
        label={t("supplier.address")}
        defaultValue={supplier?.address}
      />
      <TextField
        name="notes"
        label={t("supplier.notes")}
        defaultValue={supplier?.notes}
      />
      <CheckboxField
        name="is_active"
        label={t("list.active")}
        defaultChecked={supplier ? supplier.is_active : true}
      />
      <div className="flex gap-2">
        <SubmitButton label={t("list.save")} />
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
