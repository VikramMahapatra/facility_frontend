// app/(your-path)/Leases.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search, Plus, Eye, Edit, Trash2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaseForm } from "@/components/LeasesForm";
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
import { toast } from "@/components/ui/app-toast";
import { Pagination } from "@/components/Pagination";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import { Lease, LeaseOverview } from "@/interfaces/leasing_tenants_interface";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useSettings } from "@/context/SettingsContext";

export default function Leases() {
  const navigate = useNavigate();
  const { systemCurrency } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");

  const [leases, setLeases] = useState<Lease[]>([]);
  const [selectedLease, setSelectedLease] = useState<Lease | undefined>();
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteLeaseId, setDeleteLeaseId] = useState<string | null>(null);
  const [siteList, setSiteList] = useState<any[]>([]);
  const { canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();

  const resource = "leases"; // must match resource name from backend policies

  const [leaseOverview, setLeaseOverview] = useState<LeaseOverview>({
    activeLeases: 0,
    monthlyRentValue: 0,
    expiringSoon: 0,
    avgLeaseTermMonths: 0,
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadLeases();
    loadLeaseOverview();
  }, [page]);

  useSkipFirstEffect(() => {
    updateLeasePage();
  }, [searchTerm, selectedSite, selectedStatus]);

  useEffect(() => {
    (async () => {
      const lookup = await siteApiService.getSiteLookup();
      if (lookup.success) setSiteList(lookup.data || []);
    })();
  }, []);

  const updateLeasePage = () => {
    if (page === 1) {
      loadLeases();
      loadLeaseOverview();
    } else {
      setPage(1);
    }
  };

  const loadLeaseOverview = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite) params.append("site_id", selectedSite);
    if (selectedStatus) params.append("status", selectedStatus);

    const response = await leasesApiService.getLeaseOverview(params);
    if (response.success) setLeaseOverview(response.data || {});
  };

  const loadLeases = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite) params.append("site_id", selectedSite);
    if (selectedStatus) params.append("status", selectedStatus);
    params.append("skip", String(skip));
    params.append("limit", String(limit));

    const response = await withLoader(async () => {
      return await leasesApiService.getLeases(params);
    });

    if (response?.success) {
      setLeases(response.data?.leases || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const handleCreate = () => {
    setSelectedLease(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleView = (lease: Lease) => {
    navigate(`/leases/${lease.id}`);
  };

  const handleEdit = (lease: Lease) => {
    setSelectedLease(lease);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDelete = (leaseId: string) => setDeleteLeaseId(leaseId);

  const confirmDelete = async () => {
    if (!deleteLeaseId) return;
    const response = await leasesApiService.deleteLease(deleteLeaseId);
    if (response.success) {
      const authResponse = response.data;
      if (authResponse?.success) {
        setLeases((prev) => prev.filter((l) => l.id !== deleteLeaseId));
        toast.success("The lease has been removed successfully.");
        setDeleteLeaseId(null);
        updateLeasePage();
      } else {
        toast.error(
          `Cannot Delete Lease\n${authResponse?.message || "Unknown error"}`,
          {
            style: { whiteSpace: "pre-line" },
          } as any,
        );
      }
    }
  };

  const handleSave = async (leaseData: Partial<Lease>) => {
    let response;
    if (formMode === "create") {
      response = await leasesApiService.addLease(leaseData);

      if (response.success) {
        updateLeasePage();

        // Extract leaseId from response
        const leaseId =
          response.data?.id ||
          response.data?.data?.id ||
          response.data?.lease_id;

        if (leaseId) {
          // Close lease form
          setIsFormOpen(false);
        }
      }
    } else if (formMode === "edit" && selectedLease) {
      const updated = {
        ...selectedLease,
        ...leaseData,
      };
      response = await leasesApiService.updateLease(updated);

      if (response.success) {
        loadLeaseOverview();
        setLeases((prev) =>
          prev.map((lease) =>
            lease.id === selectedLease.id ? response.data : lease,
          ),
        );
      }
    }

    if (response?.success) {
      if (formMode === "edit") {
        setIsFormOpen(false);
      }
      toast.success(
        `Lease has been ${formMode === "create" ? "created" : "updated"
        } successfully.`,
      );
    }
    return response;
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      expired: "bg-gray-100 text-gray-800",
      terminated: "bg-red-100 text-red-800",
      draft: "bg-yellow-100 text-yellow-800",
    };
    return colors[status || ""] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (val?: number) => {
    if (val == null) return "-";
    return systemCurrency.format(val);
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-sidebar-primary">
              All Leases
            </h2>
            <p className="text-muted-foreground">Manage lease agreements</p>
          </div>
          {canWrite(resource) && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Lease
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>

          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {siteList.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ContentContainer>
          <LoaderOverlay />
          {/* Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-sidebar-primary">
                  {leaseOverview.activeLeases}
                </div>
                <p className="text-sm text-muted-foreground">Active Leases</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(leaseOverview.monthlyRentValue)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Monthly Rent Value
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {leaseOverview.expiringSoon}
                </div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {leaseOverview.avgLeaseTermMonths < 12
                    ? `${leaseOverview.avgLeaseTermMonths.toFixed(0)} months`
                    : `${(leaseOverview.avgLeaseTermMonths / 12).toFixed(
                      1,
                    )} years`}
                </div>
                <p className="text-sm text-muted-foreground">Avg Lease Term</p>
              </CardContent>
            </Card>
          </div>

          {/* Grid */}
          <div className="grid gap-4 mt-6">
            {leases.map((lease) => (
              <Card
                key={lease.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        <span
                          className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                          onClick={() =>
                            navigate(`/tenants/${lease.tenant_id}/view`)
                          }
                        >
                          {lease.tenant_name}
                        </span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span
                            className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                            onClick={() =>
                              navigate(`/spaces/${lease.space_id}`)
                            }
                          >
                            {lease.space_name}
                          </span>{" "}
                          • {lease.site_name}
                        </div>
                      </p>
                    </div>
                    <Badge className={getStatusColor(lease.status)}>
                      {lease.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground">
                        Rent Amount
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-lg font-bold">
                          {!lease.rent_amount || Number(lease.rent_amount) === 0
                            ? "-"
                            : formatCurrency(lease.rent_amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lease.frequency?.toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">
                        Lease Term
                      </div>
                      <div className="text-sm">
                        {`${lease.start_date} - ${lease.end_date}`}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground">
                        Deposit
                      </div>
                      <div>
                        {!lease.deposit_amount ||
                          Number(lease.deposit_amount) === 0
                          ? "-"
                          : formatCurrency(lease.deposit_amount as any)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">
                        CAM Rate
                      </div>
                      <div>
                        {!lease.cam_rate || Number(lease.cam_rate) === 0
                          ? "-"
                          : lease.cam_rate && Number(lease.cam_rate) !== 0
                            ? `₹${lease.cam_rate}/sq ft`
                            : "-"}
                      </div>
                    </div>
                  </div>

                  {lease.utilities &&
                    Object.values(lease.utilities).some(
                      (v) => v !== null && v !== undefined && v !== "",
                    ) && (
                      <div>
                        <div className="font-medium text-muted-foreground">
                          Utilities
                        </div>
                        <div className="text-sm">
                          {Object.entries(lease.utilities)
                            .filter(
                              ([_, v]) =>
                                v !== null && v !== undefined && v !== "",
                            )
                            .map(([k, v]) => (
                              <span key={k} className="mr-4 capitalize">
                                {k}: {String(v)}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(lease)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {canWrite(resource) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(lease)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {canDelete(resource) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(lease.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage) => setPage(newPage)}
          />

          {leases.length === 0 && (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-sidebar-primary mb-2">
                No leases found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or add a new lease.
              </p>
            </div>
          )}
        </ContentContainer>
      </div>
      <LeaseForm
        lease={selectedLease}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog
        open={!!deleteLeaseId}
        onOpenChange={() => setDeleteLeaseId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lease</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lease? This action cannot be
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
    </div>
  );
}
