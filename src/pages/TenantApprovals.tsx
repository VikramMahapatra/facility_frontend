import { useEffect, useState } from "react";
import { Check, X, Eye, Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LeaseForm } from "@/components/LeasesForm";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import { Lease } from "@/interfaces/leasing_tenants_interface";

type TenantApproval = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  phone: string;
  space_id: string;
  space_name: string;
  site_name: string;
  requested_at: string;
  status: "pending" | "approved" | "rejected";
};

export default function TenantApprovalPage() {
  const navigate = useNavigate();
  const { withLoader } = useLoader();

  const [tenants, setTenants] = useState<TenantApproval[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("pending");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showAddLeaseDialog, setShowAddLeaseDialog] = useState(false);
  const [approvedTenantId, setApprovedTenantId] = useState<string | null>(null);
  const [isLeaseFormOpen, setIsLeaseFormOpen] = useState(false);
  const [prefilledLeaseData, setPrefilledLeaseData] =
    useState<Partial<Lease> | null>(null);

  useSkipFirstEffect(() => {
    fetchTenants();
  }, [page]);

  useEffect(() => {
    updateTenantsPage();
  }, [status, search]);

  const updateTenantsPage = () => {
    if (page === 1) {
      fetchTenants();
    } else {
      setPage(1);
    }
  };

  const fetchTenants = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await tenantsApiService.getTenantApprovals(params);
    });

    if (response?.success) {
      setTenants(response.data?.items || response.data || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const approveTenant = async (spaceId: string, tenantId: string) => {
    const response = await withLoader(async () => {
      return await tenantsApiService.approveTenant(spaceId, tenantId);
    });

    if (response?.success) {
      toast.success("Tenant approved successfully.");
      setApprovedTenantId(tenantId);
      setShowAddLeaseDialog(true);
      fetchTenants();
    } else {
      const errorMessage =
        response?.data?.message ||
        response?.message ||
        "Failed to approve tenant";
      toast.error(errorMessage);
    }
  };

  const rejectTenant = async (spaceId: string, tenantId: string) => {
    const response = await withLoader(async () => {
      return await tenantsApiService.rejectTenant(spaceId, tenantId);
    });

    if (response?.success) {
      toast.success("Tenant rejected successfully.");
      fetchTenants();
    } else {
      const errorMessage =
        response?.data?.message ||
        response?.message ||
        "Failed to reject tenant";
      toast.error(errorMessage);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "leased":
        return <Badge className="bg-green-600">Leased</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Tenant Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage tenant space requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tenant name / phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="leased">Leased</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <ContentContainer>
        <LoaderOverlay />
        <Card>
          <CardHeader />
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Space</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tenants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No tenant requests found
                    </TableCell>
                  </TableRow>
                )}

                {tenants.map((tenant) => {
                  return (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="font-medium">{tenant.tenant_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {tenant.phone}
                        </div>
                      </TableCell>

                      <TableCell>{tenant.space_name}</TableCell>
                      <TableCell>{tenant.site_name}</TableCell>
                      <TableCell>
                        {new Date(tenant.requested_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{statusBadge(tenant.status)}</TableCell>

                      <TableCell className="text-right space-x-2">
                        {tenant.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                approveTenant(tenant.space_id, tenant.tenant_id)
                              }
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                rejectTenant(tenant.space_id, tenant.tenant_id)
                              }
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/spaces/${tenant.space_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </ContentContainer>

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      {/* Add Lease Dialog */}
      <AlertDialog
        open={showAddLeaseDialog}
        onOpenChange={setShowAddLeaseDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Lease?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to add a lease for this tenant?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowAddLeaseDialog(false);
                setApprovedTenantId(null);
              }}
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowAddLeaseDialog(false);
                // Fetch tenant lease details
                if (approvedTenantId) {
                  const response = await withLoader(async () => {
                    return await leasesApiService.getTenantLeaseDetail(
                      approvedTenantId,
                    );
                  });
                  if (
                    response?.success &&
                    response.data?.tenant_data?.length > 0
                  ) {
                    const tenantData = response.data.tenant_data[0];
                    setPrefilledLeaseData({
                      tenant_id: approvedTenantId,
                      site_id: tenantData.site_id,
                      site_name: tenantData.site_name,
                      building_id: tenantData.building_id,
                      building_name: tenantData.building_name,
                      space_id: tenantData.space_id,
                      space_name: tenantData.space_name,
                    } as Lease);
                  } else {
                    // If no data, just set tenant_id
                    setPrefilledLeaseData({
                      tenant_id: approvedTenantId,
                    } as Lease);
                  }
                }
                setIsLeaseFormOpen(true);
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lease Form */}
      <LeaseForm
        lease={prefilledLeaseData ? (prefilledLeaseData as Lease) : undefined}
        isOpen={isLeaseFormOpen}
        disableLocationFields={true}
        onClose={() => {
          setIsLeaseFormOpen(false);
          setApprovedTenantId(null);
          setPrefilledLeaseData(null);
        }}
        onSave={async (leaseData: Partial<Lease>) => {
          const response = await withLoader(async () => {
            return await leasesApiService.addLease(leaseData);
          });

          if (response?.success) {
            setIsLeaseFormOpen(false);
            setApprovedTenantId(null);
            setPrefilledLeaseData(null);
            toast.success(`Lease has been created successfully.`);
            fetchTenants();
          } else if (response && !response.success) {
            if (response?.message) {
              toast.error(response.message);
            } else {
              toast.error("Failed to create lease.");
            }
          }
          return response;
        }}
        mode="create"
      />
    </div>
  );
}
