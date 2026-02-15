// ===============================
// OwnershipDialog.tsx

import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { useState } from "react";
import { toast } from "../ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { AsyncAutocompleteRQ } from "../common/async-autocomplete-rq";
import { Button } from "../ui/button";//

// ===============================
export function OwnershipDialog({
    open,
    onClose,
    spaceId,
    onSuccess,
    type
}: any) {
    const [ownerId, setOwnerId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async () => {
        if (!ownerId || isSubmitting) return;

        setIsSubmitting(true);
        try {
            let res = null;
            if (type == "owner") {
                res = await spacesApiService.assignOwner({
                    space_id: spaceId,
                    owner_user_id: ownerId,
                    ownership_percentage: 100,
                });


            }
            else if (type == "tenant") {
                res = await spacesApiService.assignTenant({
                    space_id: spaceId,
                    tenant_user_id: ownerId,
                });
            }

            if (res.success) {
                toast.success(`${type == "owner" ? "Ownership" : "Tenant"} assigned successfully`);
                onSuccess();
            }

        } catch (error) {
            toast.error("Failed to assign ownership/tenant");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign {type == "owner" ? "Ownership" : "Tenant"}</DialogTitle>
                </DialogHeader>

                <AsyncAutocompleteRQ
                    value={ownerId}
                    onChange={setOwnerId}
                    placeholder="Search user"
                    queryKey={["users"]}
                    queryFn={async (search) => {
                        const res = await spacesApiService.searchUsers(search);
                        return res.data.map((u: any) => ({ id: u.id, label: u.name }));
                    }}
                />

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={isSubmitting}>
                        {isSubmitting ? "Assigning..." : "Confirm"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}