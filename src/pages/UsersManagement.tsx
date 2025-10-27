import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { UserForm } from "@/components/UserForm";
import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


// Define interfaces for API data
interface User {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

interface Role {
  id: string;
  org_id: string;
  name: string;
  description: string;
}
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Load users on component mount and when search changes
  useSkipFirstEffect(() => {
    loadUsers();
  }, [page]);

  useEffect(() => {
    updateUsersPage();
  }, [searchQuery]);

  const updateUsersPage = () => {
    if (page === 1) {
      loadUsers();
    } else {
      setPage(1);
    }
  };

  // Remove client-side filtering since we're using server-side pagination

  const handleCreateUser = async (values: any) => {
    try {
      await userManagementApiService.addUser(values);
      setIsFormOpen(false);
      toast.success("User created successfully");
      // Refresh the users list
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Failed to create user");
    }
  };

  const handleUpdateUser = async (values: any) => {
    if (!editingUser) return;
    try {
      console.log("form values :", values);
      const payload = {
        ...values,
        id: editingUser.id, // ✅ add id to values before sending
      };
      await userManagementApiService.updateUser(payload);
      toast.success("User updated successfully");
      setIsFormOpen(false);
      setEditingUser(undefined);
      // Refresh the users list
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;
    try {
      await userManagementApiService.deleteUser(deleteUserId);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
    } finally {
      setDeleteUserId(null);
    }
  };

  const loadUsers = async () => {
    try {
      const skip = (page - 1) * pageSize;
      const limit = pageSize;

      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      params.append("skip", String(skip));
      params.append("limit", String(limit));

      const response = await userManagementApiService.getUsers(params);
      setUsers(response?.users || response || []);
      setTotalItems(response?.total || 0);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error("Failed to load users");
    }
  };

  const handleOpenForm = (user?: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
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
            <SidebarTrigger />
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
                  <p className="text-muted-foreground mt-1">
                    Create and manage users and assign roles
                  </p>
                </div>
                <Button onClick={() => handleOpenForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Manage users and their role assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
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
                                {user.phone}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {user.roles?.map((role) => (
                                    <Badge key={role.id} variant="secondary">
                                      {role.name}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.status === "active"
                                      ? "default"
                                      : user.status === "pending_approval"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {user.status === "pending_approval" ? "Pending" : user.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenForm(user)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      onPageChange={setPage}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <UserForm
              user={editingUser}
              open={isFormOpen}
              onOpenChange={setIsFormOpen}
              onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this user? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}