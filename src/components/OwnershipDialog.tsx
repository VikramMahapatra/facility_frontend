// ===============================
// OwnershipDialog.tsx

import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { useState } from "react";
import { toast } from "./ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { AsyncAutocompleteRQ } from "./common/async-autocomplete-rq";
import { Button } from "./ui/button";

// ===============================
export function OwnershipDialog({
    open,
    onClose,
    spaceId,
    onSuccess,
}: any) {
    const [ownerId, setOwnerId] = useState<string>("");

    const submit = async () => {
        if (!ownerId) return;

        const res = await spacesApiService.assignOwner({
            space_id: spaceId,
            owner_user_id: ownerId,
            ownership_percentage: 100,
        });

        if (res.success) {
            toast.success("Ownership updated");
            onSuccess();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Ownership</DialogTitle>
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
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={submit}>Confirm</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}