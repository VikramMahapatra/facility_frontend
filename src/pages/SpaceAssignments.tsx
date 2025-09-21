import { useState } from "react";
import { Link2, Plus, Eye, Edit, Trash2, Building2, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SpaceAssignmentForm } from "@/components/SpaceAssignmentForm";
import { mockSpaces, mockSpaceGroups, mockSites, mockSpaceGroupMembers } from "@/data/mockSpacesData";
import { useToast } from "@/hooks/use-toast";

interface SpaceAssignment {
  id: string;
  group_id: string;
  space_id: string;
  assigned_date: string;
  assigned_by?: string;
}

// Extend mockSpaceGroupMembers to include assignment metadata
const mockAssignments: SpaceAssignment[] = mockSpaceGroupMembers.map((member, index) => ({
  id: `assignment-${index + 1}`,
  group_id: member.group_id,
  space_id: member.space_id,
  assigned_date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  assigned_by: "Admin"
}));

export default function SpaceAssignments() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [assignments, setAssignments] = useState<SpaceAssignment[]>(mockAssignments);
  const [selectedAssignment, setSelectedAssignment] = useState<SpaceAssignment | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [showForm, setShowForm] = useState(false);

  // Get assignment details
  const getAssignmentDetails = (assignment: SpaceAssignment) => {
    const space = mockSpaces.find(s => s.id === assignment.space_id);
    const group = mockSpaceGroups.find(g => g.id === assignment.group_id);
    const site = space ? mockSites.find(s => s.id === space.site_id) : undefined;
    
    return { space, group, site };
  };

  const filteredAssignments = assignments.filter(assignment => {
    const { space, group, site } = getAssignmentDetails(assignment);
    const matchesSearch = space?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSite === "all" || site?.id === selectedSite;
    return matchesSearch && matchesSite;
  });

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

  const handleSave = (assignmentData: Partial<SpaceAssignment>) => {
    if (formMode === 'create') {
      const newAssignment: SpaceAssignment = {
        id: `assignment-${Date.now()}`,
        group_id: assignmentData.group_id!,
        space_id: assignmentData.space_id!,
        assigned_date: new Date().toISOString(),
        assigned_by: assignmentData.assigned_by || "Admin"
      };
      setAssignments([...assignments, newAssignment]);
    } else if (formMode === 'edit' && selectedAssignment) {
      setAssignments(assignments.map(assignment =>
        assignment.id === selectedAssignment.id ? { ...assignment, ...assignmentData } : assignment
      ));
    }
    setShowForm(false);
  };

  const handleDelete = (assignmentId: string) => {
    setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
    toast({
      title: "Assignment Deleted",
      description: "Space assignment has been removed successfully.",
    });
  };

  // Get unique groups for stats
  const uniqueGroups = new Set(assignments.map(a => a.group_id)).size;
  const uniqueSpaces = new Set(assignments.map(a => a.space_id)).size;

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
                  {mockSites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">{assignments.length}</div>
                    <p className="text-sm text-muted-foreground">Total Assignments</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{uniqueGroups}</div>
                    <p className="text-sm text-muted-foreground">Groups Used</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{uniqueSpaces}</div>
                    <p className="text-sm text-muted-foreground">Spaces Assigned</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {((uniqueSpaces / mockSpaces.length) * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Assignment Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Assignments Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => {
                  const { space, group, site } = getAssignmentDetails(assignment);
                  
                  if (!space || !group || !site) return null;

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
                            <span className="text-sm text-muted-foreground">{site.name}</span>
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
                        {group.specs.base_rate && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Base Rate: </span>
                            <span className="font-medium">
                              ₹{group.specs.base_rate.toLocaleString()}
                              {space.kind === 'apartment' ? '/month' : space.kind === 'row_house' ? '/month' : '/month'}
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

              {filteredAssignments.length === 0 && (
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