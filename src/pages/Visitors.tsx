import { useState, useEffect } from "react";
import { UserCheck, Search, Plus, Eye, Edit, Trash2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { VisitorForm } from "@/components/VisitorForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { visitorApiService } from "@/services/parking_access/visitorsapi";
import { Visitor, VisitorOverview } from "@/interfaces/parking_access_interface";
import { Pagination } from "@/components/Pagination";
import { useAuth } from "../context/AuthContext";
export default function Visitors() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteVisitorId, setDeleteVisitorId] = useState<string | null>(null);
  const [siteList, setSiteList] = useState([]);
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const [visitorOverview, setVisitorOverview] = useState<VisitorOverview>({
    checkedInToday: 0,
    expectedToday: 0,
    totalVisitors: 0,
    totalVisitorsWithVehicle: 0,
  });
  const { canRead, canWrite, canDelete } = useAuth();
  const resource = "visitors";
  useEffect(() => {
    loadSiteLookup();
    loadVisitorOverView();
  }, []);

  useSkipFirstEffect(() => {
    loadVisitors();
  }, [page]);

  useEffect(() => {
    updateVisitorPage();
  }, [searchTerm, selectedSite, selectedStatus]);

  const updateVisitorPage = () => {
    if (page === 1) {
      loadVisitors();
    } else {
      setPage(1);
    }
  }

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  }

  const loadVisitorOverView = async () => {
    const response = await visitorApiService.getVisitorOverview();
    setVisitorOverview(response);
  }

  const loadVisitors = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite) params.append("site_id", selectedSite);
    if (selectedStatus) params.append("status", selectedStatus);

    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await visitorApiService.getVisitors(params);
    setVisitors(response.visitors);
    setTotalItems(response.total);
  }

  const getStatusColor = (status: string) => {
    const colors = {
      checked_in: "bg-green-100 text-green-800",
      checked_out: "bg-gray-100 text-gray-800",
      expected: "bg-blue-100 text-blue-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCreate = () => {
    setSelectedVisitor(undefined);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleView = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleEdit = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = (visitorId: string) => {
    setDeleteVisitorId(visitorId);
  };

  const confirmDelete = () => {
    if (deleteVisitorId) {
      setVisitors(visitors.filter(visitor => visitor.id !== deleteVisitorId));
      toast({
        title: "Visitor Removed",
        description: "Visitor record has been removed successfully.",
      });
      setDeleteVisitorId(null);
    }
  };

  const handleSave = async (visitorData: Partial<Visitor>) => {
    try {
      if (formMode === 'create') {
        await visitorApiService.addVisitor(visitorData);
      } else if (formMode === 'edit' && selectedVisitor) {
        const updatedLog = { ...selectedVisitor, ...visitorData }
        await visitorApiService.updateVisitor(updatedLog);
      }
      setIsFormOpen(false);
      updateVisitorPage();
      loadVisitorOverView();
      toast({
        title: formMode === 'create' ? "Visitor Added" : "Visitor Updated",
        description: `Visitor "${visitorData.name}" has been ${formMode === 'create' ? 'added' : 'updated'} successfully.`,
      });

    } catch (error) {
      toast({
        title: "Techical Error!",
        variant: "destructive",
      });
    }

  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Visitor Management</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">Visitor Management</h2>
                  <p className="text-muted-foreground">Track and manage visitor access</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Visitor
                </Button>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{visitorOverview.checkedInToday}</div>
                    <p className="text-sm text-muted-foreground">Checked In Today</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{visitorOverview.expectedToday}</div>
                    <p className="text-sm text-muted-foreground">Expected Today</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">{visitorOverview.totalVisitors}</div>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {visitorOverview.totalVisitorsWithVehicle}
                    </div>
                    <p className="text-sm text-muted-foreground">With Vehicles</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>

                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Sites</option>
                  {siteList.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="expected">Expected</option>
                </select>
              </div>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Visitors ({visitors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Visiting</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Entry Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitors.map((visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{visitor.name}</div>
                              <div className="text-sm text-muted-foreground">{visitor.phone}</div>
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
                            <Badge className={getStatusColor(visitor.status)}>
                              {visitor.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {visitor.vehicle_no ? (
                              <Badge variant="outline">{visitor.vehicle_no}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleView(visitor)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              {canWrite(resource) && <Button size="sm" variant="outline" onClick={() => handleEdit(visitor)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              }
                              {canDelete(resource) && <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(visitor.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              }
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={(newPage) => setPage(newPage)}
                  />
                  {visitors.length === 0 && (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No visitors found</h3>
                      <p className="text-muted-foreground">Try adjusting your search criteria or add a new visitor.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>

      <VisitorForm
        visitor={selectedVisitor}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog open={!!deleteVisitorId} onOpenChange={() => setDeleteVisitorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Visitor Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this visitor record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}