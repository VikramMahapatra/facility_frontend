import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { mockSpaces, mockSpaceGroups, mockSites } from "@/data/mockSpacesData";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { spaceGroupsApiService } from "@/services/spaces_sites/spacegroupsapi";
import { spaceAssignmentApiService } from "@/services/spaces_sites/spaceassignmentsapi";

interface SpaceAssignment {
  id: string;
  site_id: string;
  group_id?: string;
  space_id?: string;
  assigned_date: string;
  assigned_by?: string;
}

interface SpaceAssignmentFormProps {
  assignment?: SpaceAssignment;
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Partial<SpaceAssignment>) => void;
  mode: 'create' | 'edit' | 'view';
}

const emptyFormData = {
  site_id: "",
  group_id: "",
  space_id: ""
}

export function SpaceAssignmentForm({ assignment, isOpen, onClose, onSave, mode }: SpaceAssignmentFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<SpaceAssignment>>(emptyFormData);
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [siteList, setSiteList] = useState([]);
  const [spaceList, setSpaceList] = useState([]);
  const [spaceGroupList, setSpaceGroupList] = useState([]);
  const [assignmentPreview, setAssignmentPreview] = useState({
    site_name: "",
    space_name: "",
    space_code: "",
    kind: "",
    group_name: "",
    specs: {
      base_rate: ""
    }
  });

  useEffect(() => {
    if (assignment) {
      setFormData(assignment);
      setSelectedSite(assignment.site_id);
    } else {
      setFormData(emptyFormData);
      setSelectedSite("all");
    }
    loadSiteLookup();
    loadSpaceLookup();
    loadSpaceGroupLookup();
  }, [assignment]);

  useEffect(() => {
    loadSpaceLookup();
    loadSpaceGroupLookup();
  }, [selectedSite]);

  useEffect(() => {
    loadSpaceGroupLookup();
  }, [formData.space_id]);

  useEffect(() => {
    loadAssignmentPreview();
  }, [formData.group_id]);


  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  }

  const loadSpaceLookup = async () => {
    const lookup = await spacesApiService.getSpaceLookup(selectedSite);
    setSpaceList(lookup);
  }

  const loadSpaceGroupLookup = async () => {
    const lookup = await spaceGroupsApiService.getSpaceGroupLookup(selectedSite, formData.space_id);
    setSpaceGroupList(lookup);
  }

  const loadAssignmentPreview = async () => {
    const preview = await spaceAssignmentApiService.getAssignmentPreview(formData.group_id, formData.space_id);
    setAssignmentPreview(preview);
  }
  // const selectedSpace = mockSpaces.find(s => s.id === formData.space_id);
  // const selectedGroup = mockSpaceGroups.find(g => g.id === formData.group_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.group_id || !formData.space_id) {
      toast({
        title: "Validation Error",
        description: "Both Space and Group must be selected",
        variant: "destructive",
      });
      return;
    }

    const space = mockSpaces.find(s => s.id === formData.space_id);
    const group = mockSpaceGroups.find(g => g.id === formData.group_id);

    if (space && group && space.kind !== group.kind) {
      toast({
        title: "Type Mismatch",
        description: "Space type must match the group type",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);

  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && "Create Space Assignment"}
            {mode === 'edit' && "Edit Space Assignment"}
            {mode === 'view' && "Assignment Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Site Filter */}
          <div>
            <Label htmlFor="site_filter">Filter by Site</Label>
            <Select
              value={selectedSite}
              onValueChange={(value) => {
                setSelectedSite(value);
                // Reset selections when site changes
                setFormData({ ...formData, space_id: "", group_id: "" });
              }}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select site to filter options" />
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
          </div>

          {/* Space Selection */}
          <div>
            <Label htmlFor="space">Space *</Label>
            <Select
              value={formData.space_id}
              onValueChange={(value) => {
                setFormData({ ...formData, space_id: value, group_id: "" });
              }}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select space" />
              </SelectTrigger>
              <SelectContent>
                {spaceList.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group Selection */}
          <div>
            <Label htmlFor="group">Space Group *</Label>
            <Select
              value={formData.group_id}
              onValueChange={(value) => setFormData({ ...formData, group_id: value })}
              disabled={isReadOnly || !formData.space_id}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.space_id ? "Select group" : "Select space first"} />
              </SelectTrigger>
              <SelectContent>
                {spaceGroupList.map((group) => (
                  <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.space_id && spaceGroupList.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                No matching groups found for this space type
              </p>
            )}
          </div>

          {/* Assignment Metadata */}
          <div>
            <Label htmlFor="assigned_by">Assigned By</Label>
            <Input
              id="assigned_by"
              value={formData.assigned_by}
              onChange={(e) => setFormData({ ...formData, assigned_by: e.target.value })}
              disabled={isReadOnly}
            />
          </div>

          {/* Preview Information */}
          {formData.group_id && assignmentPreview && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Assignment Preview:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div><strong>Space:</strong> {`${assignmentPreview.space_code} - ${assignmentPreview.space_name} (${assignmentPreview.kind})`}</div>
                <div><strong>Group:</strong> {assignmentPreview.group_name}</div>
                <div><strong>Site:</strong> {assignmentPreview.site_name}</div>
                {assignmentPreview.specs.base_rate && (
                  <div><strong>Base Rate:</strong> ₹{assignmentPreview.specs.base_rate.toLocaleString()}</div>
                )}
              </div>
            </div>
          )}

          {assignment && mode === 'view' && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Assignment Details:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div><strong>Assigned Date:</strong> {new Date(assignment.assigned_date).toLocaleString()}</div>
                <div><strong>Assigned By:</strong> {assignment.assigned_by || 'N/A'}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit">
                {mode === 'create' ? 'Create Assignment' : 'Update Assignment'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}