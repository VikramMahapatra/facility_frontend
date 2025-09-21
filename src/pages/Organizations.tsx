import { useEffect, useState } from "react";
import { Building2, Plus, Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { OrganizationForm } from "@/components/OrganizationForm";
import { useToast } from "@/hooks/use-toast";
import { organisationApiService } from "@/services/organisationapi";

// Mock organization data
const mockOrganizations = [
  {
    id: "org-gera",
    name: "Gera",
    legal_name: "Gera Developers Pvt Ltd",
    gst_vat_id: "27AAACG1234X1Z1",
    billing_email: "billing@gera.com",
    contact_phone: "+91-2022212345",
    plan: "pro" as const,
    locale: "en-IN",
    timezone: "Asia/Kolkata",
    status: "active" as const,
    created_at: "2022-06-15T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  }
];

interface Organization {
  id: string;
  name: string;
  legal_name: string;
  gst_vat_id?: string;
  billing_email: string;
  contact_phone?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  locale: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export default function Organizations() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadOrganisation();
  }, []);

  const loadOrganisation = async () => {
    const organisationObj = await organisationApiService.getOrg()
    setOrganizations([organisationObj]);
  }

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.legal_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === "all" || org.plan === selectedPlan;
    return matchesSearch && matchesPlan;
  });

  const getPlanColor = (plan: string) => {
    const colors = {
      basic: "bg-gray-100 text-gray-800",
      pro: "bg-blue-100 text-blue-800",
      enterprise: "bg-purple-100 text-purple-800"
    };
    return colors[plan as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleView = (org: Organization) => {
    setSelectedOrg(org);
    setFormMode('view');
    setShowForm(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormMode('edit');
    console.log("selected org", org);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedOrg(undefined);
    setFormMode('create');
    setShowForm(true);
  };

  const handleSave = async (orgData: Partial<Organization>) => {
    try {
      if (formMode === 'create') {
        const newOrg: Organization = {
          id: `org-${Date.now()}`,
          name: orgData.name!,
          legal_name: orgData.legal_name!,
          gst_vat_id: orgData.gst_vat_id,
          billing_email: orgData.billing_email!,
          contact_phone: orgData.contact_phone,
          plan: orgData.plan!,
          locale: orgData.locale!,
          timezone: orgData.timezone!,
          status: orgData.status!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setOrganizations([...organizations, newOrg]);
      } else if (formMode === 'edit' && selectedOrg) {
        const updatedOrg = {
          ...selectedOrg,
          ...orgData,
          updated_at: new Date().toISOString()
        }
        await organisationApiService.update(updatedOrg);
        setOrganizations(organizations.map(org =>
          org.id === selectedOrg.id ? updatedOrg : org
        ));
      }
      setShowForm(false);

      toast({
        title: formMode === 'create' ? "Organization Created" : "Organization Updated",
        description: `Organization ${orgData.name} has been ${formMode === 'create' ? 'created' : 'updated'} successfully.`,
      });
    }
    catch (error) {
      console.error('Error saving org:', error);
    }
  };

  const handleDelete = (orgId: string) => {
    setOrganizations(organizations.filter(org => org.id !== orgId));
    toast({
      title: "Organization Deleted",
      description: "Organization has been removed successfully.",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Organizations</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">Organizations</h2>
                  <p className="text-muted-foreground">Manage hotel chains and property companies</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Organization
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />

                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Plans</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">{organizations.length}</div>
                    <p className="text-sm text-muted-foreground">Total Organizations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {organizations.filter(org => org.status === 'active').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {organizations.filter(org => org.plan === 'enterprise').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Enterprise</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {organizations.filter(org => org.plan === 'pro').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Pro Plans</p>
                  </CardContent>
                </Card>
              </div>


              {/* Only show the Gera organization, with edit option */}
              <div className="max-w-xl mx-auto">
                {filteredOrganizations.length > 0 ? (
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-sidebar-primary" />
                            {filteredOrganizations[0].name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{filteredOrganizations[0].legal_name}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getPlanColor(filteredOrganizations[0].plan)}>
                            {filteredOrganizations[0].plan}
                          </Badge>
                          <Badge className={getStatusColor(filteredOrganizations[0].status)}>
                            {filteredOrganizations[0].status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{filteredOrganizations[0].billing_email}</span>
                        </div>
                        {filteredOrganizations[0].contact_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{filteredOrganizations[0].contact_phone}</span>
                          </div>
                        )}
                        {filteredOrganizations[0].gst_vat_id && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">GST: {filteredOrganizations[0].gst_vat_id}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {new Date(filteredOrganizations[0].created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(filteredOrganizations[0])}>
                          <Edit className="h-3 w-3" /> Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No organizations found</h3>
                    <p className="text-muted-foreground">You have not been assigned to any organization yet.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      <OrganizationForm
        organization={selectedOrg}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        mode={formMode}
      />
    </SidebarProvider>
  );
}