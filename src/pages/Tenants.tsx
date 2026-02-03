import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { PropertySidebar } from "@/components/PropertySidebar";
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
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import {
  Tenant,
  TenantOverview,
  Lease,
} from "@/interfaces/leasing_tenants_interface";
import { LeaseForm } from "@/components/LeasesForm";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { toast } from "sonner";
import { Pagination } from "@/components/Pagination";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { PageHeader } from "@/components/PageHeader";
import { TenantForm } from "@/components/TenantForm";

const Tenants = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const navigate = useNavigate();
  const [deleteTenantId, setDeleteTenantId] = useState<string | null>(null);
  const [tenantOverview, setTenantOverview] = useState<TenantOverview>({
    totalTenants: 0,
    activeTenants: 0,
    commercialTenants: 0,
    individualTenants: 0,
  });
  const [statusList, setStatusList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [siteList, setSiteList] = useState([]);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const [isLeaseFormOpen, setIsLeaseFormOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [prefilledLeaseData, setPrefilledLeaseData] =
    useState<Partial<Lease> | null>(null);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  const resource = "tenants"; // must match resource name from backend policies

  useSkipFirstEffect(() => {
    loadTenants();
    loadTenantOverview();
  }, [page]);

  useEffect(() => {
    loadStatusLookup();
    loadTypeLookup();
    loadSiteLookup();
  }, []);

  useEffect(() => {
    updateTenantPage();
  }, [searchTerm, selectedSite, selectedStatus, selectedType]);

  const updateTenantPage = () => {
    if (page === 1) {
      loadTenants();
      loadTenantOverview();
    } else {
      setPage(1); // triggers the page effect
    }
  };

  const loadTenantOverview = async () => {
    const response = await tenantsApiService.getTenantOverview();
    if (response.success) setTenantOverview(response.data || {});
  };

  const loadStatusLookup = async () => {
    const lookup = await tenantsApiService.getTenantStatusLookup();
    if (lookup.success) setStatusList(lookup.data || []);
  };

  const loadTypeLookup = async () => {
    const lookup = await tenantsApiService.getTenantTypeLookup();
    if (lookup.success) setTypeList(lookup.data || []);
  };

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadTenants = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all")
      params.append("site_id", selectedSite);
    if (selectedStatus && selectedStatus !== "all")
      params.append("status", selectedStatus);
    if (selectedType && selectedType !== "all")
      params.append("type", selectedType);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await tenantsApiService.getTenants(params);
    });

    if (response?.success) {
      setTenants(response.data?.tenants || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const handleCreate = () => {
    setSelectedTenant(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleView = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.id}/view`);
  };

  const handleDelete = (tenantId: string) => {
    setDeleteTenantId(tenantId);
  };

  const confirmDelete = async () => {
    if (deleteTenantId) {
      const response = await tenantsApiService.deleteTenant(deleteTenantId);

      if (response.success) {
        const authResponse = response.data;
        if (authResponse?.success) {
          // Success - refresh data
          await loadTenants();
          await loadTenantOverview();
          setDeleteTenantId(null);
          toast.success("The tenant has been removed successfully.");
        } else {
          // Show error popup from backend
          toast.error(
            `Cannot Delete Tenant\n${authResponse?.message || "Unknown error"}`,
            {
              style: { whiteSpace: "pre-line" },
            },
          );
        }
      }
    }
  };

  const handleSave = async (tenantData: Partial<Tenant>) => {
    let response;
    if (formMode === "create") {
      response = await tenantsApiService.addTenant(tenantData);
      console.log("Created tenant data ", tenantData);
      if (response.success) updateTenantPage();
    } else if (formMode === "edit" && selectedTenant) {
      const updatedTenant = {
        ...selectedTenant,
        ...tenantData,
        updated_at: new Date().toISOString(),
      };
      response = await tenantsApiService.updateTenant(updatedTenant);

      if (response.success) {
        // FIX: Update with response.data instead of updatedTenant
        loadTenantOverview();
        setTenants((prev) =>
          prev.map((t) => (t.id === response.data.id ? response.data : t)),
        );
      }
    }

    if (response?.success) {
      setIsFormOpen(false);
      toast.success(
        `Tenant ${tenantData.name} has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`,
      );
    }
    return response;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTenantTypeColor = (type: string) => {
    switch (type) {
      case "individual":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "commercial":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "merchant":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "brand":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "kiosk":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantOverview.totalTenants}
            </div>
            <p className="text-xs text-muted-foreground">
              All registered tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Tenants
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tenantOverview.activeTenants}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commercial</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantOverview.commercialTenants}
            </div>
            <p className="text-xs text-muted-foreground">Business tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residential</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantOverview.individualTenants}
            </div>
            <p className="text-xs text-muted-foreground">Residential tenants</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {siteList.map((site: any) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
          {canWrite(resource) && (
            <Button size="sm" onClick={() => handleCreate()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          )}
        </div>
      </div>

      <ContentContainer>
        <LoaderOverlay />
        {/* Tenants Grid */}
        <div className="grid gap-6">
          {tenants.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No tenants match your current filters. Try adjusting your
                  search criteria.
                </p>
                {canWrite(resource) && (
                  <Button onClick={() => handleCreate()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Tenant
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            tenants.map((tenant) => {
              const tenantLeases = tenant.tenant_leases || [];
              const tenantSpaces = tenant.tenant_spaces || [];

              return (
                <Card
                  key={tenant.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {tenant.name}
                          <div className="flex gap-2">
                            <Badge className={getTenantTypeColor(tenant.kind)}>
                              {tenant.kind}
                            </Badge>
                            {tenant.kind === "commercial" &&
                              "type" in tenant && (
                                <Badge
                                  className={getTenantTypeColor(tenant.type)}
                                >
                                  {tenant.type}
                                </Badge>
                              )}
                          </div>
                        </CardTitle>
                        <CardDescription>
                          {tenantSpaces.slice(0, 2).map((tenant_space) => {
                            const isSpaceStatus =
                              tenant_space.status == "approved" ||
                              tenant_space.status == "leased"
                                ? "active"
                                : tenant_space.status == "pending"
                                  ? "inactive"
                                  : "suspended";
                            return (
                              <>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  {[
                                    tenant_space.space_name,
                                    tenant_space.building_block_name,
                                    tenant_space.site_name,
                                  ]
                                    .filter(Boolean)
                                    .join(" • ")}
                                  <div className="text-muted-foreground">
                                    <Badge
                                      className={getStatusColor(isSpaceStatus)}
                                    >
                                      {tenant_space.status}
                                    </Badge>
                                  </div>
                                </div>
                              </>
                            );
                          })}
                          {tenantSpaces.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{tenantSpaces.length - 2} more space
                              {tenantSpaces.length - 2 !== 1 ? "s" : ""}
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Contact Information */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium">
                          Contact Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{tenant.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{tenant.phone}</span>
                          </div>
                          {tenant.contact_info?.address &&
                            (tenant.contact_info.address.line1 ||
                              tenant.contact_info.address.city ||
                              tenant.contact_info.address.state ||
                              tenant.contact_info.address.pincode) && (
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  {tenant.contact_info.address.line1 && (
                                    <div>
                                      {tenant.contact_info.address.line1}
                                    </div>
                                  )}
                                  {tenant.contact_info.address.line2 && (
                                    <div>
                                      {tenant.contact_info.address.line2}
                                    </div>
                                  )}
                                  {(tenant.contact_info.address.city ||
                                    tenant.contact_info.address.state ||
                                    tenant.contact_info.address.pincode) && (
                                    <div>
                                      {[
                                        tenant.contact_info.address.city,
                                        tenant.contact_info.address.state,
                                        tenant.contact_info.address.pincode,
                                      ]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Lease Information */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Active Leases</div>
                        {tenantLeases.length > 0 ? (
                          <div className="space-y-2">
                            {tenantLeases.slice(0, 2).map((lease) => (
                              <div
                                key={lease.id}
                                className="p-2 bg-muted rounded text-sm"
                              >
                                <div className="font-medium">
                                  <span
                                    className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                                    onClick={() =>
                                      navigate(`/leases/${lease.id}`)
                                    }
                                  >
                                    #{lease.lease_number}
                                  </span>{" "}
                                  - {lease.space_name}
                                </div>
                                <div className="text-muted-foreground">
                                  ₹{lease.rent_amount.toLocaleString()} •{" "}
                                  {lease.frequency}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(
                                    lease.start_date,
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    lease.end_date,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                            {tenantLeases.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{tenantLeases.length - 2} more lease
                                {tenantLeases.length - 2 !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              No active leases
                            </div>
                            {canWrite(resource) && tenantSpaces.length > 0 && tenant.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  setSelectedTenantId(tenant.id!);
                                  // Fetch tenant lease details
                                  const response = await withLoader(
                                    async () => {
                                      return await leasesApiService.getTenantLeaseDetail(
                                        tenant.id!,
                                        tenantSpaces[0].space_id,
                                      );
                                    },
                                  );
                                  if (
                                    response?.success &&
                                    response.data?.tenant_data?.length > 0
                                  ) {
                                    const tenantData =
                                      response.data.tenant_data[0];
                                    setPrefilledLeaseData({
                                      tenant_id: tenantData.tenant_id,
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
                                      tenant_id: tenant.id!,
                                    } as Lease);
                                  }
                                  setIsLeaseFormOpen(true);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                Add Lease
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {tenant.kind === "commercial" &&
                      "contact_info" in tenant && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-1">
                            Business Contact
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tenant.contact_info.name} •{" "}
                            {tenant.contact_info.email}
                          </div>
                        </div>
                      )}
                  </CardContent>
                  <div className="flex items-center justify-end gap-2 px-6 pb-4 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(tenant)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canWrite(resource) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tenant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete(resource) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(tenant.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </ContentContainer>
      <AlertDialog
        open={!!deleteTenantId}
        onOpenChange={() => setDeleteTenantId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tenant? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <TenantForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
        tenant={selectedTenant}
        onSave={handleSave}
      />
      <LeaseForm
        lease={prefilledLeaseData ? (prefilledLeaseData as Lease) : undefined}
        isOpen={isLeaseFormOpen}
        disableLocationFields={true}
        onClose={() => {
          setIsLeaseFormOpen(false);
          setSelectedTenantId(null);
          setPrefilledLeaseData(null);
        }}
        onSave={async (leaseData: Partial<Lease>) => {
          const response = await withLoader(async () => {
            return await leasesApiService.addLease(leaseData);
          });
          if (response?.success) {
            setIsLeaseFormOpen(false);
            setSelectedTenantId(null);
            toast.success(`Lease has been created successfully.`);
            // Reload tenants data to show the new lease
            await loadTenants();
            await loadTenantOverview();
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
};
export default Tenants;
