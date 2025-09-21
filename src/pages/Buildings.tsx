import { useState } from "react";
import { Building, Plus, Eye, Edit, Trash2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { mockSites, getBuildingBlocks, getSpacesBySite } from "@/data/mockSpacesData";
import { BuildingForm } from "@/components/BuildingForm";

export default function Buildings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedBuilding, setSelectedBuilding] = useState<any | undefined>();
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [showForm, setShowForm] = useState(false);

  // Mock state for buildings
  const [buildings, setBuildings] = useState(() =>
    mockSites.flatMap(site => {
      const blocks = getBuildingBlocks(site.id);
      return blocks.map(building => ({
        ...building,
        siteId: site.id,
        siteName: site.name,
        siteKind: site.kind,
      }));
    })
  );

  const filteredBuildings = buildings.filter(building => {
    const matchesSearch =
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSite === "all" || building.siteId === selectedSite;
    return matchesSearch && matchesSite;
  });

  // --- CRUD Handlers ---
  const handleCreate = () => {
    setSelectedBuilding(undefined);
    setFormMode("create");
    setShowForm(true);
  };

  const handleView = (building: any) => {
    setSelectedBuilding(building);
    setFormMode("view");
    setShowForm(true);
  };

  const handleEdit = (building: any) => {
    setSelectedBuilding(building);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleDelete = (buildingId: string) => {
    setBuildings(prev => prev.filter(b => b.id !== buildingId));
  };

  const handleSave = (building: any) => {
    if (formMode === "create") {
      setBuildings(prev => [...prev, { ...building, id: Date.now().toString() }]);
    } else if (formMode === "edit") {
      setBuildings(prev => prev.map(b => (b.id === building.id ? building : b)));
    }
    setShowForm(false);
  };

  // --- UI Helpers ---
  const getSiteKindColor = (kind: string) => {
    const colors = {
      residential: "bg-blue-100 text-blue-800",
      commercial: "bg-green-100 text-green-800",
      hotel: "bg-purple-100 text-purple-800",
      mall: "bg-orange-100 text-orange-800",
      mixed: "bg-indigo-100 text-indigo-800",
      campus: "bg-teal-100 text-teal-800",
    };
    return colors[kind as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getOccupancyRate = (building: any) => {
    const rate =
      building.totalSpaces > 0 ? (building.occupiedSpaces / building.totalSpaces) * 100 : 0;
    return rate.toFixed(1);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Buildings & Blocks</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">Buildings & Blocks</h2>
                  <p className="text-muted-foreground">
                    Manage building structures and floor layouts
                  </p>
                </div>
                <Button className="gap-2" onClick={handleCreate}>
                  <Plus className="h-4 w-4" />
                  Add New Building
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search buildings..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />

                <select
                  value={selectedSite}
                  onChange={e => setSelectedSite(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Sites</option>
                  {mockSites.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buildings Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBuildings.map((building, index) => {
                  const occupancyRate = parseFloat(getOccupancyRate(building));

                  return (
                    <Card
                      key={`${building.siteId}-${building.name}-${index}`}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Building className="h-5 w-5 text-sidebar-primary" />
                              {building.name}
                            </CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {building.siteName}
                            </div>
                          </div>
                          <Badge className={getSiteKindColor(building.siteKind)}>
                            {building.siteKind}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-sidebar-primary">{building.totalSpaces}</p>
                            <p className="text-muted-foreground">Total</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-green-600">{building.occupiedSpaces}</p>
                            <p className="text-muted-foreground">Occupied</p>
                          </div>
                          <div className="text-center">
                            <p className={`font-semibold ${getOccupancyColor(occupancyRate)}`}>
                              {occupancyRate}%
                            </p>
                            <p className="text-muted-foreground">Rate</p>
                          </div>
                        </div>

                        {/* Floors */}
                        <div>
                          <p className="text-sm font-medium text-sidebar-primary mb-2">
                            Floors ({building.floors})
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(building)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(building)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(building.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredBuildings.length === 0 && (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sidebar-primary mb-2">
                    No buildings found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or add a new building.
                  </p>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Building Form Modal */}
      <BuildingForm
        building={selectedBuilding}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        mode={formMode}
      />
    </SidebarProvider>
  );
}
