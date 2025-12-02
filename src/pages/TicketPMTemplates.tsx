import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { TicketPMTemplateForm } from "@/components/TicketPMTemplateForm";
import { ticketsApiService } from "@/services/ticketing_service/ticketsapi";
import { mockTicketPMTemplates as initialMockData, TicketPMTemplate as MockTicketPMTemplate } from "@/data/mockTicketPMTemplateData";
import { Pagination } from "@/components/Pagination";
import { toast } from "sonner";
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
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";

type TicketPMTemplate = MockTicketPMTemplate;

interface TemplateOverview {
  total_templates: number;
  active_templates: number;
  due_this_week: number;
  completion_rate: number;
}

export default function TicketPMTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<any | undefined>();
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [showForm, setShowForm] = useState(false);
  const [templates, setTemplates] = useState<TicketPMTemplate[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryList, setCategoryList] = useState([]);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [templateOverview, setTemplateOverview] = useState<TemplateOverview>({
    total_templates: 0,
    active_templates: 0,
    due_this_week: 0,
    completion_rate: 0,
  });
  const { withLoader } = useLoader();

  // Store mock data in state so we can modify it
  const [mockData, setMockData] = useState<MockTicketPMTemplate[]>(initialMockData);

  useSkipFirstEffect(() => {
    loadTemplates();
    loadTemplateOverview();
  }, [page]);

  useEffect(() => {
    if (page === 1) {
      loadTemplates();
      loadTemplateOverview();
    } else {
      setPage(1);
    }
  }, [searchTerm, selectedCategory, selectedStatus, selectedFrequency]);

  useEffect(() => {
    loadCategoryLookup();
  }, []);

  const loadTemplates = () => {
    let filteredTemplates = [...mockData];

    // Apply search filter
    if (searchTerm) {
      filteredTemplates = filteredTemplates.filter(
        (template) =>
          template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "all") {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.category_id === selectedCategory
      );
    }

    // Apply status filter
    if (selectedStatus && selectedStatus !== "all") {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.status === selectedStatus
      );
    }

    // Apply frequency filter
    if (selectedFrequency && selectedFrequency !== "all") {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.frequency === selectedFrequency
      );
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    const total = filteredTemplates.length;
    const paginatedTemplates = filteredTemplates.slice(skip, skip + pageSize);

    setTemplates(paginatedTemplates);
    setTotalItems(total);
  };

  const loadTemplateOverview = () => {
    let filteredTemplates = [...mockData];

    // Apply filters
    if (searchTerm) {
      filteredTemplates = filteredTemplates.filter(
        (template) =>
          template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory && selectedCategory !== "all") {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.category_id === selectedCategory
      );
    }
    if (selectedStatus && selectedStatus !== "all") {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.status === selectedStatus
      );
    }
    if (selectedFrequency && selectedFrequency !== "all") {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.frequency === selectedFrequency
      );
    }

    const active = filteredTemplates.filter((t) => t.status === "active").length;
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueThisWeek = filteredTemplates.filter((t) => {
      if (!t.next_due) return false;
      const dueDate = new Date(t.next_due);
      return dueDate >= now && dueDate <= weekFromNow;
    }).length;

    setTemplateOverview({
      total_templates: filteredTemplates.length,
      active_templates: active,
      due_this_week: dueThisWeek,
      completion_rate: filteredTemplates.length > 0 
        ? Math.round((active / filteredTemplates.length) * 100 * 100) / 100 
        : 0,
    });
  };

  const loadCategoryLookup = async () => {
    const lookup = await ticketsApiService.getCategoryLookup();
    if (lookup.success) setCategoryList(lookup.data || []);
  };

  const handleCreate = () => {
    setSelectedTemplate(undefined);
    setFormMode("create");
    setShowForm(true);
  };

  const handleView = (template: any) => {
    setSelectedTemplate(template);
    setFormMode("view");
    setShowForm(true);
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleDelete = async (templateId: string) => {
    setDeleteTemplateId(templateId);
  };

  const confirmDelete = async () => {
    if (deleteTemplateId) {
      setMockData((prev) => prev.filter((t) => t.id !== deleteTemplateId));
      setDeleteTemplateId(null);
      toast.success("The template has been removed successfully.");
      loadTemplates();
      loadTemplateOverview();
    }
  };

  const handleSave = async (template: Partial<TicketPMTemplate>) => {
    if (formMode === "create") {
      const category = categoryList.find((c: any) => c.id === template.category_id);
      const newTemplate: TicketPMTemplate = {
        id: Date.now().toString(),
        template_name: template.template_name || "",
        pm_no: `PM${String(mockData.length + 1).padStart(3, '0')}`,
        category_id: template.category_id || "",
        category_name: category?.name || "",
        frequency: (template.frequency as any) || "monthly",
        description: template.description || "",
        assigned_to: template.assigned_to,
        assigned_to_name: template.assigned_to_name || undefined,
        priority: (template.priority as any) || "medium",
        estimated_duration: template.estimated_duration,
        status: (template.status as any) || "active",
        instructions: template.instructions,
        checklist: template.checklist,
        sla: template.sla,
        next_due: template.next_due,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setMockData((prev) => [newTemplate, ...prev]);
      setShowForm(false);
      toast.success(`Template ${template.template_name} has been created successfully.`);
      loadTemplates();
      loadTemplateOverview();
    } else if (formMode === "edit" && selectedTemplate) {
      const category = categoryList.find((c: any) => c.id === template.category_id);
      const updatedTemplate: TicketPMTemplate = {
        ...selectedTemplate,
        ...template,
        category_name: category?.name || selectedTemplate.category_name,
        updated_at: new Date().toISOString(),
      };

      setMockData((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
      );

      setShowForm(false);
      toast.success(`Template ${template.template_name} has been updated successfully.`);
      loadTemplates();
      loadTemplateOverview();
    }
    
    return { success: true };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const frequencyOptions = [
    { id: "daily", name: "Daily" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
    { id: "quarterly", name: "Quarterly" },
    { id: "yearly", name: "Yearly" },
  ];

  const statusOptions = [
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Ticket PM Templates</h1>
            </div>
          </div>

          <div className="flex-1 space-y-6 p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sidebar-primary">
                  Ticket PM Templates
                </h2>
                <p className="text-muted-foreground">
                  Schedule and manage maintenance templates
                </p>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </div>

            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search PM templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
                >
                  <option value="all">All Status</option>
                  {statusOptions.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
                >
                  <option value="all">All Frequency</option>
                  {frequencyOptions.map((frequency) => (
                    <option key={frequency.id} value={frequency.id}>
                      {frequency.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
                >
                  <option value="all">All Categories</option>
                  {categoryList.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content with Loader - Stats Cards and Table */}
              <ContentContainer>
                <LoaderOverlay />
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Templates
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {templateOverview.total_templates}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {templateOverview.active_templates}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Due This Week
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {templateOverview.due_this_week}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Completion Rate
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {templateOverview.completion_rate}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* PM Templates Table */}
                  <div className="relative rounded-md border min-h-[200px]">
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle>PM Templates</CardTitle>
                        <CardDescription>
                          Schedule and manage maintenance templates
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Template</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Categories</TableHead>
                              <TableHead>Frequency</TableHead>
                              <TableHead>SLA</TableHead>
                              <TableHead>Next Due</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {templates.map((template) => (
                              <TableRow key={template.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{template.template_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      #{template.pm_no || template.id}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{template.category_name || "No Category"}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {template.checklist && Array.isArray(template.checklist) && template.checklist.length > 0 ? (
                                      template.checklist.map((item, index) => (
                                        <div key={index} className="text-xs">
                                          <span className="font-medium">Step {item.step}:</span> {item.instruction}
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-muted-foreground text-sm">No checklist items</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {template.frequency || "No Frequency"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {template.sla ? (
                                      <>
                                        {template.sla.priority && (
                                          <Badge variant="outline" className="text-xs">
                                            {template.sla.priority}
                                          </Badge>
                                        )}
                                        {template.sla.response_hrs && (
                                          <div className="text-xs text-muted-foreground">
                                            Response: {template.sla.response_hrs}h
                                          </div>
                                        )}
                                        {template.sla.resolve_hrs && (
                                          <div className="text-xs text-muted-foreground">
                                            Resolve: {template.sla.resolve_hrs}h
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">No SLA</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {template.next_due
                                      ? new Date(template.next_due).toLocaleDateString()
                                      : "No Due Date"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      template.status === "active"
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {template.status || "inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleView(template)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(template)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(template.id)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {templates.length === 0 && (
                          <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-sidebar-primary mb-2">
                              No templates found
                            </h3>
                            <p className="text-muted-foreground">
                              Try adjusting your search criteria or add a new template.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={(newPage) => setPage(newPage)}
                  />
                </div>
              </ContentContainer>
            </div>
          </div>
        </SidebarInset>
      </div>

      <TicketPMTemplateForm
        template={selectedTemplate}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog
        open={!!deleteTemplateId}
        onOpenChange={() => setDeleteTemplateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this PM template? This action
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
