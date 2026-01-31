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
            <p className="font-medium">{o.full_name}</p>
            <p className="text-sm text-muted-foreground">
              Since {o.start_date}
            </p>
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
        }}
        type="owner"
      />
    </div>
  );
}
