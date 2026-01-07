import { useEffect, useState } from "react";
import { Save, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { rolePolicyApiService } from "@/services/access_control/rolepoliciesapi";
import { navigationItems } from "@/data/navigationItems";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";

export interface RolePolicy {
  role_id: string;
  resource: string;
  action: string;
  condition?: any;
}

export const availableResources = navigationItems
  .flatMap(section => section.items) // flatten all sections
  .filter(item => item.resource)     // ensure it has a resource
  .map(item => ({
    id: item.resource,
    label: item.title
  }));


export const availableActions = [
  { id: "read", label: "View/Read" },
  { id: "write", label: "Create/Edit" },
  { id: "delete", label: "Delete" },
  { id: "approve", label: "Approve" },
  { id: "export", label: "Export" }
];

export default function RolePolicies() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [policies, setPolicies] = useState<RolePolicy[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>({});
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    loadRolePolicies();
    setSelectedRole(roles.find((r) => r.id === selectedRoleId));
  }, [selectedRoleId]);

  const loadRoles = async () => {
    const roleList = await withLoader(async () => {
      return await rolePolicyApiService.getRoles();
    });
    if (roleList?.success) {
      setRoles(roleList.data || []);
      setSelectedRoleId(roleList.data?.[0]?.id || "");
    }
  }

  const loadRolePolicies = async () => {
    if (selectedRoleId) {
      const response = await withLoader(async () => {
        return await rolePolicyApiService.getRolePolicies(selectedRoleId);
      });
      if (response?.success) setPolicies(response.data.policies || []);
    }
  }

  const isPolicyEnabled = (resourceId: string, actionId: string) => {
    return policies.some(
      (p) => p.resource === resourceId && p.action === actionId
    );
  };

  const togglePolicy = (resourceId: string, actionId: string) => {
    const existingPolicy = policies.find(
      (p) => p.resource === resourceId && p.action === actionId
    );

    if (existingPolicy) {
      setPolicies(
        policies.filter(
          (p) =>
            !(p.resource === resourceId && p.action === actionId)
        )
      );
    } else {
      const newPolicy: RolePolicy = {
        role_id: selectedRoleId,
        resource: resourceId,
        action: actionId,
      };
      setPolicies([...policies, newPolicy]);
    }
  };

  const handleSavePolicies = async () => {
    const response = await rolePolicyApiService.savePolicies(selectedRoleId, policies);
    if (response.success) {
      toast.success("Role policies saved successfully");
    }
  };

  const areAllPoliciesSelected = () => {
    const totalPolicies = availableResources.length * availableActions.length;
    return policies.length === totalPolicies;
  };

  const toggleAllPolicies = () => {
    if (areAllPoliciesSelected()) {
      // Uncheck all - clear all policies
      setPolicies([]);
    } else {
      // Check all - create policies for all resource-action combinations
      const allPolicies: RolePolicy[] = [];
      availableResources.forEach((resource) => {
        availableActions.forEach((action) => {
          allPolicies.push({
            role_id: selectedRoleId,
            resource: resource.id,
            action: action.id,
          });
        });
      });
      setPolicies(allPolicies);
    }
  };

  return (
    <div className="flex-1 ">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Role Policies</h1>
              <p className="text-muted-foreground mt-1">
                Configure menu visibility and action permissions for each role
              </p>
            </div>
            <Button onClick={handleSavePolicies}>
              <Save className="h-4 w-4 mr-2" />
              Save Policies
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Role</CardTitle>
              <CardDescription>Choose a role to configure its permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Shield className="h-5 w-5 text-primary" />
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRole && (
                  <Badge variant="outline">{selectedRole.description}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedRoleId && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Permissions Matrix</CardTitle>
                    <CardDescription>
                      Check the boxes to grant permissions for resources and actions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={areAllPoliciesSelected()}
                      onCheckedChange={toggleAllPolicies}
                      id="assign-all"
                    />
                    <Label
                      htmlFor="assign-all"
                      className="cursor-pointer text-sm font-medium"
                    >
                      Assign All
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-md border">
                  <ContentContainer>
                    <LoaderOverlay />
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-48">Resource / Menu</TableHead>
                          {availableActions.map((action) => (
                            <TableHead key={action.id} className="text-center">
                              {action.label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableResources.map((resource) => (
                          <TableRow key={resource.id}>
                            <TableCell className="font-medium">
                              {resource.label}
                            </TableCell>
                            {availableActions.map((action) => (
                              <TableCell key={action.id} className="text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={isPolicyEnabled(resource.id, action.id)}
                                    onCheckedChange={() =>
                                      togglePolicy(resource.id, action.id)
                                    }
                                  />
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ContentContainer>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    Total permissions for <strong>{selectedRole?.name}</strong>:{" "}
                    <Badge variant="secondary">{policies.length}</Badge>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
