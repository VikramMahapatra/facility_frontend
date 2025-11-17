import { useEffect, useState } from "react";
import { Plus, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockRoles } from "@/data/mockRbacData";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { approvalRulesApiService } from "@/services/access_control/approvalrulesapi";
import { rolePolicyApiService } from "@/services/access_control/rolepoliciesapi";
import { ApprovalRule } from "@/interfaces/access_control_interface";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";

export default function ApprovalRules() {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approverRoleId, setApproverRoleId] = useState<string>("");
  const [canApproveRoleId, setCanApproveRoleId] = useState<string>("");
  const [roles, setRoles] = useState<any[]>([]);
  const { withLoader } = useLoader();

  useEffect(() => {
    loadApprovalRules();
    loadRoles();
  }, []);

  const loadApprovalRules = async () => {
    const response = await withLoader(async () => {
      return await approvalRulesApiService.getRules();
    });
    if (response?.success) setRules(response.data?.rules || []);
  }

  const loadRoles = async () => {
    const roleList = await withLoader(async () => {
      return await rolePolicyApiService.getRoles();
    });
    if (roleList?.success) setRoles(roleList.data || []);
  }

  const handleCreateRule = async () => {
    if (!approverRoleId || !canApproveRoleId) {
      toast.error("Please select both roles");
      return;
    }

    if (approverRoleId == canApproveRoleId) {
      toast.error("Please select different roles");
      return;
    }

    // Check if rule already exists
    const ruleExists = rules.some(
      (r) =>
        r.approver_role_id === approverRoleId &&
        r.can_approve_role_id === canApproveRoleId
    );

    if (ruleExists) {
      toast.error("This approval rule already exists");
      return;
    }

    const newRule = {
      approver_role_id: approverRoleId,
      can_approve_role_id: canApproveRoleId,
    };

    const resp = await approvalRulesApiService.createRule(newRule);

    if (resp.success) {
      loadApprovalRules();
      toast.success("Approval rule created successfully");
      setIsDialogOpen(false);
      setApproverRoleId("");
      setCanApproveRoleId("");
    }

  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
    toast.success("Approval rule deleted successfully");
  };

  // Group rules by approver role
  const groupedRules = rules.reduce((acc, rule) => {
    const approverRole = rule.approver_role_name;
    if (!acc[approverRole]) {
      acc[approverRole] = [];
    }
    acc[approverRole].push(rule);
    return acc;
  }, {} as Record<string, ApprovalRule[]>);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />

        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Approval Rules</h2>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <ContentContainer>
                <LoaderOverlay />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">Approval Rules</h1>
                      <p className="text-muted-foreground mt-1">
                        Define which roles can approve user signups for other roles
                      </p>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Approval Hierarchy</CardTitle>
                      <CardDescription>
                        Configure role-based approval permissions for new user signups
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {Object.entries(groupedRules).map(([approverRole, roleRules]) => (
                        <div key={approverRole} className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Shield className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-foreground capitalize">
                              {approverRole}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              can approve:
                            </span>
                          </div>

                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Can Approve Role</TableHead>
                                  <TableHead>Created Date</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {roleRules.map((rule) => (
                                  <TableRow key={rule.id}>
                                    <TableCell className="font-medium capitalize">
                                      {rule.can_approve_role_name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                      {new Date(rule.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteRule(rule.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                      </div>
                      ))}

                      {Object.keys(groupedRules).length === 0 && (
                        <div className="text-center py-12">
                          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            No Approval Rules
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Create rules to define approval permissions
                          </p>
                          <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Rule
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ContentContainer>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Approval Rule</DialogTitle>
            <DialogDescription>
              Define which role can approve signups for another role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approver-role">Approver Role</Label>
              <Select value={approverRoleId} onValueChange={setApproverRoleId}>
                <SelectTrigger id="approver-role">
                  <SelectValue placeholder="Select role that can approve" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <span className="capitalize">{role.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="can-approve-role">Can Approve Role</Label>
              <Select value={canApproveRoleId} onValueChange={setCanApproveRoleId}>
                <SelectTrigger id="can-approve-role">
                  <SelectValue placeholder="Select role to be approved" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <span className="capitalize">{role.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRule}>Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
