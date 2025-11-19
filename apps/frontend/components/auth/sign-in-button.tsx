"use client";

import * as React from "react";
import { Github, Globe } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const providerLabels = {
  google: "Continue with Google",
  github: "Continue with GitHub",
} as const;

const providerIcons = {
  google: Globe,
  github: Github,
} as const;

type Provider = keyof typeof providerLabels;

type SignInButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  provider: Provider;
};

export function SignInButton({
  provider,
  children,
  className,
  disabled,
  ...props
}: SignInButtonProps) {
  const [isPending, startTransition] = React.useTransition();
  const Icon = providerIcons[provider];

  const handleSignIn = () => {
    startTransition(() => {
      void signIn(provider, {
        callbackUrl: "/dashboard",
      });
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("w-full justify-center", className)}
      disabled={isPending || disabled}
      onClick={handleSignIn}
      {...props}
    >
      <Icon className="size-4" />
      <span>{children ?? providerLabels[provider]}</span>
    </Button>
  );
}
