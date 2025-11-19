"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick">;

export function SignOutButton({
  children,
  className,
  disabled,
  variant = "ghost",
  ...props
}: SignOutButtonProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleSignOut = () => {
    startTransition(() => {
      void signOut({ callbackUrl: "/" });
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={cn("justify-center", className)}
      disabled={isPending || disabled}
      onClick={handleSignOut}
      {...props}
    >
      <LogOut className="size-4" />
      <span>{children ?? "Sign out"}</span>
    </Button>
  );
}
