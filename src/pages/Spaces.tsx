import { useState, useEffect } from "react";
import {
  Home,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
} from "lucide-react";
import { LogOut } from "lucide-react";
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
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SpaceForm } from "@/components/SpaceForm";
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
import { Pagination } from "@/components/Pagination";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import {
  getKindColor,
  getKindIcon,
  getStatusColor,
  SpaceKind,
  spaceKinds,
} from "@/interfaces/spaces_interfaces";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { useNavigate } from "react-router-dom";

export interface Space {
  id: string;
  org_id: string;
  site_id: string;
  site_name?: string;
  name?: string;
  kind: SpaceKind;
  floor?: string;
  building_block_id?: string;
  building_block?: string;
  area_sqft?: number;
  beds?: number;
  baths?: number;
  attributes: Record<string, any>;
  status: "available" | "occupied" | "out_of_service";
  created_at: string;
  updated_at: string;
  owner_name: string;
}

interface SpaceOverview {
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  outOfServices: number;
}

export default function Spaces() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | undefined>();
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteSpaceId, setDeleteSpaceId] = useState<string | null>(null);
  const [siteList, setSiteList] = useState([]);
  const [spaceOverview, setSpaceOverview] = useState<SpaceOverview>({
    totalSpaces: 0,
    availableSpaces: 0,
    occupiedSpaces: 0,
    outOfServices: 0,
  });

  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  const resource = "spaces";

  useSkipFirstEffect(() => {
    loadSpaces();
    loadSpaceOverView();
  }, [page]);

  useEffect(() => {
    updateSpacePage();
  }, [searchTerm, selectedSite, selectedKind, selectedStatus]);

  useEffect(() => {
    loadSiteLookup();
  }, []);

  const updateSpacePage = () => {
    if (page === 1) {
      loadSpaces();
      loadSpaceOverView();
    } else {
      setPage(1); // triggers the page effect
    }
  };
  const loadSpaceOverView = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite) params.append("site_id", selectedSite);
    if (selectedKind) params.append("kind", selectedKind);
    if (selectedStatus) params.append("status", selectedStatus);

    const response = await spacesApiService.getSpaceOverview(params);
    if (response.success) setSpaceOverview(response.data || {});
  };

  const loadSpaces = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite) params.append("site_id", selectedSite);
    if (selectedKind) params.append("kind", selectedKind);
    if (selectedStatus) params.append("status", selectedStatus);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await spacesApiService.getSpaces(params);
    });

    if (response?.success) {
      setSpaces(response.data?.spaces || []);
      setTotalItems(response.data?.total || 0);
    }
  };
  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const handleCreate = () => {
    setSelectedSpace(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleView = (space: Space) => {
    navigate(`/spaces/${space.id}`);
  };

  const handleEdit = (space: Space) => {
    setSelectedSpace(space);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDelete = (spaceId: string) => {
    setDeleteSpaceId(spaceId);
  };

  const confirmDelete = async () => {
    if (deleteSpaceId) {
      const response = await spacesApiService.deleteSpace(deleteSpaceId);

      if (response.success) {
        // Success case
        updateSpacePage();
        setDeleteSpaceId(null);
        toast.success("Space has been deleted successfully.");
      }
    }
  };
  const handleSave = async (spaceData: Partial<Space>) => {
    let response;
    const attributes = spaceData.attributes ? { ...spaceData.attributes } : {};
    if (
      attributes.star_rating === "" ||
      attributes.star_rating === "0" ||
      !attributes.star_rating
    ) {
      delete attributes.star_rating;
    }
    console.log("Show space data ", spaceData);
    const spaceToSave = {
      ...spaceData,
      building_block_id:
        spaceData.building_block_id != "none"
          ? spaceData.building_block_id
          : undefined,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    };

    if (formMode === "create") {
      // Remove star_rating from attributes if it's empty or "0"

      response = await spacesApiService.addSpace(spaceToSave);

      if (response.success) updateSpacePage();
    } else if (formMode === "edit" && selectedSpace) {
      const updatedSpace = {
        ...selectedSpace,
        ...spaceToSave,
      };

      response = await spacesApiService.updateSpace(updatedSpace);

      if (response.success) {
        // Update the edited space in local state
        loadSpaceOverView();
        setSpaces((prev) =>
          prev.map((s) => (s.id === updatedSpace.id ? response.data : s)),
        );
      }
    }

    if (response?.success) {
      setIsFormOpen(false);
      toast.success(
        `Space ${spaceData.name} has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`,
      );
    }
    return response;
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-sidebar-primary">
              All Spaces
            </h2>
            <p className="text-muted-foreground">
              Manage all spaces across your properties
            </p>
          </div>
          {canWrite(resource) && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Space
            </Button>
          )}
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

          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {siteList.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedKind} onValueChange={setSelectedKind}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {spaceKinds.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {kind
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="out_of_service">Out of Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ContentContainer>
          <LoaderOverlay />
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-sidebar-primary">
                  {spaceOverview.totalSpaces}
                </div>
                <p className="text-sm text-muted-foreground">Total Spaces</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {spaceOverview.availableSpaces}
                </div>
                <p className="text-sm text-muted-foreground">Available</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {spaceOverview.occupiedSpaces}
                </div>
                <p className="text-sm text-muted-foreground">Occupied</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {spaceOverview.outOfServices}
                </div>
                <p className="text-sm text-muted-foreground">Out of Service</p>
              </CardContent>
            </Card>
          </div>

          {/* Spaces Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {spaces.map((space) => (
              <Card
                key={space.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-xl">
                          {getKindIcon(space.kind)}
                        </span>
                        {space.name}
                      </CardTitle>
                    </div>
                    <Badge className={getStatusColor(space.status)}>
                      {space.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Kind and Location */}
                  <div className="flex items-center justify-between">
                    <Badge className={getKindColor(space.kind)}>
                      {space.kind.replace("_", " ")}
                    </Badge>
                    {Number(space.area_sqft) > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {space.area_sqft} sq ft
                      </div>
                    )}
                  </div>

                  {/* Location Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {space.site_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {space.building_block && (
                        <span className="text-muted-foreground">
                          Block: {space.building_block}
                        </span>
                      )}
                      {Number(space.floor) !== 0 && Number(space.floor) > 0 && (
                        <span className="text-muted-foreground">
                          Floor: {space.floor}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bed/Bath info for residential */}
                  {(Number(space.beds) > 0 || Number(space.baths) > 0) && (
                    <div className="flex items-center gap-4 text-sm">
                      {Number(space.beds) > 0 && (
                        <span className="text-muted-foreground">
                          🛏️ {space.beds} beds
                        </span>
                      )}
                      {Number(space.baths) > 0 && (
                        <span className="text-muted-foreground">
                          🚿 {space.baths} baths
                        </span>
                      )}
                    </div>
                  )}

                  {/* Key Attributes */}
                  {space.attributes &&
                    Object.keys(space.attributes || {}).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(space.attributes || {})
                          .filter(([key, value]) => {
                            if (
                              key === "star_rating" &&
                              (!value || value === "" || value === "0")
                            ) {
                              return false;
                            }
                            return (
                              value !== undefined &&
                              value !== null &&
                              value !== ""
                            );
                          })
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className="text-xs"
                            >
                              {key}: {String(value)}
                            </Badge>
                          ))}
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(space)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {canWrite(resource) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(space)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {canDelete(resource) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(space.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage) => setPage(newPage)}
          />
          {spaces.length === 0 && (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-sidebar-primary mb-2">
                No spaces found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or add a new space.
              </p>
            </div>
          )}
        </ContentContainer>
      </div>
      <SpaceForm
        space={selectedSpace}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog
        open={!!deleteSpaceId}
        onOpenChange={() => setDeleteSpaceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Space</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this space? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
