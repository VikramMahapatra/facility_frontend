import { useState } from "react";
import { Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  mockRoles,
  mockRolePolicies,
  availableResources,
  availableActions,
  RolePolicy,
} from "@/data/mockRbacData";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";

export default function RolePolicies() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(mockRoles[0]?.id || "");
  const [policies, setPolicies] = useState<RolePolicy[]>(mockRolePolicies);

  const selectedRole = mockRoles.find((r) => r.id === selectedRoleId);
  const rolePolicies = policies.filter((p) => p.role_id === selectedRoleId);

  const isPolicyEnabled = (resourceId: string, actionId: string) => {
    return rolePolicies.some(
      (p) => p.resource === resourceId && p.action === actionId
    );
  };

  const togglePolicy = (resourceId: string, actionId: string) => {
    const existingPolicy = rolePolicies.find(
      (p) => p.resource === resourceId && p.action === actionId
    );

    if (existingPolicy) {
      setPolicies(policies.filter((p) => p.id !== existingPolicy.id));
    } else {
      const newPolicy: RolePolicy = {
        id: `policy-${Date.now()}-${Math.random()}`,
        org_id: "org-1",
        role_id: selectedRoleId,
        resource: resourceId,
        action: actionId,
      };
      setPolicies([...policies, newPolicy]);
    }
  };

  const handleSavePolicies = () => {
    toast.success("Role policies saved successfully");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border px-6 py-4">
            <SidebarTrigger />
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
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
                  {mockRoles.map((role) => (
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
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>
                Check the boxes to grant permissions for resources and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
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
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">
                  Total permissions for <strong>{selectedRole?.name}</strong>:{" "}
                  <Badge variant="secondary">{rolePolicies.length}</Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
