import { Users, History, FileText, User, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TenantHistoryDialog } from "./TenantHistoryDialog";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { OwnershipDialog } from "./OwnershipDialog";
import { Badge } from "../ui/badge";

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
}

export default function SpaceTenantSection({ spaceId, tenants }: Props) {
  const navigate = useNavigate();
  const [isTenantHistoryOpen, setIsTenantHistoryOpen] = useState(false);
  const [openTenantAssignmentForm, setOpenTenantAssignmentForm] =
    useState(false);

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
                    className="p-4 flex justify-between items-center"
                  >
                    {/* LEFT: Name + Start Date */}
                    <div>
                      <div className="flex items-center gap-2">
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

                    {/* RIGHT: Lease */}
                    {t.lease_no && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 whitespace-nowrap"
                      >
                        <FileText className="h-3 w-3" />#{t.lease_no}
                      </Badge>
                    )}
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
            }}
            type="tenant"
          />
        </CardContent>
      </Card>
    </>
  );
}
