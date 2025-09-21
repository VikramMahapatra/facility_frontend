import { useState } from "react";
import { Building, Plus, Eye, Edit, Trash2, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { mockSites, getBuildingBlocks, getSpacesBySite } from "@/data/mockSpacesData";

export default function Buildings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");

  const allBuildings = mockSites.flatMap(site => {
    const buildings = getBuildingBlocks(site.id);
    return buildings.map(building => ({
      ...building,
      siteId: site.id,
      siteName: site.name,
      siteKind: site.kind
    }));
  });

  const filteredBuildings = allBuildings.filter(building => {
    const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         building.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSite === "all" || building.siteId === selectedSite;
    return matchesSearch && matchesSite;
  });

  const getSiteKindColor = (kind: string) => {
    const colors = {
      residential: "bg-blue-100 text-blue-800",
      commercial: "bg-green-100 text-green-800", 
      hotel: "bg-purple-100 text-purple-800",
      mall: "bg-orange-100 text-orange-800",
      mixed: "bg-indigo-100 text-indigo-800",
      campus: "bg-teal-100 text-teal-800"
    };
    return colors[kind as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getOccupancyRate = (building: any) => {
    const rate = building.totalSpaces > 0 ? (building.occupiedSpaces / building.totalSpaces) * 100 : 0;
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
                  <p className="text-muted-foreground">Manage building structures and floor layouts</p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Building
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search buildings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                
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

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">{filteredBuildings.length}</div>
                    <p className="text-sm text-muted-foreground">Total Buildings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">
                      {filteredBuildings.reduce((sum, b) => sum + b.totalSpaces, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Spaces</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredBuildings.reduce((sum, b) => sum + b.occupiedSpaces, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Occupied Spaces</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">
                      {filteredBuildings.reduce((sum, b) => sum + b.floors, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Floors</p>
                  </CardContent>
                </Card>
              </div>

              {/* Buildings Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBuildings.map((building, index) => {
                  const occupancyRate = parseFloat(getOccupancyRate(building));
                  
                  return (
                    <Card key={`${building.siteId}-${building.name}-${index}`} className="hover:shadow-lg transition-shadow">
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
                        {/* Occupancy Stats */}
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

                        {/* Floors Information */}
                        <div>
                          <p className="text-sm font-medium text-sidebar-primary mb-2">
                            Floors ({building.floors})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {Array.from({ length: Math.min(building.floors, 6) }, (_, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {i + 1}
                              </Badge>
                            ))}
                            {building.floors > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{building.floors - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Occupancy</span>
                            <span className={getOccupancyColor(occupancyRate)}>{occupancyRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                occupancyRate >= 90 ? 'bg-green-500' :
                                occupancyRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
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
                  <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No buildings found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or add a new building.</p>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}