"use client";

import { useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/provider";
import { useOptionalSession } from "@/components/providers/session-provider";
import { canViewAllBranches } from "@/lib/auth/permissions";

const ALL = "ALL";

/**
 * Branch selector populated from the branches the user may actually see
 * (RLS-filtered server-side). The "All branches" option is offered only to
 * users with `branches.view_all` (Owner, Accounting, Auditor). Selection is
 * local UI state in Stage 2; later stages use it to scope queries.
 */
export function BranchSelector() {
  const { t } = useTranslation();
  const session = useOptionalSession();
  const branches = session?.branches ?? [];
  const showAll = session ? canViewAllBranches(session.permissions) : false;

  const [selected, setSelected] = useState<string>(
    showAll || branches.length !== 1 ? ALL : branches[0]!.id,
  );

  const currentLabel =
    selected === ALL
      ? t("shell.allBranches")
      : (branches.find((b) => b.id === selected)?.name ??
        t("shell.allBranches"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="branch-selector"
        >
          <Building2 className="size-4" />
          <span className="hidden max-w-32 truncate sm:inline">
            {currentLabel}
          </span>
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{t("shell.branch")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showAll && (
          <DropdownMenuCheckboxItem
            checked={selected === ALL}
            onCheckedChange={() => setSelected(ALL)}
          >
            {t("shell.allBranches")}
          </DropdownMenuCheckboxItem>
        )}
        {branches.map((branch) => (
          <DropdownMenuCheckboxItem
            key={branch.id}
            checked={selected === branch.id}
            onCheckedChange={() => setSelected(branch.id)}
          >
            {branch.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
