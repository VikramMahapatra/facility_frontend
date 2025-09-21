import { useState } from "react";
import { Home, Search, Filter, Plus, Eye, Edit, Trash2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { mockSpaces, mockSites, SpaceKind } from "@/data/mockSpacesData";
import { SpaceForm } from "@/components/SpaceForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Space {
  id: string;
  org_id: string;
  site_id: string;
  code: string;
  name?: string;
  kind: SpaceKind;
  floor?: string;
  building_block?: string;
  area_sqft?: number;
  beds?: number;
  baths?: number;
  attributes: Record<string, any>;
  status: 'available' | 'occupied' | 'out_of_service';
  created_at: string;
  updated_at: string;
}

export default function Spaces() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [spaces, setSpaces] = useState<Space[]>(mockSpaces as Space[]);
  const [selectedSpace, setSelectedSpace] = useState<Space | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteSpaceId, setDeleteSpaceId] = useState<string | null>(null);

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = (space.name || space.code).toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind = selectedKind === "all" || space.kind === selectedKind;
    const matchesStatus = selectedStatus === "all" || space.status === selectedStatus;
    const matchesSite = selectedSite === "all" || space.site_id === selectedSite;
    return matchesSearch && matchesKind && matchesStatus && matchesSite;
  });

  const handleCreate = () => {
    setSelectedSpace(undefined);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleView = (space: Space) => {
    setSelectedSpace(space);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleEdit = (space: Space) => {
    setSelectedSpace(space);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = (spaceId: string) => {
    setDeleteSpaceId(spaceId);
  };

  const confirmDelete = () => {
    if (deleteSpaceId) {
      setSpaces(spaces.filter(space => space.id !== deleteSpaceId));
      toast({
        title: "Space Deleted",
        description: "Space has been deleted successfully.",
      });
      setDeleteSpaceId(null);
    }
  };

  const handleSave = (spaceData: Partial<Space>) => {
    if (formMode === 'create') {
      const newSpace: Space = {
        id: `space-${Date.now()}`,
        org_id: "org-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...spaceData as Omit<Space, 'id' | 'org_id' | 'created_at' | 'updated_at'>
      };
      setSpaces([...spaces, newSpace]);
    } else if (formMode === 'edit' && selectedSpace) {
      setSpaces(spaces.map(space =>
        space.id === selectedSpace.id
          ? { ...space, ...spaceData }
          : space
      ));
    }
    setIsFormOpen(false);
  };

  const getKindIcon = (kind: SpaceKind) => {
    const icons = {
      room: "🏨",
      apartment: "🏠",
      shop: "🏪",
      office: "🏢",
      warehouse: "🏭",
      meeting_room: "🏛️",
      hall: "🎭",
      common_area: "🌳",
      parking: "🚗"
    };
    return icons[kind] || "📍";
  };

  const getKindColor = (kind: SpaceKind) => {
    const colors = {
      room: "bg-purple-100 text-purple-800",
      apartment: "bg-blue-100 text-blue-800",
      shop: "bg-green-100 text-green-800",
      office: "bg-orange-100 text-orange-800",
      warehouse: "bg-gray-100 text-gray-800",
      meeting_room: "bg-indigo-100 text-indigo-800",
      hall: "bg-pink-100 text-pink-800",
      common_area: "bg-teal-100 text-teal-800",
      parking: "bg-yellow-100 text-yellow-800"
    };
    return colors[kind] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      occupied: "bg-blue-100 text-blue-800",
      out_of_service: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getSiteName = (siteId: string) => {
    const site = mockSites.find(s => s.id === siteId);
    return site ? site.name : 'Unknown Site';
  };

  const spaceKinds: SpaceKind[] = ['apartment', 'row_house', 'common_area'];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">All Spaces</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">All Spaces</h2>
                  <p className="text-muted-foreground">Manage all spaces across your properties</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Space
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search spaces..."
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

                <select
                  value={selectedKind}
                  onChange={(e) => setSelectedKind(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  {spaceKinds.map(kind => (
                    <option key={kind} value={kind}>{kind.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="out_of_service">Out of Service</option>
                </select>
              </div>

              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">{filteredSpaces.length}</div>
                    <p className="text-sm text-muted-foreground">Total Spaces</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredSpaces.filter(s => s.status === 'available').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredSpaces.filter(s => s.status === 'occupied').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Occupied</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredSpaces.filter(s => s.status === 'out_of_service').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Out of Service</p>
                  </CardContent>
                </Card>
              </div>

              {/* Spaces Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSpaces.map((space) => (
                  <Card key={space.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="text-xl">{getKindIcon(space.kind)}</span>
                            {space.name || space.code}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{space.code}</p>
                        </div>
                        <Badge className={getStatusColor(space.status)}>
                          {space.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Kind and Location */}
                      <div className="flex items-center justify-between">
                        <Badge className={getKindColor(space.kind)}>
                          {space.kind.replace('_', ' ')}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {space.area_sqft} sq ft
                        </div>
                      </div>

                      {/* Location Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{getSiteName(space.site_id)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Block: {space.building_block}</span>
                          <span className="text-muted-foreground">Floor: {space.floor}</span>
                        </div>
                      </div>

                      {/* Bed/Bath info for residential */}
                      {(space.beds || space.baths) && (
                        <div className="flex items-center gap-4 text-sm">
                          {space.beds && (
                            <span className="text-muted-foreground">🛏️ {space.beds} beds</span>
                          )}
                          {space.baths && (
                            <span className="text-muted-foreground">🚿 {space.baths} baths</span>
                          )}
                        </div>
                      )}

                      {/* Key Attributes */}
                      {Object.keys(space.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(space.attributes).slice(0, 3).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(space)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(space)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(space.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredSpaces.length === 0 && (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No spaces found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or add a new space.</p>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>

      <SpaceForm
        space={selectedSpace}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog open={!!deleteSpaceId} onOpenChange={() => setDeleteSpaceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Space</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this space? This action cannot be undone.
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