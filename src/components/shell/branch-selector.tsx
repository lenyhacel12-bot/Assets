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

/**
 * Placeholder branch selector. The real branch list and visibility rules
 * (Owner/Accounting see all; branch staff see only assigned) are seeded and
 * enforced via RLS in Stage 2. Selection here is local UI state only.
 */
const BRANCHES = [
  { code: "ALL", labelKey: "shell.allBranches" },
  { code: "MNL", labelKey: "branches.mnl" },
  { code: "CEB", labelKey: "branches.ceb" },
  { code: "PAM", labelKey: "branches.pam" },
  { code: "ANT", labelKey: "branches.ant" },
] as const;

export function BranchSelector() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>("ALL");

  const current = BRANCHES.find((b) => b.code === selected) ?? BRANCHES[0];

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
          <span className="hidden sm:inline">{t(current.labelKey)}</span>
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{t("shell.branch")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {BRANCHES.map((branch) => (
          <DropdownMenuCheckboxItem
            key={branch.code}
            checked={selected === branch.code}
            onCheckedChange={() => setSelected(branch.code)}
          >
            {t(branch.labelKey)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
