import { Users, History, FileText, User, Calendar, Trash2, AlertTriangle } from "lucide-react";
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
import { toast } from "sonner";

interface Tenant {
  id?: string;
  tenant_id?: string;
  full_name: string;
  lease_no?: string;
  status?: "pending" | "assigned";
  start_date?: string;
}

interface Props {
  spaceId: string;
  tenants: {
    pending: any[];
    active: any[];
  };
  onRefresh?: () => void;
}

export default function SpaceTenantSection({ spaceId, tenants, onRefresh }: Props) {
  const navigate = useNavigate();
  const [isTenantHistoryOpen, setIsTenantHistoryOpen] = useState(false);
  const [openTenantAssignmentForm, setOpenTenantAssignmentForm] =
    useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

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

  const handleRemoveClick = (tenant: any) => {
    setSelectedTenant(tenant);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedTenant || isRemoving) return;

    setIsRemoving(true);
    try {
      const tenantId = selectedTenant.tenant_id || selectedTenant.id || selectedTenant.tenantId;
      
      // Remove tenant (this will terminate the active lease)
      const removeResponse = await spacesApiService.removeTenant({
        space_id: spaceId,
        tenant_user_id: tenantId,
      });

      if (removeResponse.success) {
        // Auto move out after removing tenant
        const moveOutResponse = await occupancyApiService.moveOut(spaceId);
        
        if (moveOutResponse.success) {
          toast.success("Tenant removed, lease terminated, and space moved out successfully");
        } else {
          toast.success("Tenant removed and lease terminated successfully");
        }
        
        setRemoveDialogOpen(false);
        setSelectedTenant(null);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(removeResponse.message || "Failed to remove tenant");
      }
    } catch (error) {
      console.error("Error removing tenant:", error);
      toast.error("Failed to remove tenant");
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
          {tenants?.active.length === 0 ? (
            <Alert variant="destructive">
              <AlertTitle>No tenant assigned</AlertTitle>
              <AlertDescription>
                This space currently has no tenant. Assign tenant to continue
                normal operations.
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
                              className="font-semibold text-lg hover:text-primary cursor-pointer transition-colors text-left"
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
