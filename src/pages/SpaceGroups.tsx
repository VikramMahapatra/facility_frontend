import { useState, useEffect } from "react";
import { Package, Plus, Eye, Edit, Trash2, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SpaceGroupForm } from "@/components/SpaceGroupForm";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/Pagination";
import { spaceGroupsApiService } from "@/services/spaces_sites/spacegroupsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { SpaceKind, spaceKinds } from "@/interfaces/spaces_interfaces";

export interface SpaceGroup {
  id: string;
  name: string;
  site_id: string;
  kind: SpaceKind;
  specs: {
    base_rate: 0;
    amenities: [];
  };
  group_members?: number
}

export default function SpaceGroups() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<SpaceGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedGroup, setSelectedGroup] = useState<SpaceGroup | undefined>();
  const [siteList, setSiteList] = useState([]);
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);

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

  useEffect(() => {
    loadSpaceGroups();
  }, [page]);

  useEffect(() => {
    if (page === 1) {
      loadSpaceGroups();  // already page 1 → reload
    } else {
      setPage(1);    // triggers the page effect
    }
  }, [searchTerm, selectedSite]);

  useEffect(() => {
    loadSiteLookup();
  }, []);

  const loadSpaceGroups = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite) params.append("site_id", selectedSite);
    if (selectedKind) params.append("kind", selectedKind);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await spaceGroupsApiService.getSpaceGroups(params);
    console.log("group list:", response.spaceGroups)
    setGroups(response.spaceGroups);
    setTotalItems(response.total);
  }

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

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  }

  const getSiteName = (siteId: string) => {
    const site = siteList.find(s => s.id === siteId);
    return site ? site.name : 'Unknown Site';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handlers
  const handleCreate = () => {
    setSelectedGroup(undefined);
    setFormMode("create");
    setShowForm(true);
  };

  const handleView = (group: SpaceGroup) => {
    setSelectedGroup(group);
    setFormMode("view");
    setShowForm(true);
  };

  const handleEdit = (group: SpaceGroup) => {
    setSelectedGroup(group);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (id) {
      try {
        await spaceGroupsApiService.deleteSpaceGroup(id);
        loadSpaceGroups();
        toast({
          title: "Group Deleted",
          description: "Space group removed successfully."
        });
      } catch (error) {
        toast({
          title: "Techical Error!",
          variant: "destructive",
        });
      }
    }

  };

  const handleSave = async (data: Partial<SpaceGroup>) => {
    try {
      if (formMode === "create") {
        await spaceGroupsApiService.addSpaceGroup(data);
      } else if (formMode === "edit" && selectedGroup) {
        const updatedGroup = { ...selectedGroup, ...data };
        await spaceGroupsApiService.updateSpaceGroup(updatedGroup);
      }
      loadSpaceGroups();
      setShowForm(false);
      toast({
        title: formMode === "create" ? "Group Created" : "Group Updated",
        description: `Group ${data.name} has been ${formMode === "create" ? "created" : "updated"} successfully.`,
      });

    } catch (error) {
      toast({
        title: "Techical Error!",
        variant: "destructive",
      });
    }

  };


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Space Groups & Categories</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">Space Groups</h2>
                  <p className="text-muted-foreground">Manage space categories and pricing groups</p>
                </div>
                <Button className="gap-2" onClick={handleCreate}>
                  <Plus className="h-4 w-4" />
                  Create New Group
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search groups..."
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
                  {siteList.map(site => (
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
              </div>

              {/* Groups Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => {
                  return (
                    <Card key={group.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <span className="text-xl">{getKindIcon(group.kind)}</span>
                              {group.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{getSiteName(group.site_id)}</p>
                          </div>
                          <Badge className={getKindColor(group.kind)}>
                            {group.kind.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Member Count */}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{group.group_members} spaces in this group</span>
                        </div>

                        {/* Base Rate */}
                        {group.specs.base_rate && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Base Rate: {formatCurrency(group.specs.base_rate)}/month
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(group)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(group)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(group.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Pagination
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={(newPage) => setPage(newPage)}
              />
              {groups.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No space groups found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or create a new group.</p>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>

      <SpaceGroupForm
        group={selectedGroup}
        isOpen={showForm}
        mode={formMode}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
      />
    </SidebarProvider>
  );
}
