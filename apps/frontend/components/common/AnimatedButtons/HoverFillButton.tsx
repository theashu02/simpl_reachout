"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface HoverFillButtonProps {
  text: string;
  colorClass: string;
}

const HoverFillButton: React.FC<HoverFillButtonProps> = ({ text, colorClass }) => {
  const [isPending, startTransition] = React.useTransition();

  const handleSignOut = () => {
    startTransition(() => {
      void signOut({ callbackUrl: "/" });
    });
  };

  // Determine a solid color based on gradient input
  const getSolidColor = (gradientClass: string): string => {
    if (gradientClass.includes("emerald")) return "bg-emerald-300";
    if (gradientClass.includes("blue")) return "bg-blue-300";
    if (gradientClass.includes("orange")) return "bg-orange-300";
    if (gradientClass.includes("purple")) return "bg-purple-300";
    return "bg-[#ccff00]";
  };

  const solidColor = getSolidColor(colorClass);

  return (
    <Button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={`
        group flex w-full items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-full 
        cursor-pointer transition-all duration-500 hover:gap-0 
        ${isPending ? "opacity-70 cursor-not-allowed" : ""}
      `}
    >
      {/* Left Pill (Text) */}
      <div
        className={`
          ${solidColor} text-[#1a1a1a] px-5 py-2.5 rounded-full font-semibold text-sm
          transition-all duration-500 group-hover:rounded-r-none group-hover:pr-4 w-full text-start tracking-widest
        `}
      >
        {isPending ? "Signing out..." : text}
      </div>

      {/* Right Circle (Icon) */}
      <div
        className={`
          ${solidColor} text-[#1a1a1a] p-2.5 rounded-full transition-all duration-500 
          group-hover:rounded-l-none group-hover:pl-4
        `}
      >
        <ArrowRight size={20} />
      </div>
    </Button>
  );
};

export default HoverFillButton;
