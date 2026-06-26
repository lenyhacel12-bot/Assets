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
  type SelectOption,
} from "@/components/data/fields";
import { useTranslation } from "@/i18n/provider";
import type { ActionResult } from "@/app/(app)/customers/actions";
import type { Customer, CustomerCategory } from "@/lib/types/master";
import type { Branch } from "@/lib/types/db";

type FormAction = (prev: ActionResult, fd: FormData) => Promise<ActionResult>;

export function CustomerForm({
  action,
  customer,
  branches,
  categories,
}: {
  action: FormAction;
  customer?: Customer;
  branches: Branch[];
  categories: CustomerCategory[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    {},
  );

  const branchOptions: SelectOption[] = branches.map((b) => ({
    value: b.id,
    label: b.name,
  }));
  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const creditOptions: SelectOption[] = [
    { value: "cash", label: t("customer.cash") },
    { value: "net_15", label: t("customer.net15") },
    { value: "net_30", label: t("customer.net30") },
    { value: "net_45", label: t("customer.net45") },
    { value: "net_60", label: t("customer.net60") },
    { value: "custom", label: t("customer.custom") },
  ];
  const vatOptions: SelectOption[] = [
    { value: "vatable", label: t("product.vatable") },
    { value: "vat_exempt", label: t("product.vatExempt") },
    { value: "zero_rated", label: t("product.zeroRated") },
    { value: "no_vat", label: t("product.noVat") },
  ];

  return (
    <form
      action={formAction}
      className="flex max-w-3xl flex-col gap-4 rounded-lg border bg-card p-6"
    >
      <FormMessage error={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="name"
          label={t("customer.name")}
          defaultValue={customer?.name}
          required
        />
        <SelectField
          name="branch_id"
          label={t("customer.branch")}
          options={branchOptions}
          defaultValue={customer?.branch_id ?? branchOptions[0]?.value}
          required
        />
        <TextField
          name="company_name"
          label={t("customer.company")}
          defaultValue={customer?.company_name}
        />
        <SelectField
          name="category_id"
          label={t("customer.category")}
          options={categoryOptions}
          defaultValue={customer?.category_id}
          includeBlank
        />
        <TextField
          name="contact_person"
          label={t("customer.contactPerson")}
          defaultValue={customer?.contact_person}
        />
        <TextField
          name="contact_number"
          label={t("customer.contactNumber")}
          defaultValue={customer?.contact_number}
        />
        <TextField
          name="email"
          label={t("customer.email")}
          type="email"
          defaultValue={customer?.email}
        />
        <TextField
          name="tin"
          label={t("customer.tin")}
          defaultValue={customer?.tin}
        />
      </div>
      <TextField
        name="billing_address"
        label={t("customer.billingAddress")}
        defaultValue={customer?.billing_address}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          name="credit_terms"
          label={t("customer.creditTerms")}
          options={creditOptions}
          defaultValue={customer?.credit_terms ?? "cash"}
        />
        <TextField
          name="credit_term_days"
          label={t("customer.creditDays")}
          type="number"
          defaultValue={customer?.credit_term_days ?? 0}
        />
        <TextField
          name="credit_limit"
          label={t("customer.creditLimit")}
          type="number"
          step="0.01"
          defaultValue={customer?.credit_limit ?? 0}
        />
        <SelectField
          name="tax_classification"
          label={t("customer.taxClass")}
          options={vatOptions}
          defaultValue={customer?.tax_classification ?? "vatable"}
        />
      </div>
      <TextField
        name="notes"
        label={t("customer.notes")}
        defaultValue={customer?.notes}
      />
      <div className="flex flex-col gap-2">
        <CheckboxField
          name="is_withholding_agent"
          label={t("customer.withholding")}
          defaultChecked={customer?.is_withholding_agent ?? false}
        />
        <CheckboxField
          name="is_active"
          label={t("list.active")}
          defaultChecked={customer ? customer.is_active : true}
        />
      </div>
      <div className="flex gap-2">
        <SubmitButton label={t("list.save")} />
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
