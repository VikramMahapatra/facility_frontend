import { useState, useEffect } from "react";
import {
  Wrench,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Play,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { WorkOrderForm } from "@/components/WorkorderForm";
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
import { toast } from "sonner";
import { Pagination } from "@/components/Pagination";
import { workOrderApiService } from "@/services/maintenance_assets/workorderapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { vendorsApiService } from "@/services/pocurments/vendorsapi";
import { WorkOrder, WorkOrderOverview } from "@/interfaces/assets_interface";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
  
export default function WorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedSpace, setSelectedSpace] = useState<string>("all");
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteWorkOrderId, setDeleteWorkOrderId] = useState<string | null>(
    null
  );
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<
    WorkOrder | undefined
  >();
  const [workOrderOverview, setWorkOrderOverview] = useState<WorkOrderOverview>(
    {
      total: 0,
      open: 0,
      in_progress: 0,
      overdue: 0,
    }
  );
  const [statusList, setStatusList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [spaceList, setSpaceList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const resource = "work_orders"; 
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  useSkipFirstEffect(() => {
    loadWorkOrders();
    loadWorkOrderOverview();
  }, [page]);

  useEffect(() => {
    loadStatusLookup();
    loadPriorityLookup();
    loadSpaceLookup();
    loadVendorLookup();
  }, []);

  useEffect(() => {
    updateWorkOrderPage();
  }, [
    searchTerm,
    selectedSite,
    selectedStatus,
    selectedPriority,
  ]);

  useEffect(() => {
    if (selectedSite !== "all") {
      loadSpaceLookup();
    } else {
      setSpaceList([]);
      setSelectedSpace("all");
    }
  }, [selectedSite]);

  const updateWorkOrderPage = () => {
    if (page === 1) {
      loadWorkOrders();
      loadWorkOrderOverview();
    } else {
      setPage(1); // triggers the page effect
    }
  };

  const loadWorkOrderOverview = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all")
      params.append("site_id", selectedSite);
    if (selectedStatus && selectedStatus !== "all")
      params.append("status", selectedStatus);
    if (selectedPriority && selectedPriority !== "all")
      params.append("priority", selectedPriority);
    
    const response = await withLoader(async () => {
      return await workOrderApiService.getWorkOrderOverview(params);
    });
    
    if (response?.success) setWorkOrderOverview(response.data || {});
  };

  const loadStatusLookup = async () => {
    const lookup = await workOrderApiService.getWorkOrderStatusFilterLookup();
    if (lookup.success) setStatusList(lookup.data || []);
  };

  const loadPriorityLookup = async () => {
    const lookup = await workOrderApiService.getWorkOrderPriorityFilterLookup();
    if (lookup.success) setPriorityList(lookup.data || []);
  };

  const loadSpaceLookup = async () => {
    const lookup = await spacesApiService.getSpaceLookup("all");
    if (lookup.success) setSpaceList(lookup.data || []);
  };

  const loadVendorLookup = async () => {
    const vendors = await vendorsApiService.getVendorLookup().catch(() => [] as any[]);
    if (Array.isArray(vendors)) {
      setVendorList(vendors);
    } else if (vendors?.success) {
      setVendorList(vendors.data || []);
    } else {
      setVendorList([]);
    }
  };

  const getSpaceName = (spaceId: string) => {
    if (!spaceId || spaceId === "No Location") return "No Location";
    const space = spaceList.find((s: any) => s.id === spaceId);
    return space ? space.name : spaceId;
  };

  const getVendorName = (vendorId: string) => {
    if (!vendorId || vendorId === "Unassigned") return "Unassigned";
    const vendor = vendorList.find((v: any) => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  const loadWorkOrders = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all")
      params.append("site_id", selectedSite);
    if (selectedStatus && selectedStatus !== "all")
      params.append("status", selectedStatus);
    if (selectedPriority && selectedPriority !== "all")
      params.append("priority", selectedPriority);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await workOrderApiService.getWorkOrders(params);
    });

    if (response?.success) {
      setWorkOrders(response.data?.work_orders || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  // Form handlers
  const handleCreate = () => {
    setSelectedWorkOrder(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleView = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleDelete = (workOrderId: string) => {
    setDeleteWorkOrderId(workOrderId);
  };

  const confirmDelete = async () => {
    if (deleteWorkOrderId) {
      const response = await workOrderApiService.deleteWorkOrder(deleteWorkOrderId);
      if (response?.success) {
        const authResponse = response.data;
        if (authResponse?.success) {
          // Success - refresh data
          updateWorkOrderPage();
          setDeleteWorkOrderId(null);
          toast.success("The work order has been removed successfully.");
        } else {
          // Show error popup from backend
          toast.error(`Cannot Delete Work Order\n${authResponse?.message || "Unknown error"}`, {
            style: { whiteSpace: "pre-line" },
          });
        }
      }
    }
  };

  const handleSave = async (workOrderData: Partial<WorkOrder>) => {
    let response;
    if (formMode === "create") {
      response = await workOrderApiService.addWorkOrder(workOrderData);

      if (response.success)
        updateWorkOrderPage();
    } else if (formMode === "edit" && selectedWorkOrder) {
      const updatedWorkOrder = {
        ...selectedWorkOrder,
        ...workOrderData,
        updated_at: new Date().toISOString(),
      };
      response = await workOrderApiService.updateWorkOrder(selectedWorkOrder.id, updatedWorkOrder);

      if (response.success) {
        // Update the edited work order in local state
        setWorkOrders((prev) =>
          prev.map((wo) => (wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo))
        );
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast.success(
        `Work order ${workOrderData.title} has been ${formMode === "create" ? "created" : "updated"} successfully.`
      );
    }
    return response;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Work Orders</h1>
            </div>
          </div>

          <div className="flex-1 space-y-6 p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sidebar-primary">
                  Work Orders
                </h2>
                <p className="text-muted-foreground">
                  Manage maintenance tasks and work orders
                </p>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Work Order
              </Button>
            </div>

            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search work orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
                >
                  <option value="all">All Status</option>
                  {statusList.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
                >
                  <option value="all">All Priority</option>
                  {priorityList.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content with Loader - Stats Cards and Table */}
              <ContentContainer>
                <LoaderOverlay />
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Work Orders
                        </CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {workOrderOverview.total}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {workOrderOverview.open}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          In Progress
                        </CardTitle>
                        <Play className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {workOrderOverview.in_progress}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {workOrderOverview.overdue}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Work Orders Table */}
                  <div className="relative rounded-md border min-h-[200px]">
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle>Work Orders</CardTitle>
                        <CardDescription>
                          Manage maintenance tasks and assignments
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Work Order</TableHead>
                              <TableHead>Asset/Location</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Assigned To</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workOrders.map((workOrder) => (
                              <TableRow key={workOrder.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{workOrder.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                      #{workOrder.wo_no || workOrder.id}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {workOrder.asset_name || "No Asset"}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {getSpaceName(workOrder.space_id) || "No Location"}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{workOrder.type}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      workOrder.priority === "critical"
                                        ? "destructive"
                                        : workOrder.priority === "high"
                                          ? "destructive"
                                          : workOrder.priority === "medium"
                                            ? "default"
                                            : "secondary"
                                    }
                                  >
                                    {workOrder.priority}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    {getVendorName(workOrder.assigned_to || "Unassigned")}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {workOrder.due_at
                                      ? new Date(workOrder.due_at).toLocaleDateString()
                                      : "No Due Date"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      workOrder.status === "completed"
                                        ? "default"
                                        : workOrder.status === "in_progress"
                                          ? "secondary"
                                          : "outline"
                                    }
                                  >
                                    {workOrder.status.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleView(workOrder)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {canWrite(resource) && <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(workOrder)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    }
                                    {canDelete(resource) && <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => handleDelete(workOrder.id!)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                    }
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      onPageChange={setPage}
                    />
                  </div>
                </div>
              </ContentContainer>
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Work Order Form Dialog */}
      <WorkOrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
        workOrder={selectedWorkOrder}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteWorkOrderId}
        onOpenChange={() => setDeleteWorkOrderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work order? This action
              cannot be undone.
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
    </SidebarProvider>
  );
}
