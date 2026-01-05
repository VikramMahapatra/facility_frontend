import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Play,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { Pagination } from "@/components/Pagination";
import { preventiveMaintenanceApiService } from "@/services/maintenance_assets/preventive_maintenanceapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { PMTemplateForm } from "@/components/PMTemplateForm";
//import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
interface PMTemplate {
  id: string;
  name: string;
  pm_no?: string;
  category_id?: string;
  asset_category?: string;
  frequency?: string;
  next_due?: string;
  checklist?: any;
  meter_metric?: string;
  threshold?: number;
  sla?: any;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface PMTemplateOverview {
  total_templates: number;
  active_templates: number;
  due_this_week: number;
  completion_rate: number;
}

export default function PreventiveMaintenance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [templates, setTemplates] = useState<PMTemplate[]>([]);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<
    PMTemplate | undefined
  >();
  const [templateOverview, setTemplateOverview] = useState<PMTemplateOverview>(
    {
      total_templates: 0,
      active_templates: 0,
      due_this_week: 0,
      completion_rate: 0,
    }
  );
  const [statusList, setStatusList] = useState([]);
  const [frequencyList, setFrequencyList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  //const { canRead, canWrite, canDelete } = useAuth();
  //const resource = "pm_templates";
  useSkipFirstEffect(() => {
    loadTemplates();
    loadTemplateOverview();
  }, [page]);

  useEffect(() => {
    loadStatusLookup();
    loadFrequencyLookup();
    loadCategoryLookup();
  }, []);

  useEffect(() => {
    updateTemplatePage();
  }, [searchTerm, selectedCategory, selectedStatus, selectedFrequency]);

  const updateTemplatePage = () => {
    if (page === 1) {
      loadTemplates();
      loadTemplateOverview();
    } else {
      setPage(1); 
    }
  };

  const loadTemplateOverview = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);

    if (selectedCategory && selectedCategory !== "all")
      params.append("category_id", selectedCategory);

    if (selectedStatus && selectedStatus !== "all")
      params.append("status", selectedStatus);
    
    if (selectedFrequency && selectedFrequency !== "all")
      params.append("frequency", selectedFrequency);
    
    const response = await preventiveMaintenanceApiService.getPreventiveMaintenanceOverview(params);
    if (response?.success) setTemplateOverview(response.data || {});
  };

  const loadStatusLookup = async () => {
      const lookup = await preventiveMaintenanceApiService.getPmFilterStatusLookup();
      if (lookup.success) setStatusList(lookup.data || []); 
  };

  const loadFrequencyLookup = async () => {
    const lookup = await preventiveMaintenanceApiService.getPmFilterFrequencyLookup();
    if (lookup.success) setFrequencyList(lookup.data || []);
  };

  const loadCategoryLookup = async () => {
    const lookup = await preventiveMaintenanceApiService.getPreventiveMaintenanceCategoryLookup();
    if (lookup.success) setCategoryList(lookup.data || []);
  };

  const loadTemplates = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    
    if (selectedCategory && selectedCategory !== "all")

      params.append("category_id", selectedCategory);
    if (selectedStatus && selectedStatus !== "all")

      params.append("status", selectedStatus);
    if (selectedFrequency && selectedFrequency !== "all")
      params.append("frequency", selectedFrequency);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await preventiveMaintenanceApiService.getPreventiveMaintenance(params);
    });

    if (response?.success) {
      setTemplates(response.data?.templates || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  // Form handlers
  const handleCreate = () => {
    setSelectedTemplate(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (template: PMTemplate) => {
    setSelectedTemplate(template);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleView = (template: PMTemplate) => {
    setSelectedTemplate(template);
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleDelete = (templateId: string) => {
    setDeleteTemplateId(templateId);
  };

  const confirmDelete = async () => {
    if (deleteTemplateId) {
      const response = await preventiveMaintenanceApiService.deletePreventiveMaintenance(deleteTemplateId);
      if (response.success) {
        updateTemplatePage();
        setDeleteTemplateId(null);
        toast.success("PM Template deleted successfully");
      }
    }
  };

  const handleSave = async (templateData: any) => {
    let response;
    if (formMode === "create") {
      response = await preventiveMaintenanceApiService.addPreventiveMaintenance(templateData);
      if (response.success) updateTemplatePage();
      loadTemplateOverview(); 
    } else if (formMode === "edit" && selectedTemplate) {
      const updatedTemplate = {
        ...selectedTemplate,
        ...templateData,
      };
      response = await preventiveMaintenanceApiService.updatePreventiveMaintenance(updatedTemplate);
      if (response.success) {
        loadTemplateOverview();
        setTemplates((prev) =>
          prev.map((t) => (t.id === updatedTemplate.id ? response.data : t))
        );
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast.success(
        `PM Template has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">

            {/* LEFT SIDE - Page Title*/}
                       <PageHeader />

            {/* RIGHT SIDE */}
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


          <div className="flex-1 space-y-6 p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sidebar-primary">
                  Preventive Maintenance
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
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusList.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedFrequency}
                  onValueChange={setSelectedFrequency}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequency</SelectItem>
                    {frequencyList.map((frequency) => (
                      <SelectItem key={frequency.id} value={frequency.id}>
                        {frequency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryList.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                                  <div className="font-medium">{template.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    #{template.pm_no || template.id}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{template.asset_category || "No Category"}</Badge>
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
                                      : template.status === "completed"
                                      ? "secondary"
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
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {/*canWrite(resource) &&*/ }<Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(template)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  {/*}*/ }
                                  {/*canDelete(resource) &&*/ }<Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(template.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  {/*}*/ }
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      onPageChange={(newPage) => setPage(newPage)}
                    />
                  </div>
                </div>
              </ContentContainer>
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* PM Template Form */}
      <PMTemplateForm
        template={selectedTemplate}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PM Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this PM template? This action cannot be undone.
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