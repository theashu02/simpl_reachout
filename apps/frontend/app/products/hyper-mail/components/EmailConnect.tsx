"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/lib/store/hooks";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { getEdenClient, type EdenClient } from "@/lib/ApiService/edenClient";

interface ToolsSuggestionsProps {
  closeDialog: () => void;
}

type VerifyMailResponse = {
  success: boolean;
  message: string;
};

const hyperMailApi: EdenClient = getEdenClient();

export default function EmailConnect({ closeDialog }: ToolsSuggestionsProps) {
  const { email } = useAppSelector((state) => state.user);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [useSecure, setUseSecure] = useState(true);

  const verifyMail = useMutation<VerifyMailResponse, Error>({
    mutationFn: async () => {
      const normalizedEmail = (emailAddress || "").trim();
      const normalizedHost = smtpHost.trim();
      const portValue = Number(smtpPort);

      if (!normalizedEmail) {
        throw new Error("Email address is required.");
      }

      if (!password.trim()) {
        throw new Error("Password or app password is required.");
      }

      if (!normalizedHost) {
        throw new Error("SMTP host is required.");
      }

      if (!Number.isFinite(portValue) || portValue <= 0) {
        throw new Error("Enter a valid port number.");
      }

      const { data, error } = await hyperMailApi.api.protected["verify-mail"].post({
        email: normalizedEmail,
        appPassword: password,
        host: normalizedHost,
        port: portValue,
      });

      if (error) {
        const message = (typeof error.value === "object" && error.value && "message" in error.value ? (error.value as { message?: string }).message : null) ?? "Unable to verify credentials.";
        throw new Error(message);
      }

      if (!data?.success) {
        throw new Error(data?.message ?? "Verification failed.");
      }

      return data;
    },
    onSuccess: (result) => {
      toast.success(result.message || "SMTP verified successfully.");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to verify credentials.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      toast.error("Please sign in again to submit a request.");
      return;
    }

    if (verifyMail.isPending) return;
    verifyMail.mutate();
  };

  const handleSecureToggle = (checked: boolean | "indeterminate") => {
    const nextValue = checked === true;
    setUseSecure(nextValue);

    const suggestedPort = nextValue ? "465" : "587";
    if (smtpPort === "465" || smtpPort === "587") {
      setSmtpPort(suggestedPort);
    }
  };

  const isSubmitDisabled = verifyMail.isPending || !emailAddress || !password.trim() || !smtpHost.trim() || !smtpPort.trim();

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-semibold">
          <Mail className="h-5 w-5 text-slate-700" /> Connect Email
        </DialogTitle>
        <DialogDescription>Configure your email provider settings for unified inbox access.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label htmlFor="email-address" className="text-sm font-medium">
            Email Address
          </label>
          <Input id="email-address" placeholder="you@company.com" value={emailAddress} onChange={(event) => setEmailAddress(event.target.value)} disabled={verifyMail.isPending} />
        </div>
        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input id="password" type="password" placeholder="App password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={verifyMail.isPending} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label htmlFor="smtp-host" className="text-sm font-medium">
              SMTP Host
            </label>
            <Input id="smtp-host" placeholder="smtp.gmail.com" value={smtpHost} onChange={(event) => setSmtpHost(event.target.value)} disabled={verifyMail.isPending} required />
          </div>
          <div className="grid gap-2">
            <label htmlFor="smtp-port" className="text-sm font-medium">
              Port
            </label>
            <Input id="smtp-port" type="number" placeholder="465" value={smtpPort} onChange={(event) => setSmtpPort(event.target.value)} disabled={verifyMail.isPending} required />
          </div>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox id="secure-tls" checked={useSecure} onCheckedChange={handleSecureToggle} disabled={verifyMail.isPending} />
          <label htmlFor="secure-tls" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
            Use Secure Connection (TLS)
          </label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={closeDialog} disabled={verifyMail.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitDisabled}>
          {verifyMail.isPending ? "Verifying..." : "Connect Email"}
        </Button>
      </DialogFooter>
    </form>
  );
}
