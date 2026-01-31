
import { Users, History } from "lucide-react";
import { useState, useEffect } from "react";
import { TenantHistoryDialog } from "../TenantHistoryDialog";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { OwnershipDialog } from "./OwnershipDialog";

interface Tenant {
  id: string;
  full_name: string;
  lease_no?: string;
  status: "pending" | "assigned";
}

interface Props {
  spaceId: string;
  tenants: {
    pending: any[];
    active: any[];
  };
}

export default function SpaceTenantSection({ spaceId, tenants }: Props) {
  const [isTenantHistoryOpen, setIsTenantHistoryOpen] = useState(false);
  const [openTenantAssignmentForm, setOpenTenantAssignmentForm] = useState(false);



  const approveTenant = async (tenantId: string) => {
    await tenantsApiService.approveTenant(spaceId, tenantId);
    // fetchTenants();
  };

  const rejectTenant = async (tenantId: string) => {
    await tenantsApiService.rejectTenant(spaceId, tenantId);
    // fetchTenants();
  };

  const navigateToOccupancyTab = () => {
    // trigger parent tab change
    const event = new CustomEvent("switchTab", { detail: "occupancy" });
    window.dispatchEvent(event);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Tenant Assignment
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTenantHistoryOpen(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <History className="h-4 w-4" />
              View History
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tenants?.active.length === 0 ? (
            <Alert variant="destructive">
              <AlertTitle>No tenant assigned</AlertTitle>
              <AlertDescription>
                This space currently has no tenant. Assign tenant to continue normal operations.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* {pendingTenants.map((t) => (
                <Card key={t.id} className="p-4 flex justify-between items-center">
                  <p className="font-medium">{t.full_name}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveTenant(t.id)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectTenant(t.id)}>Reject</Button>
                  </div>
                </Card>
              ))
              } */}

              {tenants?.active.map((t) => (
                <Card key={t.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t.full_name}<span></span></p>
                    <p className="text-sm text-muted-foreground">
                      {t.lease_no && `Lease: #${t.lease_no}`}
                    </p>
                  </div>

                </Card>
              ))}
            </>
          )}
          <div className="flex items-center gap-2">
            <Button onClick={() => setOpenTenantAssignmentForm(true)}>Assign / Change Tenant</Button>
          </div>
          <TenantHistoryDialog
            open={isTenantHistoryOpen}
            onClose={() => setIsTenantHistoryOpen(false)}
            spaceId={spaceId!}
          />
          <OwnershipDialog
            open={openTenantAssignmentForm}
            onClose={() => setOpenTenantAssignmentForm(false)}
            spaceId={spaceId}
            onSuccess={() => {
              setOpenTenantAssignmentForm(false);
            }}
            type="tenant"
          />
        </CardContent>

      </Card>

    </>
  );
}
