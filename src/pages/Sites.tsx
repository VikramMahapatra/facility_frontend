import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  mockSites,
  getBuildingBlocks,
  getSpacesBySite,
} from "@/data/mockSpacesData";
import { SiteForm } from "@/components/SiteForm";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { toast } from "sonner";

export interface Site {
  id: string;
  org_id: string;
  name: string;
  code: string;
  kind: "residential" | "commercial" | "hotel" | "mall" | "mixed" | "campus";
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  geo: { lat: number; lng: number };
  opened_on: string;
  status: "active" | "inactive";
  total_spaces?: string;
  buildings?: string;
  occupied_percent?: string;
  created_at: string;
  updated_at: string;
}

export default function Sites() {
  // const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | undefined>(undefined);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const { canRead, canWrite, canDelete } = useAuth(); 
  const resource = "sites"; // must match resource name from backend policies
  const {withLoader} = useLoader();

  useSkipFirstEffect(() => {
    loadSites();
  }, [page]);

  useEffect(() => {
    if (page === 1) {
      loadSites();
    } else {
      setPage(1); // triggers the page effect
    }
  }, [searchTerm, selectedKind]);

  const loadSites = async () => {
      const skip = (page - 1) * pageSize;
      const limit = pageSize;

      // build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedKind) params.append("kind", selectedKind);
      params.append("skip", skip.toString());
      params.append("limit", limit.toString());

        const response = await withLoader(async () => {
        return await siteApiService.getSites(params);
      });

      if (response?.success) {
        setSites(response.data?.sites || []);
        setTotalItems(response.data?.total || 0);
      }
  };

  const getKindColor = (kind: string) => {
    const colors = {
      residential: "bg-blue-500",
      commercial: "bg-green-500",
      hotel: "bg-purple-500",
      mall: "bg-orange-500",
      mixed: "bg-indigo-500",
      campus: "bg-teal-500",
    };
    return colors[kind as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  // Handlers
  const handleCreate = () => {
    setSelectedSite(null);
    setFormMode("create");
    setShowForm(true);
  };

  const handleView = (site: Site) => {
    setSelectedSite(site);
    setFormMode("view");
    setShowForm(true);
  };

  const handleEdit = (site: Site) => {
    setSelectedSite(site);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleSave = async (siteData: Partial<Site>) => {
    let response;
    if (formMode === "create") {
      response = await siteApiService.addSite(siteData);
    } else if (formMode === "edit" && selectedSite) {
      const updatedSite = {
        ...selectedSite,
        ...siteData,
        updated_at: new Date().toISOString(),
      };
      response = await siteApiService.update(updatedSite);
    }

    if (response.success) {
      setShowForm(false);
      loadSites();
      toast.success(
        `Site ${siteData.code} has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  // In Site.tsx - Replace the confirmDelete function
  const confirmDelete = async () => {
    if (deleteId) {
      const response = await siteApiService.deleteSite(deleteId);

      if (response.success) {
        const authResponse = response.data;
        if (authResponse.success) {
          // Success - refresh data
          loadSites();
          setDeleteId(null);
          toast.success("The site has been removed successfully.");
        } else {
          // Show error popup from backend
          toast.error(`Cannot Delete Site\n${authResponse.message}`, {
            style: { whiteSpace: "pre-line" },
          });
        }
      }
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
              <Building2 className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">
                Sites & Buildings
              </h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">
                    All Sites
                  </h2>
                  <p className="text-muted-foreground">
                    Manage your properties and locations
                  </p>
                </div>
                <Button className="gap-2" onClick={handleCreate}>
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

              <ContentContainer>
                <LoaderOverlay />
                {/* Sites Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sites.map((site) => {
                  return (
                    <Card
                      key={site.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {site.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {site.code}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-3 h-3 rounded-full ${getKindColor(
                                site.kind
                              )}`}
                            />
                            <Badge
                              variant="secondary"
                              className="text-xs capitalize"
                            >
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
                            <p>
                              {site.address.city}, {site.address.state}{" "}
                              {site.address.pincode}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-sidebar-primary">
                              {site.total_spaces}
                            </p>
                            <p className="text-muted-foreground">Spaces</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-sidebar-primary">
                              {site.buildings}
                            </p>
                            <p className="text-muted-foreground">Buildings</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-sidebar-primary">
                              {site.occupied_percent}%
                            </p>
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
                            Opened{" "}
                            {new Date(site.opened_on).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(site)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {canWrite(resource) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(site)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {canDelete(resource) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(site.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
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

              {sites.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sidebar-primary mb-2">
                    No sites found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or add a new site.
                  </p>
                </div>
              )}
              </ContentContainer>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Site Form Modal */}
      <SiteForm
        site={selectedSite}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        mode={formMode}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Site</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this site? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
