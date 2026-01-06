import { useState, useEffect } from "react";
import { Package, Plus, Eye, Edit, Trash2, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SpaceGroupForm } from "@/components/SpaceGroupForm";
import { toast } from "sonner";
import { Pagination } from "@/components/Pagination";
import { spaceGroupsApiService } from "@/services/spaces_sites/spacegroupsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { SpaceKind, spaceKinds } from "@/interfaces/spaces_interfaces";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { PageHeader } from "@/components/PageHeader";


export interface SpaceGroup {
  id: string;
  name: string;
  site_id: string;
  kind: SpaceKind;
  specs: {
    base_rate: number;
    amenities: string[];
  };
  group_members?: number
}

export default function SpaceGroups() {
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
  const [deleteSpaceGroupId, setDeleteSpaceGroupId] = useState<string | null>(null);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  const resource = "space_groups";

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

  useSkipFirstEffect(() => {
    loadSpaceGroups();
  }, [page]);

  useEffect(() => {
    if (page === 1) {
      loadSpaceGroups();
    } else {
      setPage(1);    // triggers the page effect
    }
  }, [searchTerm, selectedSite, selectedKind]);

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

    const response = await withLoader(async () => {
      return await spaceGroupsApiService.getSpaceGroups(params);
    });
    if (response?.success) {
      setGroups(response.data?.spaceGroups || []);
      setTotalItems(response.data?.total || 0);
    }
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
    if (lookup.success) setSiteList(lookup.data || []);
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
    setDeleteSpaceGroupId(id);
  };

  const confirmDelete = async () => {
    if (deleteSpaceGroupId) {
      const response = await spaceGroupsApiService.deleteSpaceGroup(deleteSpaceGroupId);
      if (response.success) {
        const authResponse = response.data;
        if (authResponse?.success) {
          // Success - refresh data
          loadSpaceGroups();
          setDeleteSpaceGroupId(null);
          toast.success("The space group has been removed successfully.");
        } else {
          // Show error popup from backend
          toast.error(`Cannot Delete Space Group\n${authResponse?.message || "Unknown error"}`, {
            style: { whiteSpace: "pre-line" },
          });
        }
      }
    }
  };
  const handleSave = async (data: Partial<SpaceGroup>) => {
    let response;
    if (formMode === "create") {
      response = await spaceGroupsApiService.addSpaceGroup(data);

      if (response.success)
        loadSpaceGroups();
    } else if (formMode === "edit" && selectedGroup) {
      const updatedGroup = {
        ...selectedGroup,
        ...data,
        updated_at: new Date().toISOString(),
      };
      response = await spaceGroupsApiService.updateSpaceGroup(updatedGroup);

      if (response.success) {
        // Update the edited group in local state
        setGroups((prev) =>
          prev.map((g) => (g.id === updatedGroup.id ? response.data : g))
        );
      }
    }

    if (response.success) {
      setShowForm(false);
      toast.success(
        `Group ${data.name} has been ${formMode === "create" ? "created" : "updated"} successfully.`
      );
    }
    return response;
  };


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <PageHeader />

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">Space Groups</h2>
                  <p className="text-muted-foreground">Manage space categories and pricing groups</p>
                </div>
                {canWrite(resource) && (
                  <Button className="gap-2" onClick={handleCreate}>
                    <Plus className="h-4 w-4" />
                    Create New Group
                  </Button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />

                <Select
                  value={selectedSite}
                  onValueChange={setSelectedSite}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {siteList.map(site => (
                      <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedKind}
                  onValueChange={setSelectedKind}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {spaceKinds.map(kind => (
                      <SelectItem key={kind} value={kind}>{kind.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ContentContainer>
                <LoaderOverlay />
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
                            <span className="text-sm font-medium">{group.group_members} assignments in this group</span>
                          </div>

                          {/* Base Rate */}
                          {group.specs.base_rate > 0 && (
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
                            {canWrite(resource) && <Button size="sm" variant="outline" onClick={() => handleEdit(group)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            }
                            {canDelete(resource) && <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(group.id)}>

                              <Trash2 className="h-3 w-3" />
                            </Button>
                            }
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
              </ContentContainer>
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
      <AlertDialog open={!!deleteSpaceGroupId} onOpenChange={() => setDeleteSpaceGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Space</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this space group? This action cannot be undone.
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
