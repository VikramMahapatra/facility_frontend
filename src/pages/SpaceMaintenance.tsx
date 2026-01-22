import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
import { Plus, Eye, Edit, Trash2, Calendar, SearchIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { AsyncAutocompleteRQ } from "@/components/common/async-autocomplete-rq";
import { toast } from "sonner";
import { SpaceMaintenanceForm } from "@/components/SpaceMaintenanceForm";
import { ownerMaintenancesApiService } from "@/services/spaces_sites/ownermaintenancesapi";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useLoader } from "@/context/LoaderContext";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "@/context/AuthContext";
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

interface OwnerMaintenance {
  id: string;
  maintenance_no?: string;
  site_id?: string;
  building_block_id?: string;
  space_id?: string;
  space_name?: string;
  owner_name?: string;
  site_name?: string;
  building_name?: string;
  period_start?: string;
  period_end?: string;
  amount?: string | number;
  status?: string;
  invoice_id?: string;
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    case "invoiced":
      return <Badge className="bg-blue-100 text-blue-700">Invoiced</Badge>;
    case "paid":
      return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
    case "waived":
      return <Badge className="bg-purple-100 text-purple-700">Waived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const SpaceMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [items, setItems] = useState<OwnerMaintenance[]>([]);
  const { withLoader } = useLoader();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<OwnerMaintenance | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteMaintenanceId, setDeleteMaintenanceId] = useState<string | null>(
    null,
  );
  const { canRead, canWrite } = useAuth();
  const resource = "spaces";
  const location = useLocation();
  const defaultSpaceId =
    new URLSearchParams(location.search).get("space_id") || "";

  const statusOptions = ["pending", "invoiced", "paid", "waived"];

  const filteredItems =
    selectedStatus === "all"
      ? items
      : items.filter(
          (item) =>
            (item.status || "").toLowerCase() === selectedStatus.toLowerCase(),
        );

  useSkipFirstEffect(() => {
    loadMaintenances();
  }, [page]);

  useEffect(() => {
    updateMaintenancePage();
  }, [searchTerm, selectedSite, selectedStatus]);

  const updateMaintenancePage = () => {
    if (page === 1) {
      loadMaintenances();
    } else {
      setPage(1);
    }
  };

  const loadMaintenances = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    params.append("skip", ((page - 1) * pageSize).toString());
    params.append("limit", pageSize.toString());
    if (selectedSite !== "all" && selectedSite) {
      params.append("site_id", selectedSite);
    }

    const response = await withLoader(async () => {
      return await ownerMaintenancesApiService.getOwnerMaintenances(params);
    });
    if (response?.success) {
      setItems(response.data?.maintenances || []);
      setTotalItems(response.data?.total || 0);
    } else {
      toast.error(response?.message);
    }
  };

  const handleCreate = () => {
    setSelectedMaintenance(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (item: OwnerMaintenance) => {
    setSelectedMaintenance(item);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleView = (item: OwnerMaintenance) => {
    setSelectedMaintenance(item);
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleDelete = (maintenanceId: string) => {
    setDeleteMaintenanceId(maintenanceId);
  };

  const confirmDelete = async () => {
    if (deleteMaintenanceId) {
      const response = await ownerMaintenancesApiService.deleteOwnerMaintenance(
        deleteMaintenanceId,
      );
      if (response?.success) {
        loadMaintenances();
        toast.success("Maintenance deleted successfully");
        setDeleteMaintenanceId(null);
      } else {
        toast.error(response?.message || "Failed to delete maintenance");
      }
    }
  };

  

  const handleSave = async (payload: any) => {
    let response;

    if (!payload.space_id || !payload.start_date || !payload.end_date) {
      toast.error("Space, start date, and end date are required");
      return response;
    }

    const payloadToSave = {
      ...payload,
      period_start: payload.start_date,
      period_end: payload.end_date,
    };
    delete payloadToSave.start_date;
    delete payloadToSave.end_date;

    if (formMode === "create") {
      response =
        await ownerMaintenancesApiService.createOwnerMaintenance(payloadToSave);
      if (response?.success) loadMaintenances();
    } else if (formMode === "edit") {
      response =
        await ownerMaintenancesApiService.updateOwnerMaintenance(payloadToSave);
      if (response?.success) loadMaintenances();
    }

    if (response?.success) {
      setIsFormOpen(false);
      toast.success(
        `Space maintenance has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`,
      );
    }

    return response;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Space Maintenance</CardTitle>
          {canWrite(resource) && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Create Maintenance
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Track maintenance requests by space with billing and status details.
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search maintenance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="w-[180px]">
              <AsyncAutocompleteRQ
                value={selectedSite === "all" ? "" : selectedSite}
                onChange={(value) => {
                  setSelectedSite(value || "all");
                }}
                placeholder="All Sites"
                queryKey={["space-maintenance-sites"]}
                queryFn={async (search) => {
                  const res = await siteApiService.getSiteLookup(search);
                  return res.data.map((s: any) => ({
                    id: s.id,
                    label: s.name,
                  }));
                }}
                fallbackOption={
                  selectedSite === "all"
                    ? {
                        id: "all",
                        label: "All Sites",
                      }
                    : undefined
                }
                minSearchLength={0}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative rounded-md border">
            <ContentContainer>
              <LoaderOverlay />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Maintenance No.</TableHead>
                    <TableHead>Space</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center">
                        No maintenance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.maintenance_no || "-"}
                        </TableCell>
                        <TableCell>{item.space_name || "-"}</TableCell>
                        <TableCell>{item.owner_name || "-"}</TableCell>
                        <TableCell>{item.site_name || "-"}</TableCell>
                        <TableCell>{item.building_name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              <span className="text-sm">
                                {formatDate(item.period_start)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-orange-500" />
                              <span className="text-sm">
                                {formatDate(item.period_end)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.amount ?? "-"}</TableCell>
                        <TableCell>
                          {getStatusBadge(item.status || "-")}
                        </TableCell>
                        <TableCell>{item.invoice_id || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canRead(resource) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {canWrite(resource) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 "
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ContentContainer>
          </div>
        </CardContent>
      </Card>

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      <SpaceMaintenanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
        record={selectedMaintenance as any}
        defaultSpaceId={defaultSpaceId}
      />

      <AlertDialog
        open={!!deleteMaintenanceId}
        onOpenChange={() => setDeleteMaintenanceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Maintenance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this maintenance record? This
              action cannot be undone.
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
};

export default SpaceMaintenance;
