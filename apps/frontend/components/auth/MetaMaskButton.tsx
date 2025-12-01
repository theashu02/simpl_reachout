"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { BrowserProvider, type Eip1193Provider } from "ethers";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    <Button type="button" variant="outline" className={cn("w-full justify-center items-center gap-2", className)} disabled={loading} onClick={connectAndSign}>
      <Wallet className="size-4" />
      <span>{loading ? "Connecting..." : "Continue with MetaMask"}</span>
    </Button>
  );
}
