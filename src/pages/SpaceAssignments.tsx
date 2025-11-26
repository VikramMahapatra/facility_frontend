import { useState, useEffect } from "react";
import { Link2, Plus, Eye, Edit, Trash2, Building2, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SpaceAssignmentForm } from "@/components/SpaceAssignmentForm";
import { Space } from "@/pages/Spaces";
import { toast } from "sonner";
import { spaceAssignmentApiService } from "@/services/spaces_sites/spaceassignmentsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { SpaceGroup } from "./SpaceGroups";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";

interface SpaceAssignment {
  id: string;
  group_id: string;
  space_id: string;
  site_id: string;
  site_name: string;
  space: Space;
  group: SpaceGroup;
  assigned_date: string;
  assigned_by?: string;
}
interface MemberOverview {
  totalAssignments: number;
  groupUsed: number;
  spaceAssigned: number;
  assignmentRate?: number;
}

export default function SpaceAssignments() {
  const { withLoader } = useLoader();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [assignments, setAssignments] = useState<SpaceAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<SpaceAssignment | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [showForm, setShowForm] = useState(false);
  const [siteList, setSiteList] = useState([]);
  const [memberOverview, setMemberOverview] = useState<MemberOverview>({
    totalAssignments: 0,
    groupUsed: 0,
    spaceAssigned: 0,
    assignmentRate: 0
  });
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(3); // items per page
  const [totalItems, setTotalItems] = useState(0);

  useSkipFirstEffect(() => {
    loadSpaceAssignments();
    loadSpaceAsignmentOverView();
  }, [page]);

  useEffect(() => {
    updateSpaceAssignmentPage();
  }, [searchTerm, selectedSite]);

  useEffect(() => {
    loadSiteLookup();
  }, []);

  const updateSpaceAssignmentPage = () => {
    if (page === 1) {
      loadSpaceAssignments();
      loadSpaceAsignmentOverView();
    } else {
      setPage(1);    // triggers the page effect
    }
  }

  const loadSpaceAsignmentOverView = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all") params.append("site_id", selectedSite);
    const response = await withLoader(async () => {
      return await spaceAssignmentApiService.getAssignmentOverview(params);
    });
    if (response?.success) {
      setMemberOverview(response.data || {
        totalAssignments: 0,
        groupUsed: 0,
        spaceAssigned: 0,
        assignmentRate: 0
      });
    }
  }

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup?.success) {
      setSiteList(lookup.data || []);
    } else {
      setSiteList([]);
    }
  }

  const loadSpaceAssignments = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all") params.append("site_id", selectedSite);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await withLoader(async () => {
      return await spaceAssignmentApiService.getAssignments(params);
    });
    if (response?.success) {
      setAssignments(response.data?.assignments || response.data || []);
      setTotalItems(response.data?.total || 0);
    } else {
      setAssignments([]);
      setTotalItems(0);
    }
  }

  // Get assignment details
  const getAssignmentDetails = (assignment: SpaceAssignment) => {
    return { space: assignment.space, group: assignment.group };
  };

  const getKindColor = (kind: string) => {
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
    return colors[kind as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleView = (assignment: SpaceAssignment) => {
    setSelectedAssignment(assignment);
    setFormMode('view');
    setShowForm(true);
  };

  const handleEdit = (assignment: SpaceAssignment) => {
    setSelectedAssignment(assignment);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedAssignment(undefined);
    setFormMode('create');
    setShowForm(true);
  };

  const handleSave = async (assignmentData: Partial<SpaceAssignment>) => {
    let response;
    const assignmentToSave = {
      space_id: assignmentData.space_id,
      group_id: assignmentData.group_id,
      assigned_by: assignmentData.assigned_by,
    };

    if (formMode === 'create') {
      response = await spaceAssignmentApiService.addAssignment(assignmentToSave);

      if (response.success) updateSpaceAssignmentPage();
    } else if (formMode === 'edit' && selectedAssignment) {
      const updatedAssignment = {
        ...selectedAssignment,
        ...assignmentToSave,
      };
      response = await spaceAssignmentApiService.updateAssignment(updatedAssignment);

      if (response.success) updateSpaceAssignmentPage();
    }

    if (response?.success) {
      setShowForm(false);
      toast.success(
        `Space assignment has been ${formMode === 'create' ? 'created' : 'updated'} successfully.`
      );
    }
    return response;
  };

  const handleDelete = (assignmentId: string) => {
    if (Array.isArray(assignments)) {
    setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
      toast.success("Space assignment has been removed successfully.");
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
              <Link2 className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Space Group Assignments</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">Space Group Assignments</h2>
                  <p className="text-muted-foreground">Link spaces to their respective groups and templates</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search assignments..."
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
                  {Array.isArray(siteList) && siteList.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">{Array.isArray(assignments) ? assignments.length : 0}</div>
                    <p className="text-sm text-muted-foreground">Total Assignments</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{memberOverview.groupUsed}</div>
                    <p className="text-sm text-muted-foreground">Groups Used</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{memberOverview.spaceAssigned}</div>
                    <p className="text-sm text-muted-foreground">Spaces Assigned</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {memberOverview.assignmentRate}%
                    </div>
                    <p className="text-sm text-muted-foreground">Assignment Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Assignments Grid */}
              <ContentContainer>
                <LoaderOverlay />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.isArray(assignments) && assignments.map((assignment) => {
                  const { space, group } = getAssignmentDetails(assignment);

                  if (!space || !group) return null;

                  return (
                    <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Link2 className="h-5 w-5 text-sidebar-primary" />
                              {space.code}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{space.name || 'Unnamed Space'}</p>
                          </div>
                          <Badge className={getKindColor(space.kind)}>
                            {space.kind.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Group Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{group.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{assignment.site_name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {space.building_block && `${space.building_block}, `}
                              {space.floor && `Floor ${space.floor}`}
                            </span>
                          </div>
                        </div>

                        {/* Space Details */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-center p-2 bg-muted rounded">
                            <p className="font-semibold">{space.area_sqft || 'N/A'}</p>
                            <p className="text-muted-foreground text-xs">Sq Ft</p>
                          </div>
                          {space.beds && (
                            <div className="text-center p-2 bg-muted rounded">
                              <p className="font-semibold">{space.beds}BR/{space.baths}BA</p>
                              <p className="text-muted-foreground text-xs">Config</p>
                            </div>
                          )}
                        </div>

                        {/* Group Pricing */}
                        {group.specs.base_rate > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Base Rate: </span>
                            <span className="font-medium">
                              ₹{group.specs.base_rate}
                              {space.kind === 'apartment' ? '/month' : '/month'}
                            </span>
                          </div>
                        )}

                        {/* Assignment Metadata */}
                        <div className="text-xs text-muted-foreground">
                          <div>Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}</div>
                          {assignment.assigned_by && <div>By: {assignment.assigned_by}</div>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(assignment)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(assignment)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this assignment? This will unlink {space.code} from {group.name}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(assignment.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              </ContentContainer>
              <Pagination
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={(newPage) => setPage(newPage)}
              />
              {(!Array.isArray(assignments) || assignments.length === 0) && (
                <div className="text-center py-12">
                  <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No assignments found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or create a new assignment.</p>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>

      <SpaceAssignmentForm
        assignment={selectedAssignment}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        mode={formMode}
      />
    </SidebarProvider>
  );
}