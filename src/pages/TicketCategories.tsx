import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import { mockTicketCategories } from "@/data/mockTicketData";
import TicketCategoryForm from "@/components/TicketCategoryForm";
import { useToast } from "@/hooks/use-toast";

export default function TicketCategories() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const handleCreate = (data: any) => {
    toast({
      title: "Category created",
      description: "Ticket category has been created successfully.",
    });
    setIsFormOpen(false);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (data: any) => {
    toast({
      title: "Category updated",
      description: "Ticket category has been updated successfully.",
    });
    setIsEditOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (categoryId: number) => {
    toast({
      title: "Category deleted",
      description: "Ticket category has been deleted successfully.",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <Navigation />
          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Ticket Categories</h1>
                <p className="text-muted-foreground mt-1">
                  Manage service ticket categories and SLA policies
                </p>
              </div>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
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
                    {mockTicketCategories.map((category) => (
                      <TableRow key={category.category_id}>
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
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(category.category_id)}>
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
          </main>
        </div>
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
    </SidebarProvider>
  );
}
