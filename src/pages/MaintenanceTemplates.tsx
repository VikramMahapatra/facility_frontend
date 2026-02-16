import { useState, useEffect } from "react";
import {
  Wrench,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MaintenanceTemplateForm } from "@/components/MaintenanceTemplateForm";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { maintenanceTemplateApiService } from "@/services/spaces_sites/maintenanceTemplateApi";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { toast } from "sonner";
import { MaintenanceTemplate } from "@/components/MaintenanceTemplateForm";
import { getKindColor } from "@/interfaces/spaces_interfaces";

export default function MaintenanceTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCalculationType, setSelectedCalculationType] =
    useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [templates, setTemplates] = useState<MaintenanceTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MaintenanceTemplate | undefined>(undefined);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const { canRead, canWrite, canDelete } = useAuth();
  const resource = "maintenance_templates";
  const { withLoader } = useLoader();

  useSkipFirstEffect(() => {
    loadTemplates();
  }, [page]);

  useEffect(() => {
    if (page === 1) {
      loadTemplates();
    } else {
      setPage(1);
    }
  }, [searchTerm, selectedCalculationType, selectedCategory]);

  const loadTemplates = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedCalculationType && selectedCalculationType !== "all")
      params.append("calculation_type", selectedCalculationType);
    if (selectedCategory && selectedCategory !== "all")
      params.append("category", selectedCategory);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await maintenanceTemplateApiService.getMaintenanceTemplates(params);
    });

    if (response?.success) {
      const templatesData = response.data?.templates || response.data?.data || response.data || [];
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      setTotalItems(response.data?.total || response.data?.count || templatesData.length || 0);
    }
  };

  const getCalculationTypeColor = (type: string) => {
    const colors = {
      flat: "bg-blue-100 text-blue-800",
      per_sqft: "bg-green-100 text-green-800",
      per_bed: "bg-purple-100 text-purple-800",
      custom: "bg-orange-100 text-orange-800",
    };
    return (
      colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return "bg-gray-100 text-gray-800";
    return category === "residential"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  const formatCalculationType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleCreate = () => {
    setSelectedTemplate(undefined);
    setFormMode("create");
    setShowForm(true);
  };

  const handleView = (template: MaintenanceTemplate) => {
    setSelectedTemplate(template);
    setFormMode("view");
    setShowForm(true);
  };

  const handleEdit = (template: MaintenanceTemplate) => {
    setSelectedTemplate(template);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleSave = async (templateData: Partial<MaintenanceTemplate>) => {
    let response;
    if (formMode === "create") {
      response =
        await maintenanceTemplateApiService.addMaintenanceTemplate(
          templateData
        );
      if (response.success) loadTemplates();
    } else if (formMode === "edit" && selectedTemplate) {
      const updatedTemplate = {
        ...selectedTemplate,
        ...templateData,
        updated_at: new Date().toISOString(),
      };
      response =
        await maintenanceTemplateApiService.updateMaintenanceTemplate(
          updatedTemplate
        );
      if (response.success) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === updatedTemplate.id ? response.data : t
          )
        );
      }
    }

    if (response.success) {
      setShowForm(false);
    }
    return response;
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const response =
        await maintenanceTemplateApiService.deleteMaintenanceTemplate(
          deleteId
        );

      if (response.success) {
        const authResponse = response.data;
        if (authResponse.success) {
          loadTemplates();
          setDeleteId(null);
          toast.success("Maintenance template deleted successfully.");
        } else {
          toast.error(`Cannot Delete Template\n${authResponse.message}`, {
            style: { whiteSpace: "pre-line" },
          });
        }
      }
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-sidebar-primary">
              Maintenance Templates
            </h2>
            <p className="text-muted-foreground">
              Manage maintenance calculation templates
            </p>
          </div>
          {canWrite(resource) && (
            <Button className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Add New Template
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedCalculationType}
            onValueChange={setSelectedCalculationType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="per_sqft">Per Sq Ft</SelectItem>
              <SelectItem value="per_bed">Per Bed</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
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
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ContentContainer>
          <LoaderOverlay />
          {/* Templates Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              return (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {template.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">

                          {template.category && (
                            <Badge
                              className={getCategoryColor(template.category)}
                            >
                              {template.category}
                            </Badge>
                          )}
                          {template.kind && (
                            <Badge className={getKindColor(template.kind)}>
                              {template.kind.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {template.is_active !== false && (
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {template.site_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {template.calculation_type && (
                          <span className="text-muted-foreground">
                            Calculation Type:  {formatCalculationType(template.calculation_type)}
                          </span>
                        )}
                        {Number(template.amount) !== 0 && Number(template.amount) > 0 && (
                          <span className="font-semibold text-sidebar-primary">
                            ₹{template.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Site, Kind, Amount in one row */}


                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(template)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {canWrite(resource) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {canDelete(resource) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(template.id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage) => setPage(newPage)}
          />

          {templates.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-sidebar-primary mb-2">
                No maintenance templates found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or add a new template.
              </p>
            </div>
          )}
        </ContentContainer>
      </div>
      {/* Template Form Modal */}
      <MaintenanceTemplateForm
        template={selectedTemplate}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        mode={formMode}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Maintenance Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this maintenance template? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
