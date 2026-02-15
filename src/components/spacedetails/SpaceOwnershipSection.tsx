// ===============================
// SpaceOwnershipSection.tsx
// ===============================
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AsyncAutocompleteRQ } from "@/components/common/async-autocomplete-rq";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { OwnershipDialog } from "./OwnershipDialog";
import { Calendar, User } from "lucide-react";
import { on } from "events";

export function SpaceOwnershipSection({
  spaceId,
  owners,
  onRefresh,
}: {
  spaceId: string;
  owners: any[];
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      {owners.length === 0 && (
        <Alert variant="destructive">
          <AlertTitle>No owner assigned</AlertTitle>
          <AlertDescription>
            This space currently has no owner. Assign owner to continue normal operations.
          </AlertDescription>
        </Alert>
      )}

      {owners.map((o) => (
        <Card key={o.id} className="p-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-lg">{o.full_name}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Since{" "}
                <span className="font-medium text-foreground">
                  {new Date(o.start_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          </div>
          <Badge>{o.ownership_percentage}%</Badge>
        </Card>
      ))}

      <div className="flex items-center gap-2">
        <Button onClick={() => setOpen(true)}>Assign / Change Ownership</Button>
      </div>

      <OwnershipDialog
        open={open}
        onClose={() => setOpen(false)}
        spaceId={spaceId}
        onSuccess={() => {
          setOpen(false);
          onRefresh();
        }}
        type="owner"
      />
    </div>
  );
}
