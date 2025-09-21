import { useState } from "react";
import { Building2, MapPin, Calendar, Eye, Edit, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { mockSites, getBuildingBlocks, getSpacesBySite, Site } from "@/data/mockSpacesData";

export default function Sites() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");

  const filteredSites = mockSites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind = selectedKind === "all" || site.kind === selectedKind;
    return matchesSearch && matchesKind;
  });

  const getSiteStats = (site: Site) => {
    const spaces = getSpacesBySite(site.id);
    const buildings = getBuildingBlocks(site.id);
    const occupiedSpaces = spaces.filter(s => s.status === 'occupied').length;
    const occupancyRate = spaces.length > 0 ? (occupiedSpaces / spaces.length) * 100 : 0;

    return {
      totalSpaces: spaces.length,
      totalBuildings: buildings.length,
      occupancyRate: occupancyRate.toFixed(1)
    };
  };

  const getKindColor = (kind: string) => {
    const colors = {
      residential: "bg-blue-500",
      commercial: "bg-green-500", 
      hotel: "bg-purple-500",
      mall: "bg-orange-500",
      mixed: "bg-indigo-500",
      campus: "bg-teal-500"
    };
    return colors[kind as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Sites & Buildings</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">All Sites</h2>
                  <p className="text-muted-foreground">Manage your properties and locations</p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Site
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search sites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <select
                  value={selectedKind}
                  onChange={(e) => setSelectedKind(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="hotel">Hotel</option>
                  <option value="mall">Mall</option>
                  <option value="mixed">Mixed</option>
                  <option value="campus">Campus</option>
                </select>
              </div>

              {/* Sites Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSites.map((site) => {
                  const stats = getSiteStats(site);
                  return (
                    <Card key={site.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{site.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{site.code}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${getKindColor(site.kind)}`} />
                            <Badge variant="secondary" className="text-xs capitalize">
                              {site.kind}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Address */}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            <p>{site.address.line1}</p>
                            <p>{site.address.city}, {site.address.state} {site.address.pincode}</p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-sidebar-primary">{stats.totalSpaces}</p>
                            <p className="text-muted-foreground">Spaces</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-sidebar-primary">{stats.totalBuildings}</p>
                            <p className="text-muted-foreground">Buildings</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-sidebar-primary">{stats.occupancyRate}%</p>
                            <p className="text-muted-foreground">Occupied</p>
                          </div>
                        </div>

                        {/* Status and Date */}
                        <div className="flex items-center justify-between text-xs">
                          <Badge className={getStatusColor(site.status)}>
                            {site.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Opened {new Date(site.opened_on).toLocaleDateString()}
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

              {filteredSites.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No sites found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or add a new site.</p>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}