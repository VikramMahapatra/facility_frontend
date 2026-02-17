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
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/app-toast";
import { useEffect, useState } from "react";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi";
import { OwnershipDialog } from "./OwnershipDialog";
import { Calendar, User, Trash2, AlertTriangle } from "lucide-react";

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
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveClick = (owner: any) => {
    setSelectedOwner(owner);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedOwner || isRemoving) return;

    setIsRemoving(true);
    try {
      // Remove ownership
      const removeResponse = await spacesApiService.removeOwner({
        space_id: spaceId,
        owner_id: selectedOwner.owner_user_id || selectedOwner.user_id,
      });

      if (removeResponse.success) {
        toast.success("Ownership removed successfully");
        setRemoveDialogOpen(false);
        setSelectedOwner(null);
        onRefresh();
      }
    } catch (error) {
      console.error("Error removing ownership:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      {owners.length === 0 && (
        <Alert variant="destructive">
          <AlertTitle>No owner assigned</AlertTitle>
          <AlertDescription>
            This space currently has no owner. Assign owner to continue normal
            operations.
          </AlertDescription>
        </Alert>
      )}

      {owners.map((o) => (
        <Card key={o.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-lg">{o.full_name}</span>
                <Badge variant="secondary">{o.ownership_percentage}%</Badge>
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
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1"
              onClick={() => handleRemoveClick(o)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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

      {/* Remove Ownership Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Ownership
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove owner{" "}
              <span className="font-semibold text-foreground">
                {selectedOwner?.full_name}
              </span>
              ? This will also automatically move out the space.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRemoveDialogOpen(false);
                setSelectedOwner(null);
              }}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveConfirm}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
