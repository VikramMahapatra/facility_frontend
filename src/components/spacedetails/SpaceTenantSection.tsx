import { Users, History, FileText, User, Calendar, Trash2, AlertTriangle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TenantHistoryDialog } from "./TenantHistoryDialog";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { OwnershipDialog } from "./OwnershipDialog";
import { Badge } from "../ui/badge";
import { toast } from "@/components/ui/app-toast";
import { LeaseForm } from "../LeasesForm";
import { Lease } from "@/interfaces/leasing_tenants_interface";
import { useLoader } from "@/context/LoaderContext";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import { Space } from "@/interfaces/spaces_interfaces";

interface Tenant {
  id?: string;
  tenant_id?: string;
  full_name: string;
  lease_no?: string;
  status?: "pending" | "assigned";
  start_date?: string;
}

interface Props {
  space: Space;
  tenants: {
    pending: any[];
    active: any[];
  };
  onRefresh?: () => void;
}

export default function SpaceTenantSection({ space, tenants, onRefresh }: Props) {
  const navigate = useNavigate();
  const [isTenantHistoryOpen, setIsTenantHistoryOpen] = useState(false);
  const [openTenantAssignmentForm, setOpenTenantAssignmentForm] =
    useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLeaseFormOpen, setIsLeaseFormOpen] = useState(false);
  const [prefilledLeaseData, setPrefilledLeaseData] =
    useState<Partial<Lease> | null>(null);
  const { withLoader } = useLoader();
  const spaceId: string = space.id;
  const approveTenant = async (tenantId: string) => {
    await tenantsApiService.approveTenant(spaceId, tenantId);
    // fetchTenants();
  };

  const rejectTenant = async (tenantId: string) => {
    await tenantsApiService.rejectTenant(spaceId, tenantId);
    // fetchTenants();
  };

  const handleRemoveClick = (tenant: any) => {
    setSelectedTenant(tenant);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedTenant || isRemoving) return;

    setIsRemoving(true);
    try {
      const tenantUserId = selectedTenant.user_id;

      // Remove tenant (this will terminate the active lease)
      const removeResponse = await spacesApiService.removeTenant({
        space_id: spaceId,
        tenant_user_id: tenantUserId,
      });

      if (removeResponse.success) {
        // Auto move out after removing tenant
        toast.success("Tenant removed, lease terminated, and space moved out successfully");
        setRemoveDialogOpen(false);
        setSelectedTenant(null);
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error removing tenant:", error);
    } finally {
      setIsRemoving(false);
    }
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
          {(!tenants?.active.length && !tenants?.pending.length) ? (
            <Alert variant="destructive">
              <AlertTitle>No tenant assigned</AlertTitle>
              <AlertDescription>
                This space currently has no tenant. Assign a tenant to begin leasing
                and manage occupancy for this space.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {tenants?.pending?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Pending Setup
                  </p>

                  {tenants.pending.map((t) => (
                    <Card key={t.id} className="p-4 border-dashed bg-muted/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{t.full_name}</p>

                          <p className="text-xs text-muted-foreground">
                            Tenant assigned • Lease not created yet
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              // Fetch tenant lease details
                              if (t.tenant_id) {
                                const response = await withLoader(
                                  async () => {
                                    return await leasesApiService.getTenantLeaseDetail(
                                      t.tenant_id,
                                      spaceId
                                    );
                                  }
                                );
                                if (
                                  response?.success &&
                                  response.data?.tenant_data?.length > 0
                                ) {
                                  const tenantData =
                                    response.data.tenant_data[0];
                                  setPrefilledLeaseData({
                                    tenant_id: t.tenant_id,
                                    site_id: tenantData.site_id,
                                    site_name: tenantData.site_name,
                                    building_id: tenantData.building_id,
                                    building_name:
                                      tenantData.building_name,
                                    space_id: space.id, // Use the space from the card
                                    space_name: space.name,
                                  } as Lease);
                                } else {
                                  // If no data, set tenant_id and space_id
                                  setPrefilledLeaseData({
                                    tenant_id: t.tenant_id,
                                    space_id: space.id,
                                    space_name: space.name,
                                  } as Lease);
                                }
                              }
                              setIsLeaseFormOpen(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Lease
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveClick(t)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {tenants?.active.map((t) => {
                const tenantId =
                  (t as any).tenant_id || t.id || (t as any).tenantId;
                return (
                  <Card
                    key={tenantId || t.full_name}
                    className="p-4"
                  >
                    <div className="flex justify-between items-start">
                      {/* LEFT: Name + Start Date */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {tenantId ? (
                            <button
                              onClick={() =>
                                navigate(`/tenants/${tenantId}/view`)
                              }
                              className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline text-lg"
                            >
                              {t.full_name}
                            </button>
                          ) : (
                            <span className="font-semibold text-lg">
                              {t.full_name}
                            </span>
                          )}
                          {t.lease_no && (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 whitespace-nowrap"
                            >
                              <FileText className="h-3 w-3" />#{t.lease_no}
                            </Badge>
                          )}
                        </div>

                        {t.start_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              Since{" "}
                              <span className="font-medium text-foreground">
                                {new Date(t.start_date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* RIGHT: Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1"
                        onClick={() => handleRemoveClick(t)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </>
          )}
          <div className="flex items-center gap-2">
            <Button onClick={() => setOpenTenantAssignmentForm(true)}>
              Assign / Change Tenant
            </Button>
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
              if (onRefresh) {
                onRefresh();
              }
            }}
            type="tenant"
          />

          {/* Lease Form */}
          <LeaseForm
            lease={prefilledLeaseData ? (prefilledLeaseData as Lease) : undefined}
            isOpen={isLeaseFormOpen}
            disableLocationFields={true}
            onClose={() => {
              setIsLeaseFormOpen(false);
              setPrefilledLeaseData(null);
            }}
            onSave={async (leaseData: FormData) => {
              const response = await withLoader(async () => {
                return await leasesApiService.addLease(leaseData);
              });
              if (response?.success) {
                setIsLeaseFormOpen(false);
                setPrefilledLeaseData(null);
                toast.success(`Lease has been created successfully.`);
                onRefresh();
              }
              return response;
            }}
            mode="create"
          />

          {/* Remove Tenant Confirmation Dialog */}
          <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Remove Tenant
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  This will terminate the active lease by removing tenant{" "}
                  <span className="font-semibold text-foreground">
                    {selectedTenant?.full_name}
                  </span>
                  . Are you sure you want to remove?
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRemoveDialogOpen(false);
                    setSelectedTenant(null);
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
                  {isRemoving ? "Removing..." : "Remove Tenant"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}
