import { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertySidebar } from "@/components/PropertySidebar";

import { OrganizationForm } from "@/components/OrganizationForm";
import { toast } from "@/components/ui/app-toast";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "@/components/PageHeader";

interface Organization {
  id: string;
  name: string;
  legal_name: string;
  gst_vat_id?: string;
  billing_email: string;
  contact_phone?: string;
  plan: "basic" | "pro" | "enterprise";
  locale: string;
  timezone: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

export default function Organizations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | undefined>();
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { withLoader } = useLoader();
  const { canRead, canWrite, canDelete } = useAuth();
  const { user, handleLogout } = useAuth();

  const resource = "organizations";
  const isSuperAdmin = user.default_account_type === "super_admin";

  useEffect(() => {
    if (isSuperAdmin) {
      loadAllOrganisation();
    } else {
      loadOrganisation();
    }
  }, []);

  const loadOrganisation = async () => {
    const organisationObj = await withLoader(async () => {
      return await organisationApiService.getOrg();
    });
    if (organisationObj.success) setOrganizations([organisationObj.data]);
  };

  const loadAllOrganisation = async () => {
    const response = await withLoader(async () => {
      return await organisationApiService.getAllOrg();
    });
    if (response.success) setOrganizations(response.data);
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.legal_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === "all" || org.plan === selectedPlan;
    return matchesSearch && matchesPlan;
  });

  const getPlanColor = (plan: string) => {
    const colors = {
      basic: "bg-orange-300 text-orange-800",
      pro: "bg-blue-600 text-blue-100",
      enterprise: "bg-purple-600 text-purple-100",
    };
    return colors[plan as keyof typeof colors] || "bg-gray-500 text-gray-100";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleView = (org: Organization) => {
    setSelectedOrg(org);
    setFormMode("view");
    setShowForm(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormMode("edit");
    console.log("selected org", org);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedOrg(undefined);
    setFormMode("create");
    setShowForm(true);
  };

  const handleSave = async (orgData: Partial<Organization>) => {
    setIsSubmitting(true);
    let response;
    try {
      if (formMode === "create") {
        toast.error("Create functionality is not yet available.");
        setIsSubmitting(false);
        return;
      } else if (formMode === "edit" && selectedOrg) {
        const updatedOrg = {
          ...selectedOrg,
          ...orgData,
          updated_at: new Date().toISOString(),
        };
        response = await organisationApiService.update(updatedOrg);
        if (response.success) {
          setOrganizations(
            organizations.map((org) =>
              org.id === selectedOrg.id ? updatedOrg : org,
            ),
          );
        }
      }

      if (response?.success) {
        setShowForm(false);
        toast.success(
          `Organization ${orgData.name} has been updated successfully.`,
        );
      } else if (response) {
        const errorMessage =
          response?.data?.message ||
          response?.message ||
          "Failed to update organization";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error saving org:", error);
      toast.error("Failed to save organization. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
    return response;
  };

  const handleDelete = (orgId: string) => {
    setOrganizations(organizations.filter((org) => org.id !== orgId));
    toast.success("Organization has been removed successfully.");
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-sidebar-primary">
              Organizations
            </h2>
            <p className="text-muted-foreground">
              Manage hotel chains and property companies
            </p>
          </div>
          {/* {canWrite(resource) && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Organization
            </Button>
          )} */}
        </div>

        {/* Filters */}
        {isSuperAdmin && (
          <>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />

              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-sidebar-primary">
                    {organizations.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Organizations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      organizations.filter((org) => org.status === "active")
                        .length
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {
                      organizations.filter((org) => org.plan === "enterprise")
                        .length
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Enterprise</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {organizations.filter((org) => org.plan === "pro").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pro Plans</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        <ContentContainer>
          <LoaderOverlay />
          {/* Only show the Gera organization, with edit option */}
          <div
            className={
              isSuperAdmin
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
                : "w-full flex justify-center mt-16"
            }
          >
            {filteredOrganizations.length > 0 ? (
              filteredOrganizations.map((org) => (
                <div
                  key={org.id}
                  className={isSuperAdmin ? "" : "w-full max-w-4xl"}
                >
                  <Card className="hover:shadow-lg transition-shadow w-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-sidebar-primary" />
                            {org.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {org.legal_name}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getPlanColor(org.plan)}>
                            {org.plan}
                          </Badge>
                          <Badge className={getStatusColor(org.status)}>
                            {org.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {org.billing_email}
                          </span>
                        </div>
                        {org.contact_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {org.contact_phone}
                            </span>
                          </div>
                        )}
                        {org.gst_vat_id && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              GST: {org.gst_vat_id}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Created:{" "}
                          {new Date(org.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        {canWrite(resource) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(org)}
                          >
                            <Edit className="h-3 w-3" /> Edit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-sidebar-primary mb-2">
                  No organizations found
                </h3>
                <p className="text-muted-foreground">
                  You have not been assigned to any organization yet.
                </p>
              </div>
            )}
          </div>
        </ContentContainer>
      </div>
      <OrganizationForm
        organization={selectedOrg}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        mode={formMode}
      />
    </div>
  );
}
