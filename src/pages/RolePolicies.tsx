import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { rolePolicyApiService } from "@/services/access_control/rolepoliciesapi";

export interface RolePolicy {
  role_id: string;
  resource: string;
  action: string;
  condition?: any;
}

export const availableResources = [
  // ================= Overview =================
  { id: "dashboard", label: "Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "ai_predictions", label: "AI Predictions" },

  // =============== Spaces & Sites ===============
  { id: "organizations", label: "Organizations" },
  { id: "sites", label: "Sites (Properties)" },
  { id: "buildings", label: "Buildings (Wings/Towers)" },
  { id: "space_groups", label: "Space Groups (Templates)" },
  { id: "spaces", label: "Spaces" },
  { id: "group_assignments", label: "Group Assignments" },

  // ============ Leasing & Tenants ============
  { id: "leases", label: "Leases" },
  { id: "tenants", label: "Tenants" },
  { id: "lease_charges", label: "Lease Charges" },

  // =============== Financials ===============
  { id: "invoices", label: "Invoices & Payments" },
  { id: "revenue_reports", label: "Revenue Reports" },
  { id: "tax_management", label: "Tax Management" },

  // ========= Maintenance & Assets ==========
  { id: "assets", label: "Assets" },
  { id: "work_orders", label: "Work Orders" },
  { id: "service_requests", label: "Service Requests" },
  { id: "preventive_maintenance", label: "Preventive Maintenance" },

  // =============== Hospitality ===============
  { id: "bookings", label: "Bookings" },
  { id: "guests", label: "Guests" },
  { id: "rate_plans", label: "Rate Plans" },
  { id: "folios", label: "Folios" },
  { id: "housekeeping", label: "Housekeeping" },

  // =============== Procurement ===============
  { id: "vendors", label: "Vendors" },
  { id: "contracts", label: "Contracts" },

  // ========== Parking & Access ==========
  { id: "parking_zones", label: "Parking Zones" },
  { id: "access_logs", label: "Access Logs" },
  { id: "visitors", label: "Visitor Management" },

  // ============= Energy & IoT =============
  { id: "meter_readings", label: "Meters & Readings" },
  { id: "consumption_reports", label: "Consumption Reports" },

  // ============= AI & Automation =============
  { id: "ai_chatbot", label: "AI ChatBot" },

  // ============= Access Control =============
  { id: "roles", label: "Roles Management" },
  { id: "role_policies", label: "Role Policies" },
  { id: "users_management", label: "Users Management" },
  { id: "pending_approvals", label: "Pending Approvals" },
  { id: "approval_rules", label: "Approval Rules" },

  // ================= System =================
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Settings" },
  { id: "documentation", label: "Documentation" },
];


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

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    loadRolePolicies();
    setSelectedRole(roles.find((r) => r.id === selectedRoleId));
  }, [selectedRoleId]);

  const loadRoles = async () => {
    const roleList = await rolePolicyApiService.getRoles()
    setRoles(roleList);
    setSelectedRoleId(roleList[0]?.id || "");
  }

  const loadRolePolicies = async () => {
    if (selectedRoleId) {
      const response = await rolePolicyApiService.getRolePolicies(selectedRoleId)
      setPolicies(response.policies);
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
    try {
      await rolePolicyApiService.savePolicies(selectedRoleId, policies);
      toast.success("Role policies saved successfully");
    } catch (error) {
      toast.error("Technical error!")
    }
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
                        <Badge variant="secondary">{policies.length}</Badge>
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
