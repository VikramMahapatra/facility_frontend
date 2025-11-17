import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2, FileText, Archive } from "lucide-react";
import TicketCategoryForm from "@/components/TicketCategoryForm";
import { useToast } from "@/hooks/use-toast";
import { ticketCategoriesApiService } from "@/services/ticketing_service/ticketcategoriesapi";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function TicketCategories() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | number | null>(null);

  useEffect(() => {
    loadTicketCategories();
  }, []);

  const loadTicketCategories = async () => {
    const response = await ticketCategoriesApiService.getTicketCategories();
    if (response.success) {
      setCategories(response.data?.ticket_categories);
    }
  };

  const handleCreate = async (data: any) => {
  const response = await ticketCategoriesApiService.addTicketCategory(data);
  
  if (response.success) {
    setIsFormOpen(false);
    loadTicketCategories();
    toast({
      title: "Category created",
      description: "Ticket category has been created successfully.",
    });
  }
  return response;
};

const handleEdit = (category: any) => {
  setEditingCategory(category);
  setIsEditOpen(true);
};

const handleEditSubmit = async (data: any) => {
  const updatedCategory = {
    ...editingCategory,
    ...data,
    updated_at: new Date().toISOString(),
  };
  const response = await ticketCategoriesApiService.updateTicketCategory(updatedCategory);
  
  if (response.success) {
    // Update the edited category in local state
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    setIsEditOpen(false);
    setEditingCategory(null);
    toast({
      title: "Category updated",
      description: "Ticket category has been updated successfully.",
    });
  }
  return response;
};

  const handleDelete = (categoryId: string | number) => {
    setDeleteCategoryId(categoryId);
  };

  const confirmDelete = async () => {
    if (deleteCategoryId) {
      const response = await ticketCategoriesApiService.deleteTicketCategory(deleteCategoryId);
      if (response.success) {
        loadTicketCategories();
        setDeleteCategoryId(null);
        toast({
          title: "Category deleted",
          description: "Ticket category has been deleted successfully.",
        });
      }
      setDeleteCategoryId(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Ticket Categories</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-sidebar-primary">Ticket Categories</h2>
                <p className="text-muted-foreground">
                  Manage service ticket categories and SLA policies
                </p>
              </div>
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Auto-Assign Role</TableHead>
                      <TableHead>SLA Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id || category.category_id}>
                        <TableCell className="font-medium">{category.category_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{category.auto_assign_role}</Badge>
                        </TableCell>
                        <TableCell>{category.sla_hours}h</TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id || category.category_id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
            <DialogTitle>Create Ticket Category</DialogTitle>
            <DialogDescription>Add a new ticket category for service requests.</DialogDescription>
          </DialogHeader>
          <TicketCategoryForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Ticket Category</DialogTitle>
            <DialogDescription>Update ticket category details.</DialogDescription>
          </DialogHeader>
          <TicketCategoryForm
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setIsEditOpen(false);
              setEditingCategory(null);
            }}
            initialData={editingCategory}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}