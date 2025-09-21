import { useState } from "react";
import { Car, Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { mockParkingZones, mockSites, ParkingZone } from "@/data/mockParkingData";
import { ParkingZoneForm } from "@/components/ParkingZoneForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ParkingZones() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [zones, setZones] = useState<ParkingZone[]>(mockParkingZones);
  const [selectedZone, setSelectedZone] = useState<ParkingZone | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSite === "all" || zone.site_id === selectedSite;
    return matchesSearch && matchesSite;
  });

  const getSiteName = (siteId: string) => {
    const site = mockSites.find(s => s.id === siteId);
    return site ? site.name : 'Unknown Site';
  };

  const handleCreate = () => {
    setSelectedZone(undefined);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleView = (zone: ParkingZone) => {
    setSelectedZone(zone);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleEdit = (zone: ParkingZone) => {
    setSelectedZone(zone);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = (zoneId: string) => {
    setDeleteZoneId(zoneId);
  };

  const confirmDelete = () => {
    if (deleteZoneId) {
      setZones(zones.filter(zone => zone.id !== deleteZoneId));
      toast({
        title: "Zone Deleted",
        description: "Parking zone has been deleted successfully.",
      });
      setDeleteZoneId(null);
    }
  };

  const handleSave = (zoneData: Partial<ParkingZone>) => {
    if (formMode === 'create') {
      const newZone: ParkingZone = {
        id: `pz-${Date.now()}`,
        org_id: "org-1",
        ...zoneData as Omit<ParkingZone, 'id' | 'org_id'>
      };
      setZones([...zones, newZone]);
    } else if (formMode === 'edit' && selectedZone) {
      setZones(zones.map(zone => 
        zone.id === selectedZone.id 
          ? { ...zone, ...zoneData }
          : zone
      ));
    }
    setIsFormOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Parking Zones</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">Parking Zones</h2>
                  <p className="text-muted-foreground">Manage parking zones and capacity</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Zone
                </Button>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">{zones.length}</div>
                    <p className="text-sm text-muted-foreground">Total Zones</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {zones.reduce((sum, zone) => sum + zone.capacity, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Capacity</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(zones.reduce((sum, zone) => sum + zone.capacity, 0) / zones.length || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Capacity</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search zones..."
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
                  {mockSites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Parking Zones ({filteredZones.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zone Name</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredZones.map((zone) => (
                        <TableRow key={zone.id}>
                          <TableCell className="font-medium">{zone.name}</TableCell>
                          <TableCell>{getSiteName(zone.site_id)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{zone.capacity} spots</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleView(zone)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(zone)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(zone.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredZones.length === 0 && (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No zones found</h3>
                      <p className="text-muted-foreground">Try adjusting your search criteria or add a new zone.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>

      <ParkingZoneForm
        zone={selectedZone}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog open={!!deleteZoneId} onOpenChange={() => setDeleteZoneId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parking Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this parking zone? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}