import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { submitToolSuggestion } from "@/lib/ApiService/HyperMailServerActions/NodeMailAction";

interface ToolsSuggestionsProps {
  closeDialog: () => void;
}

export default function ToolsSuggestions({ closeDialog }: ToolsSuggestionsProps) {
  const { email } = useAppSelector((state) => state.user);
  const [toolName, setToolName] = useState("");
  const [useCase, setUseCase] = useState("");

  const submitRequest = useMutation({
    mutationFn: async () => {
      const result = await submitToolSuggestion({
        email,
        toolName,
        useCase,
      });
      return result;
    },
    onSuccess: () => {
      toast.success("Thanks! We'll review your request.");
      setToolName("");
      setUseCase("");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to submit request");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast.error("Please sign in again to submit a request.");
      return;
    }

    submitRequest.mutate();
  };

  const isSubmitDisabled = !toolName.trim() || !useCase.trim() || submitRequest.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-slate-700" /> Request New Integration
        </DialogTitle>
        <DialogDescription>Let us know which tool you&apos;d like to see next.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <label htmlFor="tool-name" className="text-sm font-medium">
            Tool Name
          </label>
          <Input id="tool-name" placeholder="e.g. Salesforce, Slack..." value={toolName} onChange={(event) => setToolName(event.target.value)} disabled={submitRequest.isPending} required />
        </div>
        <div className="grid gap-2">
          <label htmlFor="use-case" className="text-sm font-medium">
            Use Case
          </label>
          <Input id="use-case" placeholder="How will this help your workflow?" value={useCase} onChange={(event) => setUseCase(event.target.value)} disabled={submitRequest.isPending} required />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={closeDialog}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitDisabled}>
          {submitRequest.isPending ? "Submitting..." : "Submit Request"}
        </Button>
      </DialogFooter>
    </form>
  );
}
