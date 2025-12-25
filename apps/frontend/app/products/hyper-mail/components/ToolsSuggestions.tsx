import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/lib/store/hooks";
import { Plus } from "lucide-react";

interface ToolsSuggestionsProps {
  closeDialog: () => void;
}

export default function ToolsSuggestions({ closeDialog }: ToolsSuggestionsProps) {
  const { email } = useAppSelector((state) => state.user);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-slate-700" /> Request New Integration
        </DialogTitle>
        <DialogDescription>Let us know which tool you&apos;d like to see next.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label htmlFor="tool-name" className="text-sm font-medium">
            Tool Name
          </label>
          <Input id="tool-name" placeholder="e.g. Salesforce, Slack..." />
        </div>
        <div className="grid gap-2">
          <label htmlFor="use-case" className="text-sm font-medium">
            Use Case
          </label>
          <Input id="use-case" placeholder="How will this help your workflow?" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={closeDialog}>
          Cancel
        </Button>
        <Button type="submit">Submit Request</Button>
      </DialogFooter>
    </>
  );
}
