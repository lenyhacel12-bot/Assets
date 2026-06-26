"use client";

import Link from "next/link";
import { CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/provider";
import { useOptionalSession } from "@/components/providers/session-provider";
import { signOutAction } from "@/app/(auth)/actions";

export function UserMenu() {
  const { t } = useTranslation();
  const session = useOptionalSession();
  const name = session?.profile.full_name || t("shell.account");
  const email = session?.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("shell.account")}
          data-testid="user-menu"
        >
          <CircleUser className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate font-medium">{name}</span>
            {email && (
              <span className="truncate text-xs font-normal text-muted-foreground">
                {email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">{t("shell.profile")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <button type="submit" className="w-full">
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              {t("shell.signOut")}
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
