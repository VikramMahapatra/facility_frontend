import { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Button } from "@/components/ui/button";
import { LogOut, } from "lucide-react";
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
import { Plus, Pencil, Trash2, Search, Car } from "lucide-react";
import { ParkingZoneForm } from "@/components/ParkingZoneForm";
import { toast } from "sonner";
import { parkingZoneApiService } from "@/services/parking_access/parkingzonesapi";
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
import { ParkingZone } from "@/interfaces/parking_access_interface";
import { PageHeader } from "@/components/PageHeader";

export default function ParkingZones() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [overview, setOverview] = useState<any>({
    totalZones: 0,
    totalCapacity: 0,
    avgCapacity: 0,
  });
  const [siteList, setSiteList] = useState<any[]>([]);
  const { canRead, canWrite, canDelete } = useAuth();
  const { user, handleLogout } = useAuth();
  const { withLoader } = useLoader();
  const resource = "parking_zones";

  useEffect(() => {
    loadSiteLookup();
  }, []);

  useSkipFirstEffect(() => {
    loadZones();
    loadOverview();
  }, [page]);

  useEffect(() => {
    updateZonesPage();
  }, [searchQuery, selectedSite]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const updateZonesPage = () => {
    if (page === 1) {
      loadZones();
      loadOverview();
    } else {
      setPage(1);
    }
  };

  const loadZones = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await parkingZoneApiService.getParkingZones(params);
    });

    if (response?.success) {
      setZones(response.data?.zones || response.data || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const loadOverview = async () => {
    const response = await parkingZoneApiService.getParkingZoneOverview();
    if (response?.success) {
      setOverview(response.data || {});
    }
  };

  const totalZones = overview.totalZones || 0;
  const totalCapacity = overview.totalCapacity || 0;
  const avgCapacity = overview.avgCapacity || 0;

  const handleCreate = () => {
    setSelectedZone(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (zone: ParkingZone) => {
    setSelectedZone(zone);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleSave = async (zoneData: any) => {
    let response;
    if (formMode === "create") {
      response = await parkingZoneApiService.addParkingZone(zoneData);
      if (response.success) updateZonesPage();
    } else if (formMode === "edit" && selectedZone) {
      const updatedZone = {
        ...selectedZone,
        ...zoneData,
      };
      response = await parkingZoneApiService.updateParkingZone(updatedZone);
      if (response.success) {
        loadOverview();
        setZones((prev) =>
          prev.map((z) => (z.id === updatedZone.id ? response.data : z))
        );
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast.success(
        `Parking Zone has been ${formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
  };

  const handleDelete = (zoneId: string) => {
    setDeleteZoneId(zoneId);
  };

  const confirmDelete = async () => {
    if (deleteZoneId) {
      const response = await parkingZoneApiService.deleteParkingZone(
        deleteZoneId
      );
      if (response.success) {
        updateZonesPage();
        setDeleteZoneId(null);
        toast.success("Parking Zone deleted successfully");
      }
    }
  };

  return (
    <div className="flex-1">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-sidebar-primary">
              Parking Zones
            </h2>
            <p className="text-muted-foreground">
              Manage parking zones and capacity.
            </p>
          </div>
          {canWrite(resource) && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Zone
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-bold text-muted-foreground mb-3">
                Total Zones
              </p>
              <div className="text-3xl font-bold text-sidebar-primary mb-1">
                {totalZones}
              </div>
              <p className="text-sm text-blue-600">All zones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-bold text-muted-foreground mb-3">
                Total Capacity
              </p>
              <div className="text-3xl font-bold text-sidebar-primary mb-1">
                {totalCapacity}
              </div>
              <p className="text-sm text-blue-600">Total parking spots</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-bold text-muted-foreground mb-3">
                Avg Capacity
              </p>
              <div className="text-3xl font-bold text-sidebar-primary mb-1">
                {avgCapacity}
              </div>
              <p className="text-sm text-blue-600">Average per zone</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name or site..."
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
        </div>
        <div className="relative rounded-md border">
          <ContentContainer>
            <LoaderOverlay />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone Name</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No parking zones found
                    </TableCell>
                  </TableRow>
                ) : (
                  zones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">
                        {zone.name}
                      </TableCell>
                      <TableCell>{zone.site_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {zone.capacity} spots
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canWrite(resource) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(zone)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete(resource) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(zone.id)}
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

        {/* Pagination */}
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>

      <ParkingZoneForm
        zone={selectedZone}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedZone(null);
        }}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog
        open={!!deleteZoneId}
        onOpenChange={() => setDeleteZoneId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parking Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this parking zone? This
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
    </div>
  );
}
