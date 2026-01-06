import { useEffect, useState } from "react";
import { Check, X, Clock, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogOut, } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { pendingApprovalApiService } from "@/services/access_control/pendingapprovalapi";
import { Pagination } from "@/components/Pagination";
import { ApprovalRule, User } from "@/interfaces/access_control_interface";
import { approvalRulesApiService } from "@/services/access_control/approvalrulesapi";
import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";


export default function PendingApprovals() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [roleList, setRoleList] = useState<any[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [roleValidationError, setRoleValidationError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(5); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();


  useSkipFirstEffect(() => {
    loadUsersForApproval();
  }, [page]);

  useEffect(() => {
    loadUsersForApproval();
    loadApprovalRules();
  }, []);

  const loadApprovalRules = async () => {
    const response = await withLoader(async () => {
      return await approvalRulesApiService.getRules();
    });
    if (response?.success) setApprovalRules(response.data?.rules || []);
  }

  const loadRolesLookup = async () => {
    const lookup = await userManagementApiService.getUserRolesLookup();
    if (lookup?.success) setRoleList(lookup.data || []);
  }

  const loadUsersForApproval = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await withLoader(async () => {
      return await pendingApprovalApiService.getUsers(params);
    });

    if (response?.success) {
      setUsers(response.data?.users ?? []);
      setTotalItems(response.data?.total ?? 0);
    }
  }


  // Check if current user can approve a specific user based on their roles
  const canApprove = (user: User): boolean => {
    const userData = localStorage.getItem('loggedInUser');
    const currentUser = JSON.parse(userData);

    console.log("user data", userData);
    console.log("current user", currentUser);

    if (!user.account_type?.length) return false;
    if (!currentUser.account_type?.length) return false;

    // Check if at least one logged-in role can approve all target user's roles
    return approvalRules.some(rule =>
      currentUser.account_type.includes(rule.approver_type) &&
      user.account_type.includes(rule.can_approve_type)
    );
  };

  const handleApprove = async (user: User) => {
    setSelectedUser(user);
    setActionType('approve');
    setSelectedRoleIds(user.roles?.map(r => r.id) || []);
    setIsApproveDialogOpen(true);
    await loadRolesLookup();
  };

  const handleReject = (user: User) => {
    setSelectedUser(user);
    setActionType('reject');
  };

  const confirmApprove = async () => {
    if (!selectedUser || isSubmitting) return;

    // Validate that at least one role is selected
    if (selectedRoleIds.length === 0) {
      setRoleValidationError("At least one role must be selected");
      return;
    }

    setRoleValidationError("");
    setIsSubmitting(true);

    const resp = await pendingApprovalApiService.updateUser({
      user_id: selectedUser.id,
      status: 'approve',
      role_ids: selectedRoleIds
    })

    if (resp?.success) {
      toast.success("User has been approved successfully.");
      setIsApproveDialogOpen(false);
      setSelectedUser(null);
      setActionType(null);
      setSelectedRoleIds([]);
      setRoleValidationError("");
      loadUsersForApproval();
    } else {
      const errorMessage = resp?.data?.message || resp?.message || "Failed to approve user";
      toast.error(errorMessage);
    }
    setIsSubmitting(false);
  };

  const confirmReject = async () => {
    if (!selectedUser) return;

    const resp = await pendingApprovalApiService.updateUser({ user_id: selectedUser.id, status: 'reject' })

    if (resp?.success) {
      toast.success("User has been rejected successfully.");
      setSelectedUser(null);
      setActionType(null);
      loadUsersForApproval();
    } else {
      const errorMessage = resp?.data?.message || resp?.message || "Failed to reject user";
      toast.error(errorMessage);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />

        <div className="flex-1 flex flex-col">
          <PageHeader />
          <main className="relative  flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Pending Approvals</h1>
                  <p className="text-muted-foreground mt-1">
                    Review and approve new user registration requests
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {users.length} Pending
                </Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>User Approval Queue</CardTitle>
                  <CardDescription>
                    Users awaiting approval to access the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <Check className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        All Caught Up!
                      </h3>
                      <p className="text-muted-foreground">
                        No pending user approvals at this time
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-md border">
                      <ContentContainer>
                        <LoaderOverlay />
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Requested Type</TableHead>
                              <TableHead>Requested Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => {
                              const userCanApprove = canApprove(user);
                              return (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarFallback>
                                          {getInitials(user.full_name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{user.full_name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {user.email}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {user.phone || "—"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      <Badge variant="outline">
                                        {user.account_type}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {new Date(user.created_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      {userCanApprove ? (
                                        <>
                                          <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleApprove(user)}
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                            Approve
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleReject(user)}
                                          >
                                            <X className="h-4 w-4 mr-1" />
                                            Reject
                                          </Button>
                                        </>
                                      ) : (
                                        <Badge variant="secondary">
                                          No Permission
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </ContentContainer>
                    </div>
                  )}

                  {users.length > 0 && (
                    <div className="mt-4">
                      <Pagination
                        page={page}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Approve Dialog with Role Selection */}
      <Dialog open={isApproveDialogOpen} onOpenChange={(open) => {
        setIsApproveDialogOpen(open);
        if (!open) {
          setSelectedUser(null);
          setActionType(null);
          setSelectedRoleIds([]);
          setRoleValidationError("");
          setIsSubmitting(false);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve User - {selectedUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assign Roles *</Label>
              <div className="space-y-2 border rounded-md p-4 max-h-48 overflow-y-auto">
                {roleList.map((role) => {
                  const isChecked = selectedRoleIds.includes(role.id);
                  return (
                    <div key={role.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoleIds([...selectedRoleIds, role.id]);
                            setRoleValidationError(""); // Clear error when role is selected
                          } else {
                            const newSelectedIds = selectedRoleIds.filter((id) => id !== role.id);
                            setSelectedRoleIds(newSelectedIds);
                            // Show validation error if no roles are selected after unchecking
                            if (newSelectedIds.length === 0) {
                              setRoleValidationError("At least one role must be selected");
                            } else {
                              setRoleValidationError(""); // Clear error if roles still selected
                            }
                          }
                        }}
                      />
                      <div className="space-y-0">
                        <Label className="font-medium cursor-pointer">
                          {role.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {role.description || "no description"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {roleValidationError && (
                <p className="text-sm text-red-500">{roleValidationError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveDialogOpen(false);
                setSelectedUser(null);
                setActionType(null);
                setSelectedRoleIds([]);
                setRoleValidationError("");
                setIsSubmitting(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Alert Dialog */}
      <AlertDialog open={!!selectedUser && actionType === 'reject'} onOpenChange={() => {
        setSelectedUser(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {selectedUser?.full_name}? Their registration request will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject}>
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
