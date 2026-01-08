import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Shield } from "lucide-react";
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
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { RoleForm } from "@/components/RoleForm";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { roleManagementApiService } from "@/services/access_control/role_managementapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { Pagination } from "@/components/Pagination";
import { Role } from "@/interfaces/role_management";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();


  useSkipFirstEffect(() => {
    loadRoleManagement();
  }, [page]);

  useEffect(() => {
    updateRoleManagementPage();
  }, [searchTerm]);

  const updateRoleManagementPage = () => {
    if (page === 1) {
      loadRoleManagement();
    } else {
      setPage(1);
    }
  }

  const loadRoleManagement = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await roleManagementApiService.getRoleManagement(params);
    });
    if (response?.success) {
      setRoles(response?.data?.roles || []);
      setTotalItems(response?.data?.total || 0);
    }
  };

  const handleCreate = () => {
    setSelectedRole(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleDelete = (roleId: string) => {
    setDeleteRoleId(roleId);
  };

  const confirmDelete = async () => {
    if (deleteRoleId) {
      const response = await roleManagementApiService.deleteRoleManagement(deleteRoleId);
      if (response?.success) {
        setRoles((prev) => prev.filter((role) => role.id !== deleteRoleId));
        setTotalItems((prev) => prev - 1);
        toast.success("Role deleted successfully");
        setDeleteRoleId(null);
      }
    }
  };

  const handleSave = async (roleData: any) => {
    let response;
    if (selectedRole) {
      const updatedRole = {
        ...selectedRole,
        ...roleData,
        updated_at: new Date().toISOString(),
      };
      response = await roleManagementApiService.updateRoleManagement(updatedRole);

      if (response?.success) {
        setRoles((prev) =>
          prev.map((r) => (r.id === updatedRole.id ? response.data : r))
        );
        setIsFormOpen(false);
        toast.success("Role updated successfully");
      }
    } else {
      response = await roleManagementApiService.addRoleManagement(roleData);

      if (response?.success) {
        const newRole = response?.data?.role || response?.data || {
          id: response?.data?.id || Date.now().toString(),
          ...roleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (page === 1 && roles.length < pageSize) {
          setRoles((prev) => [newRole as Role, ...prev]);
          setTotalItems((prev) => prev + 1);
        } else if (page === 1) {
          setRoles((prev) => [newRole as Role, ...prev.slice(0, pageSize - 1)]);
          setTotalItems((prev) => prev + 1);
        } else {
          setTotalItems((prev) => prev + 1);
        }
        setIsFormOpen(false);
        toast.success("Role created successfully");
      }
    }

    if (!response?.success && response) {
      const errorMessage = response?.data?.message || response?.message || "Failed to save role";
      toast.error(errorMessage);
    }
    return response;
  };

  return (
    <div className="relative  flex-1 ">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Roles</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage user roles for your organization
            </p>
          </div>
          <Button onClick={() => handleCreate()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>

        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="relative rounded-md border">
          <ContentContainer>
            <LoaderOverlay />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No roles found
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {role.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || "No description"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(role)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(role.id)}
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
          </ContentContainer>
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
      </div>

      <RoleForm
        role={selectedRole}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave} mode={"view"} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
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
    </div>
  );
}