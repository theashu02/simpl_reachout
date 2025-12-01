"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { BackendResponse, GetUserData } from "@/lib/ApiService/HyperMailServerActions/userData";

export function BackendAuthProbe() {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BackendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callBackend = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await GetUserData();

      if (response.status >= 400) {
        throw new Error(response.data.message ?? "Backend rejected the request");
      }

      setResult(response.data);
    }

    catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setResult(null);
    }

    finally {
      setLoading(false);
    }
  };

  const disabled = status !== "authenticated" || loading;

  return (
    <div className="space-y-3 rounded-lg border border-dashed p-4">
      <div>
        <p className="text-sm font-semibold">Backend Verification</p>
        <p className="text-sm text-muted-foreground">
          Calls the Bun backend through a server action.
        </p>
      </div>

      <Button onClick={callBackend} disabled={disabled}>
        {loading ? "Contacting backend..." : "Call backend microservice"}
      </Button>

      {result && (
        <pre className="max-h-60 overflow-auto bg-muted p-3 text-xs rounded-md">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
