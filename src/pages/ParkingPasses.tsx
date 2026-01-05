import { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Ticket } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Car,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { parkingPassesApiService } from "@/services/parking_access/parkingpassesapi";
import { ParkingPassForm } from "@/components/ParkingPassForm";
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
import { ParkingPass } from "@/interfaces/parking_access_interface";
import { PageHeader } from "@/components/PageHeader";

export default function ParkingPasses() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedPass, setSelectedPass] = useState<ParkingPass | null>(null);
  const [passes, setPasses] = useState<ParkingPass[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [deletePassId, setDeletePassId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [overview, setOverview] = useState<any>({
    totalPasses: 0,
    activePasses: 0,
    expiredPasses: 0,
    blockedPasses: 0,
  });
  const [siteList, setSiteList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [zoneList, setZoneList] = useState<any[]>([]);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  const resource = "parking_passes";

  useEffect(() => {
    loadSiteLookup();
    loadStatusFilterLookup();
    loadZoneFilterLookup();
    loadOverview();
    loadParkingPasses();
  }, []);

  useSkipFirstEffect(() => {
    loadParkingPasses();
    loadOverview();
  }, [page]);

  useEffect(() => {
    updatePassesPage();
  }, [searchQuery, selectedSite, selectedStatus, selectedZone]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadStatusFilterLookup = async () => {
    const response = await parkingPassesApiService.getFilterStatusLookup();
    if (response.success) setStatusList(response.data || []);
  };

  const loadZoneFilterLookup = async () => {
    const response = await parkingPassesApiService.getFilterZoneLookup();
    if (response.success) setZoneList(response.data || []);
  };

  const loadOverview = async () => {
    const response = await parkingPassesApiService.getParkingPassesOverview();
    if (response?.success) {
      setOverview(response.data || {});
    }
  };

  const loadParkingPasses = async () => {
    await withLoader(async () => {
      const params = new URLSearchParams();

      // Add search query
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      // Add site filter
      if (selectedSite && selectedSite !== "all") {
        params.append("site_id", selectedSite);
      }

      // Add status filter
      if (selectedStatus && selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      // Add zone filter
      if (selectedZone && selectedZone !== "all") {
        params.append("zone_id", selectedZone);
      }

      // Add pagination
      const skip = (page - 1) * pageSize;
      params.append("skip", skip.toString());
      params.append("limit", pageSize.toString());

      const response = await parkingPassesApiService.getAllParkingPasses(
        params
      );

      if (response?.success && response.data?.passes) {
        setPasses(response.data.passes);
        // If API returns total count, use it; otherwise use passes length
        setTotalItems(response.data.total || response.data.passes.length);
        return { success: true, data: response.data.passes };
      } else {
        setPasses([]);
        setTotalItems(0);
        return { success: false };
      }
    });
  };

  const updatePassesPage = () => {
    if (page === 1) {
      loadParkingPasses();
      loadOverview();
    } else {
      setPage(1);
    }
  };

  const totalPasses = overview.totalPasses || 0;
  const activePasses = overview.activePasses || 0;
  const expiredPasses = overview.expiredPasses || 0;
  const blockedPasses = overview.blockedPasses || 0;

  const handleCreate = () => {
    setSelectedPass(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (pass: ParkingPass) => {
    setSelectedPass(pass);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleView = (pass: ParkingPass) => {
    setSelectedPass(pass);
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleSave = async (passData: Partial<ParkingPass>) => {
    let response;
    if (formMode === "create") {
      response = await parkingPassesApiService.createParkingPass(passData);

      if (response.success) updatePassesPage();
    } else if (formMode === "edit" && selectedPass) {
      const updated = {
        ...selectedPass,
        ...passData,
      };
      response = await parkingPassesApiService.updateParkingPass(updated);

      if (response.success) {
        loadOverview();
        setPasses((prev) =>
          prev.map((p) => (p.id === selectedPass.id ? response.data : p))
        );
        //setSelectedPass(response.data);
      }
    }

    if (response?.success) {
      setIsFormOpen(false);
      toast.success(
        `Parking Pass has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
  };

  const handleDelete = (passId: string) => {
    setDeletePassId(passId);
  };

  const confirmDelete = async () => {
    if (deletePassId) {
      const response = await parkingPassesApiService.deleteParkingPass(
        deletePassId
      );
      if (response.success) {
        updatePassesPage();
        setDeletePassId(null);
        toast.success("Parking Pass deleted successfully");
      } else {
        toast.error("Failed to delete parking pass");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status?: string | null) => {
    if (!status) {
      return <Badge variant="secondary">-</Badge>;
    }

    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      expired: "destructive",
      suspended: "secondary",
      revoked: "destructive",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
             {/* LEFT SIDE - Page Title*/}
                        <PageHeader />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.account_type}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-sidebar-primary">
                    Parking Passes
                  </h2>
                  <p className="text-muted-foreground">
                    Manage parking passes for tenants and vehicles.
                  </p>
                </div>
                {canWrite(resource) && (
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Pass
                  </Button>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Total Passes
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {totalPasses}
                    </div>
                    <p className="text-sm text-blue-600">All passes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Active Passes
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {activePasses}
                    </div>
                    <p className="text-sm text-blue-600">Currently active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Expired Passes
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {expiredPasses}
                    </div>
                    <p className="text-sm text-blue-600">Require renewal</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Blocked Passes
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {blockedPasses}
                    </div>
                    <p className="text-sm text-blue-600">Currently blocked</p>
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
                        placeholder="Search by pass number, tenant, vehicle..."
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
                        {statusList.map((status: any) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedZone}
                      onValueChange={setSelectedZone}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Zones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Zones</SelectItem>
                        {zoneList.map((zone: any) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name}
                          </SelectItem>
                        ))}
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
                            <TableHead>Pass No</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Space</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Pass Holder</TableHead>
                            <TableHead>Vehicle No.</TableHead>
                            <TableHead>Valid From and To</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {passes.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={10}
                                className="text-center text-muted-foreground"
                              >
                                No parking passes found
                              </TableCell>
                            </TableRow>
                          ) : (
                            passes.map((pass) => (
                              <TableRow key={pass.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Ticket className="h-4 w-4 text-muted-foreground" />
                                    {pass.pass_no || "-"}
                                  </div>
                                </TableCell>
                                <TableCell>{pass.site_name || "-"}</TableCell>
                                <TableCell>{pass.space_name || "-"}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Car className="h-4 w-4 text-muted-foreground" />
                                    {pass.zone_name}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {pass.partner_name || "-"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {pass.pass_holder_name || "-"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {pass.vehicle_no || "-"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-blue-500" />
                                      <span className="text-sm">
                                        {formatDate(pass.valid_from)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-orange-500" />
                                      <span className="text-sm">
                                        {formatDate(pass.valid_to)}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(pass.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {canRead(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleView(pass)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {canWrite(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(pass)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {canDelete(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(pass.id)}
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

            {/* Form Dialog */}
            <ParkingPassForm
              pass={selectedPass}
              isOpen={isFormOpen}
              onClose={() => {
                setIsFormOpen(false);
                setSelectedPass(null);
              }}
              onSave={handleSave}
              mode={formMode}
            />

            <AlertDialog
              open={!!deletePassId}
              onOpenChange={() => setDeletePassId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Parking Pass</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this parking pass? This
                    action cannot be undone.
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
