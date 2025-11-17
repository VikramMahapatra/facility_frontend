import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Zap,
  Droplets,
  Flame,
  Users,
  Gauge,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockMeters, mockMeterReadings } from "@/data/mockEnergyData";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { MeterForm } from "@/components/MeterForm";
import { MeterReadingForm } from "@/components/MeterReadingForm";
import { toast } from "@/hooks/use-toast";
import {
  Meter,
  MeterReading,
  MeterReadingOverview,
} from "@/interfaces/energy_iot_interface";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { meterReadingApiService } from "@/services/energy_iot/meterreadingsapi";
import { Pagination } from "@/components/Pagination";
import { exportToExcel } from "@/helpers/exportToExcelHelper";
import { useAuth } from "../context/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const getMeterIcon = (kind: string) => {
  switch (kind) {
    case "electricity":
      return <Zap className="h-4 w-4 text-yellow-500" />;
    case "water":
      return <Droplets className="h-4 w-4 text-blue-500" />;
    case "gas":
      return <Flame className="h-4 w-4 text-orange-500" />;
    case "people_counter":
      return <Users className="h-4 w-4 text-purple-500" />;
    default:
      return <Gauge className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    maintenance: "bg-yellow-100 text-yellow-800",
  };
  return (
    <Badge className={variants[status as keyof typeof variants]}>
      {status}
    </Badge>
  );
};

export default function MetersReadings() {
  const [activeTab, setActiveTab] = useState<"meters" | "readings">("meters");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchReadingTerm, setSearchReadingTerm] = useState("");
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [isMeterFormOpen, setIsMeterFormOpen] = useState(false);
  const [meterFormMode, setMeterFormMode] = useState<
    "create" | "edit" | "view"
  >("create");
  const [selectedMeterReading, setSelectedMeterReading] =
    useState<MeterReading | null>(null);
  const [isMeterReadingFormOpen, setIsMeterReadingFormOpen] = useState(false);
  const [meterReadingFormMode, setMeterReadingFormMode] = useState<
    "create" | "edit" | "view"
  >("create");
  const [meters, setMeters] = useState<Meter[]>([]);
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);
  const [meterReadingOverview, setMeterReadingOverview] =
    useState<MeterReadingOverview>({
      totalMeters: 0,
      activeMeters: 0,
      latestReadings: 0,
      iotConnected: 0,
    });

  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(5); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const { canRead, canWrite, canDelete } = useAuth();
  const resource = "meters";
  const resourceReadings = "meter_readings";
  const [readingsPage, setReadingsPage] = useState(1); // current page
  const [readingsPageSize] = useState(5); // items per page
  const [totalReadingsItems, setTotalReadingsItems] = useState(0);
  const [deleteReadingId, setDeleteReadingId] = useState<string | null>(null);

  useEffect(() => {
    loadReadingOverView();
  }, []);

  useSkipFirstEffect(() => {
    loadMeters();
  }, [page]);

  useEffect(() => {
    loadMeterReadings();
  }, [readingsPage]);

  useEffect(() => {
    updateMeterTab();
  }, [searchTerm]);

  useEffect(() => {
    updateMeterReadingTab();
  }, [searchReadingTerm]);

  const updateMeterTab = () => {
    if (page === 1) {
      loadMeters();
    } else {
      setPage(1);
    }
  };

  const updateMeterReadingTab = () => {
    if (readingsPage === 1) {
      loadMeterReadings();
    } else {
      setReadingsPage(1);
    }
  };

  const loadReadingOverView = async () => {
    const response = await meterReadingApiService.getReadingOverview();
    if (response.success) setMeterReadingOverview(response.data || {});
  };

  const loadMeters = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await meterReadingApiService.getMeters(params);
    setMeters(response.data?.meters || []);
    setTotalItems(response.data?.total || 0);
  };

  const loadMeterReadings = async () => {
    const skip = (readingsPage - 1) * readingsPageSize;
    const limit = readingsPageSize;

    // build query params
    const params = new URLSearchParams();
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await meterReadingApiService.getMeterReadings(params);
    setMeterReadings(response.data?.readings || []);
    setTotalReadingsItems(response.data?.total || 0);
  };

  const filteredMeters = mockMeters.filter(
    (meter) =>
      meter.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.kind.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReadings = mockMeterReadings.filter(
    (reading) =>
      reading.meterCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.meterKind.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onCreateMeter = () => {
    setSelectedMeter(null);
    setMeterFormMode("create");
    setIsMeterFormOpen(true);
  };

  const onEditMeter = (meter: Meter) => {
    setSelectedMeter(meter);
    setMeterFormMode("edit");
    setIsMeterFormOpen(true);
  };

  const onViewMeter = (meter: Meter) => {
    setSelectedMeter(meter);
    setMeterFormMode("view");
    setIsMeterFormOpen(true);
  };

const onSaveMeter = async (meterData: Partial<Meter>) => {
    let response;
    if (meterFormMode === 'create') {
      response = await meterReadingApiService.addMeter(meterData);
    } else if (meterFormMode === 'edit' && meterData) {
      response = await meterReadingApiService.updateMeter({ ...selectedMeter, ...meterData });
    }

    if (response?.success) {
      setIsMeterFormOpen(false);
      updateMeterTab();
      toast({
        title: "Success",
        description: `Meter ${meterFormMode === "create" ? "created" : "updated"} successfully.`,
      });
    }
  };

  const onCreateMeterReading = () => {
    setSelectedMeterReading(null);
    setMeterReadingFormMode("create");
    setIsMeterReadingFormOpen(true);
  };

  const onEditMeterReading = (meterReading: MeterReading) => {
    setSelectedMeterReading(meterReading);
    setMeterReadingFormMode("edit");
    setIsMeterReadingFormOpen(true);
  };

  const onViewMeterReading = (meterReading: MeterReading) => {
    setSelectedMeterReading(meterReading);
    setMeterReadingFormMode("view");
    setIsMeterReadingFormOpen(true);
  };

  const onSaveMeterReading = async (
  meterReadingData: Partial<MeterReading>
) => {
  let response;
  if (meterReadingFormMode === 'create') {
    response = await meterReadingApiService.addMeterReading(meterReadingData);

    if (response.success)
      await loadMeterReadings();
  } else if (meterReadingFormMode === 'edit' && selectedMeterReading) {
    const updatedMeterReading = {
      ...selectedMeterReading,
      ...meterReadingData,
      updated_at: new Date().toISOString(),
    };
    response = await meterReadingApiService.updateMeterReading(updatedMeterReading);

    if (response.success) {
      // Update the edited meter reading in local state
      setMeterReadings((prev) =>
        prev.map((mr) => (mr.id === updatedMeterReading.id ? updatedMeterReading : mr))
      );
    }
  }

  if (response.success) {
    setIsMeterReadingFormOpen(false);
    toast({
      title: "Success",
      description: `Meter reading ${meterReadingFormMode === "create" ? "added" : "updated"} successfully.`,
    });
  }
  return response;
};

  const onDeleteMeterReading = async (reading: MeterReading) => {
    setDeleteReadingId(reading.id);
  };

  const confirmDeleteReading = async () => {
    if (deleteReadingId) {
      const response = await meterReadingApiService.deleteMeterReading(deleteReadingId);
      if (response.success) {
        await loadMeterReadings();
        setDeleteReadingId(null);
        toast({
          title: "Deleted",
          description: `Meter reading has been deleted successfully.`,
        });
      }
    }
  };

  const onExport = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);

    await exportToExcel(activeTab, params);
  }

  const onCreateReading = () => {
    console.log("Opening reading form...");
  };

  const handleBulkImport = async (data: any[]) => {
    console.log("Importing meters:", data);

    if (activeTab === "meters")
      updateMeterTab()
    else
      updateMeterReadingTab()

    loadReadingOverView();
  };

  const stats = [
    {
      title: "Total Meters",
      value: mockMeters.length,
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      title: "Active Meters",
      value: mockMeters.filter((m) => m.status === "active").length,
      icon: <Zap className="h-4 w-4 text-green-500" />,
    },
    {
      title: "Latest Readings",
      value: mockMeterReadings.length,
      icon: <Eye className="h-4 w-4" />,
    },
    {
      title: "IoT Connected",
      value: mockMeterReadings.filter((r) => r.source === "iot").length,
      icon: <Users className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Meters & Readings</h1>
              <p className="text-sm text-muted-foreground">
                Monitor and manage utility meters and consumption data
              </p>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Meters
                  </CardTitle>
                  <Gauge className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {meterReadingOverview.totalMeters}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Meters
                  </CardTitle>
                  <Zap className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {meterReadingOverview.activeMeters}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Latest Readings
                  </CardTitle>
                  <Eye className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {meterReadingOverview.latestReadings}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    IoT Connected
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {meterReadingOverview.iotConnected}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Energy & Utility Management</CardTitle>
                    <CardDescription>
                      Manage meters and track consumption readings
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === "meters" ? "default" : "outline"}
                      onClick={() => setActiveTab("meters")}
                    >
                      Meters
                    </Button>
                    <Button
                      variant={activeTab === "readings" ? "default" : "outline"}
                      onClick={() => setActiveTab("readings")}
                    >
                      Readings
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Actions */}
                <div className="flex items-center justify-between space-y-2 mb-6">
                  <div className="flex flex-1 items-center space-x-2 max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onExport()}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <BulkUploadDialog
                      type={activeTab}
                      onImport={handleBulkImport}
                    />
                    {activeTab === "meters" ? (
                      <Button size="sm" onClick={onCreateMeter}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Meter
                      </Button>
                    ) : (
                      <Button size="sm" onClick={onCreateMeterReading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Reading
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content Tables */}
                {activeTab === "meters" ? (
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Last Reading</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {meters.map((meter) => (
                          <TableRow key={meter.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getMeterIcon(meter.kind)}
                                <span className="capitalize">{meter.kind}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {meter.code}
                            </TableCell>
                            <TableCell>{meter.site_name}</TableCell>
                            <TableCell>
                              {meter.space_name || meter.asset_name || "General"}
                            </TableCell>
                            <TableCell>{meter.unit}</TableCell>
                            <TableCell>
                              {meter.last_reading ? (
                                <div>
                                  <div className="font-medium">
                                    {meter.last_reading} {meter.unit}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(
                                      meter.last_reading_date!
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              ) : (
                                "No readings"
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(meter.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onViewMeter(meter)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {canWrite(resource) && <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditMeter(meter)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                }
                                {canDelete(resource) && <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
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
                  </div>
                ) : (
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meter</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Reading</TableHead>
                          <TableHead>Delta</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {meterReadings.map((reading) => (
                          <TableRow key={reading.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {reading.meter_code}
                                </div>
                                <div className="text-sm text-muted-foreground capitalize">
                                  {reading.meter_kind}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getMeterIcon(reading.meter_kind)}
                                <span className="capitalize">
                                  {reading.meter_kind}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {reading.reading} {reading.unit}
                              </span>
                            </TableCell>
                            <TableCell>
                              {reading.delta ? (
                                <span className="text-blue-600">
                                  +{reading.delta} {reading.unit}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  reading.source === "iot"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {reading.source}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(reading.ts).toLocaleDateString()}
                                <div className="text-xs text-muted-foreground">
                                  {new Date(reading.ts).toLocaleTimeString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onViewMeterReading(reading)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {canWrite(resourceReadings) &&
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditMeterReading(reading)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                }
                                {canDelete(resourceReadings) &&
                                <Button variant="ghost" size="sm" onClick={() => onDeleteMeterReading(reading)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                }
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Pagination
                      page={readingsPage}
                      pageSize={readingsPageSize}
                      totalItems={totalReadingsItems}
                      onPageChange={(newPage) => setReadingsPage(newPage)}
                    />
                  </div>

                )}

              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Meter Form */}
      <MeterForm
        meter={selectedMeter || undefined}
        isOpen={isMeterFormOpen}
        onClose={() => setIsMeterFormOpen(false)}
        onSave={onSaveMeter}
        mode={meterFormMode}
      />

      {/* Meter Reading Form */}
      <MeterReadingForm
        meterReading={selectedMeterReading || undefined}
        isOpen={isMeterReadingFormOpen}
        onClose={() => setIsMeterReadingFormOpen(false)}
        onSave={onSaveMeterReading}
        mode={meterReadingFormMode}
      />

      {/* Delete confirmation for meter reading */}
      <AlertDialog open={!!deleteReadingId} onOpenChange={() => setDeleteReadingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meter Reading</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meter reading? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReading} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
