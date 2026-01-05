import { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2, FileText, Archive, Search } from "lucide-react";
import TicketCategoryForm from "@/components/TicketCategoryForm";
import { toast } from "sonner";
import { ticketCategoriesApiService } from "@/services/ticketing_service/ticketcategoriesapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
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
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";

export default function TicketCategories() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteCategoryId, setDeleteCategoryId] = useState<
    string | number | null
  >(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [siteList, setSiteList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { withLoader } = useLoader();
  const { canRead, canWrite, canDelete } = useAuth();
  const { user, handleLogout } = useAuth();
  const resource = "ticket_categories"; // must match resource name from backend policies

  useEffect(() => {
    loadSiteLookup();
  }, []);

  useEffect(() => {
    loadTicketCategories();
  }, []);

  useSkipFirstEffect(() => {
    loadTicketCategories();
  }, [page]);

  useEffect(() => {
    updateTicketCategoriesPage();
  }, [selectedSite, searchTerm]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const updateTicketCategoriesPage = () => {
    if (page === 1) {
      loadTicketCategories();
    } else {
      setPage(1);
    }
  };

  const loadTicketCategories = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all")
      params.append("site_id", selectedSite);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await ticketCategoriesApiService.getTicketCategories(params);
    });
    if (response?.success) {
      setCategories(
        response.data?.ticket_categories || response.data?.items || []
      );
      setTotalItems(response.data?.total || 0);
    }
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleSave = async (categoryData: any) => {
    let response;
    if (formMode === "create") {
      response = await ticketCategoriesApiService.addTicketCategory(categoryData);

      if (response.success)
        loadTicketCategories();
    } else if (formMode === "edit" && selectedCategory) {
      const updatedCategory = {
        ...selectedCategory,
        ...categoryData,
        updated_at: new Date().toISOString(),
      };
      response = await ticketCategoriesApiService.updateTicketCategory(
        updatedCategory
      );

      if (response.success) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === updatedCategory.id ? response.data : cat
          )
        );
      }
    }

    if (response?.success) {
      setIsFormOpen(false);
      toast.success(
        `Ticket category has been ${formMode === "create" ? "created" : "updated"} successfully.`
      );
    }
    return response;
  };

  const handleDelete = (categoryId: string | number) => {
    setDeleteCategoryId(categoryId);
  };

  const confirmDelete = async () => {
    if (deleteCategoryId) {
      const response = await ticketCategoriesApiService.deleteTicketCategory(
        deleteCategoryId
      );

      if (response.success) {
        // Success case
        updateTicketCategoriesPage();
          setDeleteCategoryId(null);
        toast.success("Ticket category has been deleted successfully.");
        }
      }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
            {/* LEFT SIDE - Page Title*/}
            <PageHeader />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.account_type}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-sidebar-primary">
                    Ticket Categories
                  </h2>
                  <p className="text-muted-foreground">
                    Manage service ticket categories and SLA policies
                  </p>
                </div>
                {canWrite(resource) && (
                  <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                )}
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={selectedSite}
                      onValueChange={setSelectedSite}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Sites" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sites</SelectItem>
                        {siteList.map((site: any) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-md border">
                    <ContentContainer>
                      <LoaderOverlay />
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Auto-Assign Role</TableHead>
                            <TableHead>SLA Hours</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center text-muted-foreground h-32"
                              >
                                No categories found
                              </TableCell>
                            </TableRow>
                          ) : (
                            categories.map((category) => {
                            const site = siteList.find(
                              (s: any) => s.id === category.site_id
                            );
                            return (
                              <TableRow
                                key={category.id || category.category_id}
                              >
                                <TableCell className="font-medium">
                                  {category.category_name}
                                </TableCell>
                                <TableCell>
                                  {site ? site.name : category.site_id || "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {category.auto_assign_role}
                                  </Badge>
                                </TableCell>
                                <TableCell>{category.sla_hours}h</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      category.is_active
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {category.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {canWrite(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(category)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {canDelete(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDelete(
                                            category.id || category.category_id
                                          )
                                        }
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </ContentContainer>
                  </div>

                  {/* Pagination */}
                  {categories.length > 0 && (
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
        </SidebarInset>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Create Ticket Category" : formMode === "edit" ? "Edit Ticket Category" : "Ticket Category Details"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create" 
                ? "Add a new ticket category for service requests."
                : formMode === "edit"
                ? "Update ticket category details."
                : "View ticket category details."}
            </DialogDescription>
          </DialogHeader>
          <TicketCategoryForm
            category={selectedCategory}
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedCategory(null);
            }}
            onSave={handleSave}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteCategoryId}
        onOpenChange={() => setDeleteCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket category? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
