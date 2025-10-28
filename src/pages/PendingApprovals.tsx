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
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { pendingApprovalApiService } from "@/services/access_control/pendingapprovalapi";
import { Pagination } from "@/components/Pagination";
import { ApprovalRule, User } from "@/interfaces/access_control_interface";
import { approvalRulesApiService } from "@/services/access_control/approvalrulesapi";


export default function PendingApprovals() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(5); // items per page
  const [totalItems, setTotalItems] = useState(0);

  useSkipFirstEffect(() => {
    loadUsersForApproval();
  }, [page]);

  useEffect(() => {
    loadUsersForApproval();
    loadApprovalRules();
  }, []);

  const loadApprovalRules = async () => {
    const response = await approvalRulesApiService.getRules();
    setApprovalRules(response.rules);
  }

  const loadUsersForApproval = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await pendingApprovalApiService.getUsers(params);
    setUsers(response.users);
    setTotalItems(response.total);
  }


  // Check if current user can approve a specific user based on their roles
  const canApprove = (user: User): boolean => {
    const userData = localStorage.getItem('loggedInUser');
    const currentUser = JSON.parse(userData);

    if (!user.roles?.length) return false;
    if (!currentUser.roles?.length) return false;

    const currentUserRoleIds = currentUser.roles.map(r => r.id);

    // Check if at least one logged-in role can approve all target user's roles
    return currentUserRoleIds.some(currentRoleId =>
      user.roles.every(userRole =>
        approvalRules.some(
          rule =>
            rule.approver_role_id === currentRoleId &&
            rule.can_approve_role_id === userRole.id
        )
      )
    );
  };

  const handleApprove = (user: User) => {
    setSelectedUser(user);
    setActionType('approve');
  };

  const handleReject = (user: User) => {
    setSelectedUser(user);
    setActionType('reject');
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    await pendingApprovalApiService.updateUser({ user_id: selectedUser.id, status: actionType })

    if (actionType === 'approve') {
      toast.success(`User ${selectedUser.full_name} has been approved`);
    } else {
      toast.success(`User ${selectedUser.full_name} has been rejected`);
    }

    setSelectedUser(null);
    setActionType(null);
    loadUsersForApproval();
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
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Pending User Approvals</h2>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
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
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Requested Roles</TableHead>
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
                                    {user.roles?.map((role) => (
                                      <Badge key={role.id} variant="outline">
                                        {role.name}
                                      </Badge>
                                    ))}
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

      <AlertDialog open={!!selectedUser && !!actionType} onOpenChange={() => {
        setSelectedUser(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve User' : 'Reject User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? `Are you sure you want to approve ${selectedUser?.full_name}? They will gain access to the system with their assigned roles.`
                : `Are you sure you want to reject ${selectedUser?.full_name}? Their registration request will be permanently deleted.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
