"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

type BackendResponse = {
  status?: string;
  message?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
  };
};

export function BackendAuthProbe() {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BackendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callBackend = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/backend/profile", {
        method: "GET",
        cache: "no-store",
      });
      const payload: BackendResponse = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Backend rejected the request.");
      }

      setResult(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setResult(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const disabled = status !== "authenticated" || loading;

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border/70 p-4">
      <div>
        <p className="text-sm font-semibold">Backend verification</p>
        <p className="text-sm text-muted-foreground">
          Calls the Bun microservice with your NextAuth session token. Only authenticated users receive a successful response.
        </p>
      </div>
      <Button onClick={callBackend} disabled={disabled}>
        {loading ? "Contacting backend..." : "Call backend microservice"}
      </Button>
      {result && (
        <pre className="max-h-60 overflow-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {status !== "authenticated" && (
        <p className="text-xs text-muted-foreground">
          Sign in first to enable the call.
        </p>
      )}
    </div>
  );
}
