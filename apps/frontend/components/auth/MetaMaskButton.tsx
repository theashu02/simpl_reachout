"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { BrowserProvider, type Eip1193Provider } from "ethers";
import { cn, MetaMaskLogo } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function MetaMaskButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const connectAndSign = async () => {
    if (!window.ethereum) {
      toast.warning("Please install MetaMask!");
      return;
    }
    setLoading(true);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      const message = `Sign in to Simplx with address: ${address}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      const result = await signIn("credentials", {
        address,
        signature,
        redirect: false,
        callbackUrl: "/products",
      });

      if (result?.error) {
        console.error("Login failed:", result.error);
        toast.error("Authentication failed");
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("MetaMask error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("relative w-full justify-center items-center gap-2 overflow-hidden group font-gist","transition-colors duration-300", "hover:border-[#FFA680] hover:text-gray-900", "after:absolute after:inset-y-0 after:left-0 after:z-0 after:w-0 after:transition-all after:duration-500 after:ease-out", "hover:after:w-full", "after:bg-[#FFA680]", className)}
      disabled={loading}
      onClick={connectAndSign}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Image src={MetaMaskLogo} alt={`metamask logo`} width={30} height={30} className="object-contain" />
        <span>{loading ? "Connecting..." : "Continue with MetaMask"}</span>
      </div>
    </Button>
  );
}
