// ===============================
// TenantDialog.tsx
// ===============================

import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { AsyncAutocompleteRQ } from "./common/async-autocomplete-rq";
import { Button } from "./ui/button";
import { toast } from "./ui/app-toast";

// ===============================
export function TenantDialog({
    open,
    onClose,
    spaceId,
    onSuccess,
}: any) {
    const [tenantId, setTenantId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async () => {
        if (!tenantId || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await spacesApiService.assignTenant({
                space_id: spaceId,
                tenant_id: tenantId,
            });

            if (res.success) {
                toast.success("Tenant assigned successfully");
                onSuccess();
            } else {
                toast.error(res?.message || "Failed to assign tenant");
            }
        } catch (error) {
            toast.error("Failed to assign tenant");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Tenant</DialogTitle>
                </DialogHeader>

                <AsyncAutocompleteRQ
                    value={tenantId}
                    onChange={setTenantId}
                    placeholder="Search tenant"
                    queryKey={["tenants"]}
                    queryFn={async (search) => {
                        const res = await tenantsApiService.getTenants(
                            new URLSearchParams({ search: search || "" })
                        );
                        return (res.data?.tenants || res.data || []).map((t: any) => ({
                            id: t.id,
                            label: t.name,
                        }));
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
