import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { SpaceOwnershipSection } from "@/components/spacedetails/SpaceOwnershipSection";
import { OwnershipHistoryDialog } from "@/components/spacedetails/OwnershipHistoryDialog";
import { useLoader } from "@/context/LoaderContext";
import {
  getKindColor,
  getKindIcon,
  getStatusColor,
  HistoryRecord,
  OccupancyRecord,
  Space,
  TimelineEvent,
} from "@/interfaces/spaces_interfaces";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";
import {
  ArrowLeft,
  FileText,
  Home,
  Wrench,
  Search,
  Calendar,
  Receipt,
  IndianRupee,
  Clock,
  History,
  Users,
  Pencil,
  Car,
  Plus,
  Trash2,
} from "lucide-react";
import { SpaceMaintenanceForm } from "@/components/SpaceMaintenanceForm";
import { SpaceForm } from "@/components/SpaceForm";
import { toast } from "@/components/ui/app-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ownerMaintenancesApiService } from "@/services/spaces_sites/ownermaintenancesapi";
import { Pagination } from "@/components/Pagination";
import OccupancyTab from "@/components/spacedetails/OccupancyTab";
import SpaceTenantSection from "@/components/spacedetails/SpaceTenantSection";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi";
import { parkingSlotApiService } from "@/services/parking_access/parkingslotsapi";
import { ParkingSlot } from "@/interfaces/parking_access_interface";
import { parkingZoneApiService } from "@/services/parking_access/parkingzonesapi";

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<Space>(null);
  const [maintenanceItems, setMaintenanceItems] = useState<any[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceSearch, setMaintenanceSearch] = useState("");
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [maintenancePageSize] = useState(5);
  const [maintenanceTotal, setMaintenanceTotal] = useState(0);
  const [maintenanceRecord, setMaintenanceRecord] = useState<any | null>(null);
  const { withLoader } = useLoader();
  const navigate = useNavigate();
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<
    "create" | "edit" | "view"
  >("create");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [owners, setOwners] = useState([]);
  const [tenants, setTenants] = useState({
    pending: [],
    active: [],
  });
  const [occupancy, setOccupancy] = useState<OccupancyRecord>({
    status: "vacant",
  });
  const [occupancyHistory, setOccupancyHistory] = useState<TimelineEvent[]>([]);
  const [isSpaceFormOpen, setIsSpaceFormOpen] = useState(false);
  const [accessoriesList, setAccessoriesList] = useState<any[]>([]);
  const [isParkingSlotFormOpen, setIsParkingSlotFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [zoneList, setZoneList] = useState<any[]>([]);
  const [slotList, setSlotList] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [assignedParkingSlots, setAssignedParkingSlots] =
    useState<ParkingSlot[]>(space?.parking_slots ?? []);

  useEffect(() => {
    if (!id) return;
    loadSpace();
    loadOwners();
    fetchTenants();
    fetchOccupancy();
    loadAccessoriesLookup();
  }, [id]);

  const loadSpace = async () => {
    const response = await withLoader(async () => {
      return await spacesApiService.getSpaceById(id);
    });
    if (response.success) {
      setSpace(response.data);
      setAssignedParkingSlots(response.data?.parking_slots || []);
    }
  };

  const loadOwners = async () => {
    const res = await spacesApiService.getActiveOwners(id);
    if (res.success) setOwners(res.data || []);
  };

  const fetchTenants = async () => {
    const res = await tenantsApiService.getSpaceTenants(id);
    if (res?.success) {
      setTenants(res.data || []);
    }
  };

  const fetchOccupancy = async () => {
    const res = await occupancyApiService.getSpaceOccupancy(id);
    if (res?.success) {
      setOccupancy(res.data.current || { status: "vacant" });
      setOccupancyHistory(res.data.history || []);
    }
  };

  const loadAccessoriesLookup = async () => {
    const response = await spacesApiService.getAccessoriesLookup();
    if (response.success) setAccessoriesList(response.data || []);
  };


  const loadZonesBySite = async (siteId: string) => {
    const params = new URLSearchParams();
    params.append("site_id", siteId);
    const response = await parkingZoneApiService.getParkingZoneLookup(params);
    if (response?.success) {
      setZoneList(response.data || []);
    }
  };

  const loadSlotsByZone = async (zoneId: string) => {
    const params = new URLSearchParams();
    params.append("zone_id", zoneId);
    // Using getParkingSlots as fallback since all-slot-lookup endpoint may not be available
    const response = await parkingSlotApiService.getParkingSlots(params);
    if (response?.success) {
      const slotsData = response.data?.slots || response.data || [];
      setSlotList(Array.isArray(slotsData) ? slotsData : []);
    }
  };

  // const handleOpenParkingSlotForm = (slot?: ParkingSlot) => {
  //   if (space?.site_id) {
  //     loadZonesBySite(space.site_id);
  //     setIsParkingSlotFormOpen(true);
  //     if (slot) {
  //       // Editing mode
  //       setEditingSlot(slot);
  //       setSelectedZoneId(slot.zone_id);
  //       setSelectedSlotId(slot.id);
  //       loadSlotsByZone(slot.zone_id);
  //     } else {
  //       // Adding mode
  //       setEditingSlot(null);
  //       setSelectedZoneId("");
  //       setSelectedSlotId("");
  //       setSlotList([]);
  //     }
  //   }
  // };

  // const handleZoneChange = (zoneId: string) => {
  //   setSelectedZoneId(zoneId);
  //   setSelectedSlotId("");
  //   if (zoneId) {
  //     loadSlotsByZone(zoneId);
  //   } else {
  //     setSlotList([]);
  //   }
  // };

  const handleAssignParkingSlot = async () => {
    if (!id || !selectedSlotId) {
      toast.error("Please select a parking slot");
      return;
    }

    const isEditMode = !!editingSlot;

    const response = await withLoader(async () => {
      return await parkingSlotApiService.updateSpaceParkingSlots({
        space_id: id,
        parking_slot_ids: [selectedSlotId],
      });
    });

    if (response?.success) {
      toast.success(
        isEditMode
          ? "Parking slot updated successfully"
          : "Parking slot assigned successfully"
      );
      setIsParkingSlotFormOpen(false);
      setEditingSlot(null);
      setSelectedZoneId("");
      setSelectedSlotId("");
    } else {
      toast.error(response?.message || "Failed to assign parking slot");
    }
  };

  const handleRemoveParkingSlot = async () => {
    if (!id || !deleteSlotId) return;

    // Get all current slot IDs except the one being removed
    const remainingSlots = assignedParkingSlots.filter(
      (slot) => slot.id !== deleteSlotId
    );

    const remainingSlotIds = remainingSlots.map((slot) => slot.id);

    const response = await withLoader(async () => {
      return await parkingSlotApiService.updateSpaceParkingSlots({
        space_id: id,
        parking_slot_ids: remainingSlotIds,
      });
    });

    if (response?.success) {
      toast.success("Parking slot removed successfully");
      setDeleteSlotId(null);
      setAssignedParkingSlots(remainingSlots);
    } else {
      toast.error(response?.message || "Failed to remove parking slot");
    }
  };

  const getAccessoryName = (accessoryId: string) => {
    const accessory = accessoriesList.find(
      (a) => (a.id ?? a.value ?? a).toString() === accessoryId,
    );
    return accessory?.name ?? accessory?.label ?? accessory ?? accessoryId;
  };

  const onMoveInOutSuccess = async () => {
    loadSpace();
    loadOwners();
    fetchTenants();
    fetchOccupancy();
  };

  const loadMaintenances = async (spaceId: string) => {
    setMaintenanceLoading(true);
    const params = new URLSearchParams();
    if (maintenanceSearch) params.append("search", maintenanceSearch);
    params.append("space_id", spaceId);
    params.append(
      "skip",
      ((maintenancePage - 1) * maintenancePageSize).toString(),
    );
    params.append("limit", maintenancePageSize.toString());
    const response =
      await ownerMaintenancesApiService.getOwnerMaintenancesBySpace(params);
    if (response?.success) {
      setMaintenanceItems(response.data?.maintenances || []);
      setMaintenanceTotal(response.data?.total_records || 0);
    }
    setMaintenanceLoading(false);
  };

  useEffect(() => {
    if (space?.id) {
      loadMaintenances(space.id);
    }
  }, [space?.id, maintenancePage]);

  useEffect(() => {
    if (maintenancePage === 1) {
      if (space?.id) loadMaintenances(space.id);
    } else {
      setMaintenancePage(1);
    }
  }, [maintenanceSearch]);

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">-</Badge>;
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

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ContentContainer>
      <LoaderOverlay />
      {space && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              {/* Back button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="mt-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              {/* Icon + content */}
              <div className="flex items-start gap-3">
                {/* Space kind icon */}
                <span className="text-3xl mt-1">
                  {getKindIcon(space?.kind)}
                </span>

                {/* Text content */}
                <div className="flex flex-col gap-1">
                  {/* Title */}
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold leading-tight">
                      {space.name || "Unnamed Space"}
                    </h1>
                    <Button
                      variant="ghost"
                      onClick={() => setIsSpaceFormOpen(true)}
                      size="icon"
                      className="h-8 px-3"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Badges */}

                  <div className="flex items-center gap-2 mt-1">
                    {space.category && (
                      <Badge
                        variant="secondary"
                      >
                        {space.category}
                      </Badge>
                    )}
                    <Badge className={getStatusColor(space?.status)}>
                      {space?.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator />

          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Space Information</TabsTrigger>
              <TabsTrigger value="occupancy">Occupany Information</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance Charges</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <h1 className="flex items-center gap-2">
                        <Home className="h-5 w-5" /> Space Information
                      </h1>

                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4 text-sm">
                  <Info label="Site" value={space.site_name} />
                  <Info label="Building" value={space.building_block} />
                  <Info label="Type" value={space.kind
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())} />
                  <Info label="Sub Type" value={space.sub_kind?.toUpperCase()} />
                  <Info label="Floor" value={space.floor} />
                  <Info label="Area (sqft)" value={space.area_sqft} />
                  <Info label="Beds" value={space.beds} />
                  <Info label="Baths" value={space.baths} />
                  <Info label="Balconies" value={space.balconies} />
                  <Info label="View" value={space.attributes?.view} />
                  <Info label="Furnished" value={space.attributes?.furnished} />
                  <Info
                    label="Maintenance"
                    value={
                      space.maintenance_amount
                        ? `₹ ${Number(space.maintenance_amount).toLocaleString()}  
                          ${space.tax_rate ? `+ ${Number(space.tax_rate).toLocaleString()} % tax` : ''}`
                        : "-"
                    }
                  />
                  {space.accessories && space.accessories.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground mb-2">Accessories</p>
                      <div className="flex flex-wrap gap-2">
                        {space.accessories.map((acc: any, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {getAccessoryName(acc.accessory_id)} (Qty: {acc.quantity})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        <h1 className="flex items-center gap-2">
                          <FileText className="h-5 w-5" /> Ownership
                        </h1>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <History className="h-4 w-4" />
                        View History
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SpaceOwnershipSection
                      spaceId={id!}
                      owners={owners}
                      onRefresh={loadOwners}
                    // actionSlot={

                    // }
                    />
                  </CardContent>
                </Card>
                <SpaceTenantSection spaceId={id} tenants={tenants} onRefresh={fetchTenants} />
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      <h1 className="flex items-center gap-2">
                        <Car className="h-5 w-5" /> Parking Assigned
                      </h1>
                    </CardTitle>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenParkingSlotForm()}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Slot
                    </Button> */}
                  </div>
                </CardHeader>
                <CardContent>
                  {assignedParkingSlots.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No parking slots assigned to this space.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2">
                      <div className="space-y-2">
                        {assignedParkingSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Car className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">
                                  Slot {slot.slot_no}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {slot.zone_name}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {slot.slot_type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteSlotId(slot.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  )}
                </CardContent>
              </Card>

              <OwnershipHistoryDialog
                open={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                spaceId={id!}
              />

              {/* Assign Parking Slot Dialog */}
              {/* <Dialog open={isParkingSlotFormOpen} onOpenChange={(open) => {
                setIsParkingSlotFormOpen(open);
                if (!open) {
                  setEditingSlot(null);
                  setSelectedZoneId("");
                  setSelectedSlotId("");
                }
              }}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSlot ? "Update Parking Slot" : "Assign Parking Slot"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="zone_id">Zone *</Label>
                      <Select
                        value={selectedZoneId}
                        onValueChange={handleZoneChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {zoneList.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No zones available
                            </SelectItem>
                          ) : (
                            zoneList.map((zone) => (
                              <SelectItem key={zone.id} value={zone.id}>
                                {zone.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slot_id">Parking Slot *</Label>
                      <Select
                        value={selectedSlotId}
                        onValueChange={setSelectedSlotId}
                        disabled={!selectedZoneId}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedZoneId
                                ? "Select zone first"
                                : "Select Parking Slot"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {slotList.length === 0 ? (
                            <SelectItem value="none" disabled>
                              {selectedZoneId
                                ? "No slots available"
                                : "Select zone first"}
                            </SelectItem>
                          ) : (
                            slotList.map((slot) => (
                              <SelectItem key={slot.id} value={slot.id}>
                                Slot {slot.slot_no} ({slot.slot_type})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsParkingSlotFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAssignParkingSlot}
                      disabled={!selectedSlotId}
                    >
                      {editingSlot ? "Update Slot" : "Assign Slot"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog> */}

              {/* Delete Confirmation Dialog */}
              <AlertDialog
                open={!!deleteSlotId}
                onOpenChange={() => setDeleteSlotId(null)}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Parking Slot</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this parking slot assignment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRemoveParkingSlot}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
            <TabsContent value="occupancy" className="space-y-6">
              <OccupancyTab
                spaceId={id}
                owners={owners}
                tenants={tenants.active}
                occupancy={occupancy}
                history={occupancyHistory}
                onSucess={onMoveInOutSuccess}
              />
            </TabsContent>
            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Maintenance Charges</span>
                    {owners.length > 0 && (
                      <Button
                        onClick={() => {
                          setMaintenanceRecord({
                            site_name: space.site_name,
                            space_name: space.name,
                            building_name: space.building_block,
                          });
                          setMaintenanceMode("create");
                          setIsMaintenanceOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Wrench className="h-4 w-4" />
                        Create Maintenance
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search maintenance..."
                      value={maintenanceSearch}
                      onChange={(e) => setMaintenanceSearch(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="relative">
                    {maintenanceLoading && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}
                    {maintenanceItems.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground">
                        No maintenance charges found.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {maintenanceItems.map((item) => (
                          <Card key={item.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                #{item.maintenance_no || "-"}
                              </div>
                              {getStatusBadge(item.status)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Owner: {item.owner_name || "-"}
                            </div>
                            <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                              <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Period
                                </div>
                                <div>
                                  {formatDate(item.period_start)} -{" "}
                                  {formatDate(item.period_end)}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2">
                                  <IndianRupee className="h-4 w-4" />
                                  Amount
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="font-medium">
                                    ₹ {item.amount ?? "-"}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Created
                                </div>
                                <div>{formatDate(item.created_at)}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2">
                                  <Receipt className="h-4 w-4" />
                                  Invoice
                                </div>
                                <div>{item.invoice_id || "-"}</div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Pagination
                page={maintenancePage}
                pageSize={maintenancePageSize}
                totalItems={maintenanceTotal}
                onPageChange={setMaintenancePage}
              />
            </TabsContent>
          </Tabs>
          <SpaceMaintenanceForm
            isOpen={isMaintenanceOpen}
            onClose={() => setIsMaintenanceOpen(false)}
            onSave={async (payload) => {
              if (!payload.space_id || !payload.start_date) {
                toast.error("Space and start date are required");
                return { success: false };
              }

              const payloadToSave = {
                ...payload,
                period_start: payload.start_date,
                period_end: payload.end_date,
              };
              delete payloadToSave.start_date;
              delete payloadToSave.end_date;
              const response =
                await ownerMaintenancesApiService.createOwnerMaintenance(
                  payloadToSave,
                );

              if (response?.success) {
                setIsMaintenanceOpen(false);
                toast.success(
                  `Space maintenance has been created successfully.`,
                );
                return { success: true };
              } else {
                return { success: false };
              }
            }}
            mode={maintenanceMode}
            record={maintenanceRecord as any}
            defaultSpaceId={space.id}
          />

          {/* Space Form */}
          <SpaceForm
            space={space}
            isOpen={isSpaceFormOpen}
            onClose={() => setIsSpaceFormOpen(false)}
            mode="edit"
            onSave={async (spaceData: Partial<Space>) => {
              if (!space) return { success: false };

              const updatedSpace = {
                ...space,
                ...spaceData,
              };

              const response = await withLoader(async () => {
                return await spacesApiService.updateSpace(updatedSpace);
              });

              if (response?.success) {
                setIsSpaceFormOpen(false);
                toast.success("Space updated successfully.");
                // Reload space data
                await loadSpace();
              }
              return response;
            }}
          />
        </div>
      )}
    </ContentContainer>
  );
}

function Info({ label, value }: { label: string; value?: any }) {
  const displayValue = (v?: string | number | null) =>
    v === null || v === undefined || v === "" ? "-" : v;
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p>{displayValue(value)}</p>
    </div>
  );
}
