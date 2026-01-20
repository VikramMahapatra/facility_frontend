// ===============================
// SpaceOwnershipSection.tsx
// ===============================
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AsyncAutocompleteRQ } from "@/components/common/async-autocomplete-rq";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { OwnershipDialog } from "./OwnershipDialog";

export function SpaceOwnershipSection({ spaceId }: { spaceId: string }) {
    const [owners, setOwners] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    const loadOwners = async () => {
        const res = await spacesApiService.getActiveOwners(spaceId);
        if (res.success) setOwners(res.data || []);
    };

    useEffect(() => {
        loadOwners();
    }, [spaceId]);

    return (
        <div className="space-y-4">
            {owners.length === 0 && (
                <Alert variant="destructive">
                    <AlertTitle>No owner assigned</AlertTitle>
                    <AlertDescription>
                        This space currently has no owner. Assign ownership to continue normal operations.
                    </AlertDescription>
                </Alert>
            )}

            {owners.map((o) => (
                <Card key={o.id} className="p-4 flex justify-between items-center">
                    <div>
                        <p className="font-medium">{o.owner_name}</p>
                        <p className="text-sm text-muted-foreground">
                            Since {o.start_date}
                        </p>
                    </div>
                    <Badge>{o.ownership_percentage}%</Badge>
                </Card>
            ))}

            <Button onClick={() => setOpen(true)}>Assign / Change Ownership</Button>

            <OwnershipDialog
                open={open}
                onClose={() => setOpen(false)}
                spaceId={spaceId}
                onSuccess={() => {
                    loadOwners();
                    setOpen(false);
                }}
            />
        </div>
    );
}



// // ===============================
// // SpaceEditPage.tsx
// // ===============================
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { SpaceForm } from "./SpaceForm";
// import { spaceApiService } from "@/services/spaces_sites/spacesapi";

// export function SpaceEditPage() {
//     const { spaceId } = useParams();
//     const navigate = useNavigate();
//     const [space, setSpace] = useState<any>(null);

//     useEffect(() => {
//         if (!spaceId) return;
//         spaceApiService.getSpaceById(spaceId).then((res) => {
//             if (res.success) setSpace(res.data);
//         });
//     }, [spaceId]);

//     if (!space) return <div className="p-6">Loading...</div>;

//     return (
//         <SpaceForm
//             space={space}
//             mode="edit"
//             isOpen={true}
//             onClose={() => navigate(`/spaces/${spaceId}`)}
//             onSave={async (payload) => {
//                 const res = await spaceApiService.updateSpace(spaceId!, payload);
//                 if (res.success) navigate(`/spaces/${spaceId}`);
//                 return res.data;
//             }}
//         />
//     );
// }
