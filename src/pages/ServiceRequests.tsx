import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Edit, FileText, Clock, AlertTriangle, TrendingUp } from "lucide-react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/Pagination";
import { serviceRequestApiService } from "@/services/maintenance_assets/servicerequestapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { set } from "date-fns";
import { useAuth } from "../context/AuthContext";

export type ServiceRequestPriority = "low" | "medium" | "high" | "urgent";
export type ServiceRequestStatus   = "open" | "in_progress" | "on_hold" | "resolved" | "closed" | "cancelled";
export type ServiceRequestChannel  = "portal" | "email" | "phone" | "walkin" | "api";
export type ServiceRequesterKind   = "resident" | "merchant" | "guest" | "staff" | "other";
export type Category = "Maintenance" | "Housekeeping" | "Security" | "Utilities" | string;

export interface ServiceRequest {
  id?: string;
  sr_no?: string;
  org_id?: string;
  site_id: string;
  space_id?: string | null;
  requester_kind: ServiceRequesterKind;
  requester_id?: string | null;
  category?: Category | null;
  channel: ServiceRequestChannel;
  description?: string | null;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  sla?: any | null;
  linked_work_order_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ServiceRequestOverview {
  total_requests: number;
  open_requests: number;
  in_progress_requests: number;
  avg_resolution_hours: number;
}

export default function ServiceRequest() {
  const { toast } = useToast();

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // dynamic lookup options (filter endpoints return strings)
  const [statusOptions, setStatusOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // data
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest[]>([]);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<ServiceRequest | undefined>();
  const [serviceRequestOverview, setServiceRequestOverview] = useState<ServiceRequestOverview>({
    total_requests: 0,
    open_requests: 0,
    in_progress_requests: 0,
    avg_resolution_hours: 0,
  });

  // ui state
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteServiceRequestId, setDeleteServiceRequestId] = useState<string | null>(null);

  // paging
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const { canRead, canWrite, canDelete } = useAuth();
  const resource = "service_requests";

  useSkipFirstEffect(() => {
    loadServiceRequest();
    loadServiceRequestOverView();
  }, [page]);

  useEffect(() => {
    updateServiceRequestPage();
  }, [searchTerm, selectedStatus, selectedCategory]);

  useEffect(() => {
    loadServiceRequestStatusLookup();
    loadServiceRequestCategoryLookup();
  }, []);

  const updateServiceRequestPage = () => {
    if (page === 1) {
      loadServiceRequest();
      loadServiceRequestOverView();
    } else {
      setPage(1);
    }
  };
  
  const loadServiceRequestOverView = async () => {
   const params =new URLSearchParams();
   if (searchTerm) params.append("search", searchTerm);
   if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
   if (selectedStatus && selectedStatus !== "all") params.append("status", selectedStatus);
   const response = await serviceRequestApiService.getServiceRequestOverview(params);
   setServiceRequestOverview(response);
   };
  

    const loadServiceRequest = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;



   const params = new URLSearchParams();
   if (searchTerm) params.append("search", searchTerm);
   if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
   if (selectedStatus && selectedStatus !== "all") params.append("status", selectedStatus);
    params.append("skip", skip.toString());
    params.append("limit",limit.toString());
    const response = await serviceRequestApiService.getServiceRequests(params);
    setServiceRequest(response.requests);
    setTotalItems(response.total);
  };


   

    

  // LOOKUPS (FILTER variants for the list page)
  const loadServiceRequestStatusLookup = async () => {
    const lookup = await serviceRequestApiService.getServiceRequestStatusFilterLookup();
    setStatusOptions(lookup)
  };

  const loadServiceRequestCategoryLookup = async () => {
    const lookup = await serviceRequestApiService.getServiceRequestCategoryFilterLookup();
    setCategoryOptions(lookup)
    console.log("categories:",lookup)
  };

  // --- CRUD Handlers ---
  const handleCreate = () => {
    setSelectedServiceRequest(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleView = (sr: ServiceRequest) => {
    setSelectedServiceRequest(sr);
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleEdit = (sr: ServiceRequest) => {
    setSelectedServiceRequest(sr);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDelete = async (serviceRequestId: string) => {
    setDeleteServiceRequestId(serviceRequestId);
  };

  const confirmDelete = async () => {
    if (!deleteServiceRequestId) return;
    try {
      await serviceRequestApiService.deleteServiceRequest(deleteServiceRequestId);
      setDeleteServiceRequestId(null);
      await loadServiceRequest();
      toast({
        title: "Service Request Deleted",
        description: "The service request has been removed successfully.",
      });
    } catch (error) {
      toast({ title: "Technical Error!", variant: "destructive" });
    }
  };

  const handleSave = async (serviceRequestData: Partial<ServiceRequest>) => {
    try {
      if (formMode === 'create') {
        await serviceRequestApiService.addServiceRequest(serviceRequestData);
      } else if (formMode === 'edit' && selectedServiceRequest) {
        const updatedServiceRequest = { ...selectedServiceRequest, ...serviceRequestData };
        await serviceRequestApiService.updateServiceRequest(updatedServiceRequest);
      }
      setIsFormOpen(false);
      toast({
        title: formMode === 'create' ? "Service Request Created" : "Service Request Updated",
        description: `Service Request (${serviceRequestData.category || ''}) has been ${formMode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      updateServiceRequestPage();
    } catch (error) {
      toast({ title: "Technical Error!", variant: "destructive" });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">Service Requests</h1>
                  <p className="text-sm text-muted-foreground">Manage customer service requests</p>
                </div>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="w-4 h-4 mr-2" /> New Request
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search service requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* STATUS (filter lookup returns strings) */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* CATEGORY (filter lookup returns strings) */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{serviceRequestOverview.total_requests}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{serviceRequestOverview.open_requests}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{serviceRequestOverview.in_progress_requests}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{serviceRequestOverview.avg_resolution_hours}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Service Requests Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Requests</CardTitle>
                  <CardDescription>Track and manage customer service requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Requester</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(serviceRequest || []).map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="font-medium">#{(request as any).sr_no || request.id}</div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{(request as any).requester_name || "-"}</div>
                              {(request as any).location && (
                                <div className="text-sm text-muted-foreground">{(request as any).location}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">{request.description}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.priority?.toLowerCase() === "high"
                                  ? "destructive"
                                  : request.priority?.toLowerCase() === "medium"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {request.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{request.created_at ? new Date(request.created_at).toLocaleDateString() : "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status?.toLowerCase().includes("resolved")
                                  ? "default"
                                  : request.status?.toLowerCase().includes("progress")
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {String(request.status).replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(request)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {canWrite(resource) && <Button variant="ghost" size="sm" onClick={() => handleEdit(request)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              }
                              {canDelete(resource) && <Button variant="ghost" size="sm" onClick={() => handleDelete(request.id!)}>
                                Delete
                              </Button>
                              }
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4">
                    <Pagination page={page} pageSize={pageSize} totalItems={totalItems} onPageChange={setPage} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog open={!!deleteServiceRequestId} onOpenChange={(open) => !open && setDeleteServiceRequestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service request?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected service request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create / Edit / View Form */}
      <ServiceRequestForm
        serviceRequest={selectedServiceRequest}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />
    </SidebarProvider>
  );
}
