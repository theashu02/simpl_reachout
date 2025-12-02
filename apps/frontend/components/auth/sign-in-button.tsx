"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn, GithubLogo, googleLogo } from "@/lib/utils";

const providerConfig = {
  google: {
    label: "Continue with Google",
    logo: googleLogo,
    styleClass: "hover:border-blue-600 hover:text-white after:bg-blue-600",
    imgClass: "",
  },
  github: {
    label: "Continue with GitHub",
    logo: GithubLogo,
    styleClass: "hover:border-primary hover:text-primary-foreground after:bg-primary",
    imgClass: "group-hover:invert",
  },
} as const;

type Provider = keyof typeof providerConfig;

type SignInButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  provider: Provider;
};

export function SignInButton({ provider, children, className, disabled, ...props }: SignInButtonProps) {
  const [isPending, startTransition] = React.useTransition();
  const config = providerConfig[provider];

  const handleSignIn = () => {
    startTransition(() => {
      void signIn(provider, {
        callbackUrl: "/products",
      });
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "relative w-full justify-center items-center gap-2 overflow-hidden group",
        "transition-colors duration-300",
        "after:absolute after:inset-y-0 after:left-0 after:z-0 after:w-0 after:transition-all after:duration-500 after:ease-out",
        "hover:after:w-full",
        config.styleClass,
        className
      )}
      disabled={isPending || disabled}
      onClick={handleSignIn}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Image src={config.logo} alt={`${provider} logo`} width={20} height={20} className={cn("object-contain transition-all duration-300", config.imgClass)} />
        <span className="font-medium">{children ?? config.label}</span>
      </div>
    </Button>
  );
}
