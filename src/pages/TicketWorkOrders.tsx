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
import { TicketWorkOrderForm } from "@/components/TicketWorkOrderForm";
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
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { ticketWorkOrderApiService } from "@/services/ticketing_service/ticketworkorderapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";

interface TicketWorkOrder {
  id: string;
  ticket_id: string;
  ticket_no?: string;
  description: string;
  assigned_to: string;
  assigned_to_name?: string;
  staff_name?: string;
  vendor_name?: string;
  site_name?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  is_deleted?: boolean;
}

interface TicketWorkOrderOverview {
  total_work_orders: number;
  pending: number;
  in_progress: number;
  completed: number;
}

export default function TicketWorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [workOrders, setWorkOrders] = useState<TicketWorkOrder[]>([]);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteWorkOrderId, setDeleteWorkOrderId] = useState<string | null>(
    null
  );
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<
    TicketWorkOrder | undefined
  >();
  const [workOrderOverview, setWorkOrderOverview] =
    useState<TicketWorkOrderOverview>({
      total_work_orders: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
    });

  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const resource = "tickets";
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);

  useEffect(() => {
    loadSiteLookup();
    loadFilterStatusLookup();
  }, []);

  useSkipFirstEffect(() => {
    loadTicketWorkOrders();
    loadTicketWorkOrderOverview();
  }, [page]);

  useEffect(() => {
    updateWorkOrderPage();
  }, [searchTerm, selectedSite, selectedStatus]);

  const updateWorkOrderPage = () => {
    if (page === 1) {
      loadTicketWorkOrders();
      loadTicketWorkOrderOverview();
    } else {
      setPage(1);
    }
  };

  const loadSiteLookup = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response?.success) setSiteList(response.data || []);
  };

  const loadFilterStatusLookup = async () => {
    const response = await ticketWorkOrderApiService.getFilterStatusLookup();
    if (response?.success) setStatusList(response.data || []);
  };

  const loadTicketWorkOrderOverview = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all")
      params.append("site_id", selectedSite);
    if (selectedStatus && selectedStatus !== "all")
      params.append("status", selectedStatus);

    const response = await withLoader(async () => {
      return await ticketWorkOrderApiService.getTicketWorkOrderOverview(params);
    });

    if (response?.success) setWorkOrderOverview(response.data || {});
  };

  const loadTicketWorkOrders = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all")
      params.append("site_id", selectedSite);
    if (selectedStatus && selectedStatus !== "all")
      params.append("status", selectedStatus);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await ticketWorkOrderApiService.getTicketWorkOrders(params);
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

  const handleEdit = (workOrder: TicketWorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleView = (workOrder: TicketWorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleDelete = (workOrderId: string) => {
    setDeleteWorkOrderId(workOrderId);
  };

  const confirmDelete = async () => {
    if (deleteWorkOrderId) {
      const response = await ticketWorkOrderApiService.deleteTicketWorkOrder(
        deleteWorkOrderId
      );

      if (response.success) {
        updateWorkOrderPage();
        setDeleteWorkOrderId(null);
        toast.success("Ticket work order has been deleted successfully.");
      }
    }
  };

  const handleSave = async (workOrderData: Partial<TicketWorkOrder>) => {
    let response;

    if (formMode === "create") {
      response = await ticketWorkOrderApiService.addTicketWorkOrder(
        workOrderData
      );

      if (response.success) updateWorkOrderPage();
    } else if (formMode === "edit" && selectedWorkOrder) {
      const updatedWorkOrder = {
        ...selectedWorkOrder,
        ...workOrderData,
      };

      response = await ticketWorkOrderApiService.updateTicketWorkOrder(
        updatedWorkOrder.id,
        workOrderData
      );

      if (response.success) {
        setWorkOrders((prev) =>
          prev.map((wo) => (wo.id === updatedWorkOrder.id ? response.data : wo))
        );
      }
    }

    if (response?.success) {
      setIsFormOpen(false);
      toast.success(
        `Ticket work order has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "In Progress";
      case "PENDING":
        return "Pending";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
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
              <h1 className="text-lg font-semibold">Ticket Work Orders</h1>
            </div>
          </div>

          <div className="flex-1 space-y-6 p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sidebar-primary">
                  Ticket Work Orders
                </h2>
                <p className="text-muted-foreground">
                  Manage work orders generated from service tickets
                </p>
              </div>
              {canWrite(resource) && (
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Work Order
                </Button>
              )}
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
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
                >
                  <option value="all">All Sites</option>
                  {siteList.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
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
                          {workOrderOverview.total_work_orders}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Pending
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {workOrderOverview.pending}
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
                        <CardTitle className="text-sm font-medium">
                          Completed
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {workOrderOverview.completed}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Work Orders Table */}
                  <div className="relative rounded-md border min-h-[200px]">
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle>Ticket Work Orders</CardTitle>
                        <CardDescription>
                          Work orders generated from service tickets
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ticket ID</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Assigned To (Staff)</TableHead>
                              <TableHead>Assigned To (Vendor)</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created At</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workOrders.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center text-muted-foreground h-32"
                                >
                                  No ticket work orders found
                                </TableCell>
                              </TableRow>
                            ) : (
                              workOrders.map((workOrder) => (
                                <TableRow key={workOrder.id}>
                                  <TableCell className="font-medium">
                                    {workOrder.ticket_no || workOrder.ticket_id}
                                  </TableCell>
                                  <TableCell className="max-w-md">
                                    {workOrder.description}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <User className="w-4 h-4 mr-2" />

                                      {workOrder.assigned_to_name ||
                                        "Unassigned"}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <User className="w-4 h-4 mr-2" />
                                      {/* Backend sends vendors in assigned_to_name for now */}
                                      {workOrder.vendor_name || "Unassigned"}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
                                        workOrder.status
                                      )}`}
                                    >
                                      {getStatusLabel(workOrder.status)}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      {new Date(
                                        workOrder.created_at
                                      ).toLocaleDateString()}
                                    </div>
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
                                      {canWrite(resource) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEdit(workOrder)}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                      )}
                                      {canDelete(resource) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-destructive hover:text-destructive"
                                          onClick={() =>
                                            handleDelete(workOrder.id!)
                                          }
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
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
      <TicketWorkOrderForm
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
            <AlertDialogTitle>Delete Ticket Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket work order? This
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
    </SidebarProvider>
  );
}
