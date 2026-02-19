import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Car,
  MapPin,
  CheckCircle,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { parkingSlotApiService } from "@/services/parking_access/parkingslotsapi";
import { parkingZoneApiService } from "@/services/parking_access/parkingzonesapi";
import { ParkingSlotForm } from "@/components/ParkingSlotForm";
import { ParkingSlotBulkUploadDialog } from "@/components/ParkingSlotBulkUploadDialog";
import { ParkingSlot } from "@/interfaces/parking_access_interface";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/app-toast";
import { useLoader } from "@/context/LoaderContext";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";

export default function ParkingSlots() {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [zoneList, setZoneList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedSlotType, setSelectedSlotType] = useState<string>("all");
  const [overview, setOverview] = useState<any>({
    totalSlots: 0,
    availableSlots: 0,
    assignedSlots: 0,
  });
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const zoneId = searchParams.get("zone");
  const { withLoader } = useLoader();

  useEffect(() => {
    loadZoneLookup();
    loadSiteLookup();
    loadOverview();
  }, []);

  const loadZoneLookup = async () => {
    try {
      const params = new URLSearchParams();
      params.append("skip", "0");
      params.append("limit", "1000");
      const response = await parkingZoneApiService.getParkingZones(params);
      if (response.success) {
        const zonesData = response.data?.zones || response.data || [];
        setZoneList(Array.isArray(zonesData) ? zonesData : []);
      }
    } catch (error) {
      console.error("Error loading zones:", error);
    }
  };

  const loadSiteLookup = async () => {
    try {
      const response = await siteApiService.getSiteLookup();
      if (response.success) {
        setSiteList(response.data || []);
      }
    } catch (error) {
      console.error("Error loading sites:", error);
    }
  };

  const loadOverview = async () => {
    await withLoader(async () => {
      const response = await parkingSlotApiService.getParkingSlotOverview();
      if (response?.success) {
        setOverview(response.data || {});
      }
      return response;
    });
  };

  const loadSlots = useCallback(async () => {
    const params = new URLSearchParams();
    if (zoneId) {
      params.append("zone_id", zoneId);
    }
    if (searchQuery) {
      params.append("search", searchQuery);
    }

    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }

    if (selectedSlotType && selectedSlotType !== "all") {
      params.append("slot_type", selectedSlotType);
    }

    const response = await withLoader(async () => {
      return await parkingSlotApiService.getParkingSlots(params);
    });

    if (response?.success) {
      const slotsData = response.data?.slots || response.data || [];
      setSlots(Array.isArray(slotsData) ? slotsData : []);
    } else {
      setSlots([]);
      if (response?.message) {
        toast.error(response.message || "Failed to load parking slots");
      }
    }
  }, [zoneId, searchQuery, selectedSite, selectedSlotType, withLoader]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleZoneChange = (value: string) => {
    if (value === "all" || !value) {
      setSearchParams({});
    } else {
      setSearchParams({ zone: value });
    }
  };

  const handleCreate = () => {
    setSelectedSlot(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleSave = async (slotData: any) => {
    let response;
    if (formMode === "create") {
      response = await parkingSlotApiService.addParkingSlot(slotData);
      if (response.success) {
        loadSlots();
      }
    } else if (formMode === "edit" && selectedSlot) {
      const updatedSlot = {
        ...selectedSlot,
        ...slotData,
      };
      response = await parkingSlotApiService.updateParkingSlot(updatedSlot);
      if (response.success) {
        loadSlots();
      }
    }

    if (response?.success) {
      setIsFormOpen(false);
      toast.success(
        `Parking Slot has been ${formMode === "create" ? "created" : "updated"} successfully.`,
      );
    }
    return response;
  };

  const handleDelete = (slotId: string) => {
    setDeleteSlotId(slotId);
  };

  const confirmDelete = async () => {
    if (deleteSlotId) {
      const response =
        await parkingSlotApiService.deleteParkingSlot(deleteSlotId);
      if (response.success) {
        loadSlots();
        setDeleteSlotId(null);
        toast.success("Parking Slot deleted successfully");
      }
    }
  };

  const handleBulkImport = async (data: any[]) => {
    // TODO: Add API call here when ready
    // const response = await parkingSlotApiService.bulkUploadParkingSlots(data);
    // if (response.success) {
    //   loadSlots();
    //   toast.success(`${data.length} parking slots have been imported successfully.`);
    // }
    console.log("Bulk import data:", data);
    toast.success(
      `${data.length} parking slots ready to import (API integration pending).`,
    );
    loadSlots();
  };

  const totalSlots = overview.totalSlots || 0;
  const availableSlots = overview.availableSlots || 0;
  const assignedSlots = overview.assignedSlots || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Parking Slots</h2>
          <p className="text-muted-foreground">Manage physical parking slots</p>
        </div>

        <div className="flex items-center gap-2">
          <ParkingSlotBulkUploadDialog onImport={handleBulkImport} />
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-muted-foreground">
                Total Slots
              </p>
              <Car className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold text-sidebar-primary mb-1">
              {totalSlots}
            </div>
            <p className="text-sm text-blue-600">All parking slots</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-muted-foreground">
                Available
              </p>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {availableSlots}
            </div>
            <p className="text-sm text-green-600">Ready for use</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-muted-foreground">
                Assigned
              </p>
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {assignedSlots}
            </div>
            <p className="text-sm text-orange-600">Assigned to spaces</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by slot number, space..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={zoneId || "all"} onValueChange={handleZoneChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Zones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {zoneList.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name} {zone.site_name ? `(${zone.site_name})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSite} onValueChange={setSelectedSite}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sites</SelectItem>
            {siteList.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSlotType} onValueChange={setSelectedSlotType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="covered">Covered</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="visitor">Visitor</SelectItem>
            <SelectItem value="handicapped">Handicapped</SelectItem>
            <SelectItem value="ev">EV</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ContentContainer>
        <LoaderOverlay />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot No</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Assigned Space</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {slots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {!zoneId
                        ? "Please select a zone or use filters to view parking slots"
                        : "No parking slots found"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">
                      {slot.slot_no}
                    </TableCell>
                    <TableCell>{slot.site_name || "-"}</TableCell>
                    <TableCell>{slot.zone_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{slot.slot_type}</Badge>
                    </TableCell>
                    <TableCell>{slot.space_name || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(slot)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ContentContainer>

      <ParkingSlotForm
        slot={selectedSlot}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog
        open={!!deleteSlotId}
        onOpenChange={(open) => !open && setDeleteSlotId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              parking slot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
