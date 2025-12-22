import { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, UserCheck, Clock } from "lucide-react";
import { VisitorForm } from "@/components/VisitorForm";
import { toast } from "sonner";
import { visitorApiService } from "@/services/parking_access/visitorsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useLoader } from "@/context/LoaderContext";
import { useAuth } from "../context/AuthContext";
import { Visitor } from "@/interfaces/parking_access_interface";

export default function Visitors() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteVisitorId, setDeleteVisitorId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [overview, setOverview] = useState<any>({
    checkedInToday: 0,
    expectedToday: 0,
    totalVisitors: 0,
    totalVisitorsWithVehicle: 0,
  });
  const [siteList, setSiteList] = useState<any[]>([]);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const resource = "visitors";

  useEffect(() => {
    loadSiteLookup();
  }, []);

  useSkipFirstEffect(() => {
    loadVisitors();
    loadOverview();
  }, [page]);

  useEffect(() => {
    updateVisitorsPage();
  }, [searchQuery, selectedSite, selectedStatus]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const updateVisitorsPage = () => {
    if (page === 1) {
      loadVisitors();
      loadOverview();
    } else {
      setPage(1);
    }
  };

  const loadVisitors = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    if (selectedStatus && selectedStatus !== "all") {
      params.append("status", selectedStatus);
    }
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await visitorApiService.getVisitors(params);
    });

    if (response?.success) {
      setVisitors(response.data?.visitors || response.data || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const loadOverview = async () => {
    const response = await visitorApiService.getVisitorOverview();
    if (response?.success) {
      setOverview(response.data || {});
    }
  };

  const checkedInToday = overview.checkedInToday || 0;
  const expectedToday = overview.expectedToday || 0;
  const totalVisitors = overview.totalVisitors || 0;
  const totalVisitorsWithVehicle = overview.totalVisitorsWithVehicle || 0;

  const handleCreate = () => {
    setSelectedVisitor(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleSave = async (visitorData: any) => {
    let response;
    if (formMode === "create") {
      response = await visitorApiService.addVisitor(visitorData);
      if (response.success) updateVisitorsPage();
    } else if (formMode === "edit" && selectedVisitor) {
      const updatedVisitor = {
        ...selectedVisitor,
        ...visitorData,
      };
      response = await visitorApiService.updateVisitor(updatedVisitor);
      if (response.success) {
        loadOverview();
        setVisitors((prev) =>
          prev.map((v) => (v.id === updatedVisitor.id ? response.data : v))
        );
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast.success(
        `Visitor has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
  };

  const handleDelete = (visitorId: string) => {
    setDeleteVisitorId(visitorId);
  };

  const confirmDelete = async () => {
    if (deleteVisitorId) {
      const response = await visitorApiService.deleteVisitor(deleteVisitorId);
      if (response.success) {
        updateVisitorsPage();
        setDeleteVisitorId(null);
        toast.success("Visitor deleted successfully");
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      checked_in: "bg-green-100 text-green-800",
      checked_out: "bg-gray-100 text-gray-800",
      expected: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />

        <SidebarInset>
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-sidebar-primary" />
                <h1 className="text-lg font-semibold text-sidebar-primary">
                  Visitor Management
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-sidebar-primary">
                    Visitor Management
                  </h2>
                  <p className="text-muted-foreground">
                    Track and manage visitor access.
                  </p>
                </div>
                {canWrite(resource) && (
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Visitor
                  </Button>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Checked In Today
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {checkedInToday}
                    </div>
                    <p className="text-sm text-blue-600">Active visitors</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Expected Today
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {expectedToday}
                    </div>
                    <p className="text-sm text-blue-600">Scheduled visitors</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Total Visitors
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {totalVisitors}
                    </div>
                    <p className="text-sm text-blue-600">All visitor records</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search by name, phone, or purpose..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={selectedSite}
                      onValueChange={setSelectedSite}
                    >
                      <SelectTrigger className="w-[180px]">
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
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                        <SelectItem value="expected">Expected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-md border">
                    <ContentContainer>
                      <LoaderOverlay />
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Visitor</TableHead>
                            <TableHead>Visiting</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Entry Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visitors.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="text-center text-muted-foreground"
                              >
                                No visitors found
                              </TableCell>
                            </TableRow>
                          ) : (
                            visitors.map((visitor) => (
                              <TableRow key={visitor.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {visitor.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {visitor.phone}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{visitor.visiting}</TableCell>
                                <TableCell>{visitor.purpose}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    {formatDateTime(visitor.entry_time)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getStatusColor(visitor.status)}
                                  >
                                    {visitor.status.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {visitor.vehicle_no ? (
                                    <Badge variant="outline">
                                      {visitor.vehicle_no}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {canWrite(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(visitor)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {canDelete(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(visitor.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    )}
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

              {/* Pagination */}
              <Pagination
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
              />
            </div>

            <VisitorForm
              visitor={selectedVisitor}
              isOpen={isFormOpen}
              onClose={() => {
                setIsFormOpen(false);
                setSelectedVisitor(null);
              }}
              onSave={handleSave}
              mode={formMode}
            />

            <AlertDialog
              open={!!deleteVisitorId}
              onOpenChange={() => setDeleteVisitorId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Visitor</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this visitor? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
