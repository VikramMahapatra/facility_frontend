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
  OccupancyHistory,
  OccupancyResponse,
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
import { useSettings } from "@/context/SettingsContext";
import MaintenanceCharge from "@/components/spacedetails/MaintenanceChargeTab";
import { UpcomingMoveIns } from "@/components/spacedetails/UpcomingMoveIns";
import { OccupancyHistoryTab } from "@/components/spacedetails/OccupancyHistoryTab";
import OccupancyTimeline from "@/components/spacedetails/OccupancyTimelineTab";

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<Space>(null);
  const { withLoader } = useLoader();
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [owners, setOwners] = useState([]);
  const [tenants, setTenants] = useState({
    pending: [],
    active: [],
  });
  const [occupancy, setOccupancy] = useState<OccupancyResponse>(null);
  const [occupancyUpcomingMoveIns, setOccupancyUpcomingMoveIns] = useState<any[]>(null);
  const [occupancyHistory, setOccupancyHistory] = useState<any[]>(null);
  const [occupancyTimeline, setOccupancyTimeline] = useState<TimelineEvent[]>(null);
  const [occupancyLoading, setOccupancyLoading] = useState<boolean>(true);
  const [occupancyMoveInsLoading, setOccupancyMoveInsLoading] = useState<boolean>(true);
  const [occupancyHistoryLoading, setOccupancyHistoryLoading] = useState<boolean>(true);
  const [occupancyTimelineLoading, setOccupancyTimelineLoading] = useState<boolean>(true);
  const [isSpaceFormOpen, setIsSpaceFormOpen] = useState(false);
  const [accessoriesList, setAccessoriesList] = useState<any[]>([]);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [assignedParkingSlots, setAssignedParkingSlots] = useState<
    ParkingSlot[]
  >(space?.parking_slots ?? []);
  const { systemCurrency } = useSettings();
  const formatCurrency = (val?: number) => {
    if (val == null) return "-";
    return systemCurrency.format(val);
  };
  useEffect(() => {
    if (!id) return;
    loadSpace();
    loadOwners();
    fetchTenants();
    fetchOccupancy();
    loadAccessoriesLookup();
    fetchOccupancyUpcomingMoveIns();
    fetchOccupancyHistory();
    fetchOccupancyTimeline();
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

  const fetchOccupancyUpcomingMoveIns = async () => {
    setOccupancyMoveInsLoading(true);
    const res = await occupancyApiService.getSpaceOccupancyUpcomingMoveIns(id);
    if (res?.success) {
      setOccupancyUpcomingMoveIns(res.data);
      setOccupancyMoveInsLoading(false);
    }
  };

  const fetchOccupancyHistory = async () => {
    setOccupancyHistoryLoading(true);
    const res = await occupancyApiService.getSpaceOccupancyHistory(id);
    if (res?.success) {
      setOccupancyHistory(res.data);
      setOccupancyHistoryLoading(false);
    }
  };

  const fetchOccupancyTimeline = async () => {
    setOccupancyHistoryLoading(true);
    const res = await occupancyApiService.getSpaceOccupancyTimeline(id);
    if (res?.success) {
      setOccupancyTimeline(res.data);
      setOccupancyTimelineLoading(false);
    }
  };


  const fetchOccupancy = async () => {
    setOccupancyLoading(true);
    const res = await occupancyApiService.getSpaceOccupancy(id);
    if (res?.success) {
      setOccupancy(res.data);
      setOccupancyLoading(false);
    }
  };

  const loadAccessoriesLookup = async () => {
    const response = await spacesApiService.getAccessoriesLookup();
    if (response.success) setAccessoriesList(response.data || []);
  };


  const handleRemoveParkingSlot = async () => {
    if (!id || !deleteSlotId) return;

    // Get all current slot IDs except the one being removed
    const remainingSlots = assignedParkingSlots.filter(
      (slot) => slot.id !== deleteSlotId,
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

  const onMoveOutSuccess = async () => {
    fetchOccupancy();
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
                      <Badge variant="secondary">{space.category}</Badge>
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="info">Space Information</TabsTrigger>
              <TabsTrigger value="occupancy">Occupany Information</TabsTrigger>
              <TabsTrigger value="upcoming_moveins">Upcoming Move Ins </TabsTrigger>
              <TabsTrigger value="occupancy_history">Occupany History </TabsTrigger>
              <TabsTrigger value="occupancy_timeline">Occupany Timeline </TabsTrigger>
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
                  <Info
                    label="Type"
                    value={space.kind
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  />
                  <Info
                    label="Sub Type"
                    value={space.sub_kind?.toUpperCase()}
                  />
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
                        ? `${formatCurrency(space.maintenance_amount)}  
                          ${space.tax_rate ? `+ ${Number(space.tax_rate).toLocaleString()} % tax` : ""}`
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
                            {getAccessoryName(acc.accessory_id)} (Qty:{" "}
                            {acc.quantity})
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
                <SpaceTenantSection
                  spaceId={id}
                  tenants={tenants}
                  onRefresh={fetchTenants}
                />
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      <h1 className="flex items-center gap-2">
                        <Car className="h-5 w-5" /> Parking Assigned
                      </h1>
                    </CardTitle>
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
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
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

              {/* Delete Confirmation Dialog */}
              <AlertDialog
                open={!!deleteSlotId}
                onOpenChange={() => setDeleteSlotId(null)}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Parking Slot</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this parking slot
                      assignment? This action cannot be undone.
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
              {occupancyLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-40"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <OccupancyTab
                  spaceId={id}
                  current={occupancy?.current}
                  owners={owners}
                  tenants={tenants.active}
                  onSucess={onMoveInOutSuccess}
                  onMoveOutFlowSuccess={onMoveOutSuccess}
                />
              )}
            </TabsContent>
            <TabsContent value="upcoming_moveins" className="space-y-4">
              {occupancyMoveInsLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-40"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <UpcomingMoveIns
                  upcoming={occupancyUpcomingMoveIns}
                />
              )}
            </TabsContent>
            <TabsContent value="occupancy_history" className="space-y-4">
              {occupancyHistoryLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-40"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <OccupancyHistoryTab
                  history={occupancyHistory}
                />
              )}
            </TabsContent>
            <TabsContent value="occupancy_timeline" className="space-y-4">
              {occupancyTimelineLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-40"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <OccupancyTimeline
                  history={occupancyTimeline}
                />
              )}
            </TabsContent>
            <TabsContent value="maintenance" className="space-y-4">
              <MaintenanceCharge
                space={space}
                owners={owners}
              />
            </TabsContent>
          </Tabs>


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
