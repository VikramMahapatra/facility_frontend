import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building2,
  History,
  ArrowLeft,
  Users,
  Car,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tenant,
  Lease,
  SpaceTenants,
} from "@/interfaces/leasing_tenants_interface";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { toast } from "sonner";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadTenant = async () => {
      const response = await withLoader(async () => {
        return await tenantsApiService.getTenantById(id);
      });

      if (response?.success) {
        setTenant(response.data);
      } else {
        toast.error("Failed to load tenant details");
        navigate("/tenants");
      }
    };

    loadTenant();
  }, [id]);

  const leasesBySpace = new Map<string, Lease[]>();

  tenant?.tenant_leases?.forEach((lease) => {
    if (!lease.space_id) return;
    if (!leasesBySpace.has(lease.space_id)) {
      leasesBySpace.set(lease.space_id, []);
    }
    leasesBySpace.get(lease.space_id)!.push(lease);
  });

  const leaseBadge = (status?: Lease["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700">Active Lease</Badge>
        );
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      case "terminated":
        return <Badge className="bg-red-100 text-red-700">Terminated</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">No Lease</Badge>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const capitalizeName = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-700">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ContentContainer>
      <LoaderOverlay />
      {tenant && (
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/tenants")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                  {getInitials(tenant.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {capitalizeName(tenant.name)}
                </h1>
                <p>
                  <strong className="text-muted-foreground"></strong>{" "}
                  {tenant.kind}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/tenants/${id}/edit`)}
              >
                Edit
              </Button>
              <Button onClick={() => navigate("/leases/create")}>
                Create Lease
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="spaces">Spaces & Leases</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <strong>Email:</strong> {tenant.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <strong>Phone:</strong> {tenant.phone}
                    </p>
                    {tenant.type && (
                      <p>
                        <strong>Type:</strong> {tenant.type}
                      </p>
                    )}
                    {tenant.legal_name && (
                      <p>
                        <strong>Legal Name:</strong>{" "}
                        {capitalizeName(tenant.legal_name)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>Status:</strong>
                    </p>
                    {getStatusBadge(tenant.status)}
                  </div>
                </CardContent>
              </Card>

              {tenant.contact_info?.address &&
                (tenant.contact_info.address.line1 ||
                  tenant.contact_info.address.city ||
                  tenant.contact_info.address.state ||
                  tenant.contact_info.address.pincode) && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-2">Address</h3>
                      {tenant.contact_info.address.line1 && (
                        <p>{tenant.contact_info.address.line1}</p>
                      )}
                      {tenant.contact_info.address.line2 && (
                        <p>{tenant.contact_info.address.line2}</p>
                      )}
                      {(tenant.contact_info.address.city ||
                        tenant.contact_info.address.state ||
                        tenant.contact_info.address.pincode) && (
                        <p className="text-muted-foreground">
                          {[
                            tenant.contact_info.address.city,
                            tenant.contact_info.address.state,
                            tenant.contact_info.address.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

              {(tenant.family_info && tenant.family_info.length > 0) ||
              (tenant.vehicle_info && tenant.vehicle_info.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tenant.family_info && tenant.family_info.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5" /> Family Members
                        </h3>
                        <div className="space-y-3">
                          {tenant.family_info.map((member, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2 border rounded-md"
                            >
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {member.member
                                    ? capitalizeName(member.member)
                                    : "-"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Relation: {member.relation || "-"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tenant.vehicle_info && tenant.vehicle_info.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Car className="h-5 w-5" /> Vehicles
                        </h3>
                        <div className="space-y-3">
                          {tenant.vehicle_info.map((vehicle, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2 border rounded-md"
                            >
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-medium">
                                  Vehicle Type: {vehicle.type || "-"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Vehicle Number: {vehicle.number || "-"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : null}
            </TabsContent>

            {/* SPACES & LEASES */}
            <TabsContent value="spaces" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Assigned Spaces
                  </h3>

                  {tenant.tenant_spaces && tenant.tenant_spaces.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="text-muted-foreground">
                        <tr>
                          <th className="text-left py-2">Site</th>
                          <th className="text-left py-2">Building</th>
                          <th className="text-left py-2">Space</th>
                          {/* <th className="text-left py-2">Role</th> */}
                          <th className="text-left py-2">Lease</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenant.tenant_spaces.map(
                          (space: SpaceTenants, idx) => {
                            const leases = space.space_id
                              ? leasesBySpace.get(space.space_id)
                              : [];
                            const activeLease = leases?.find(
                              (l) => l.status === "active"
                            );

                            return (
                              <tr key={idx} className="border-t">
                                <td className="py-2">
                                  {space.site_name || "-"}
                                </td>
                                <td>{space.building_block_name || "-"}</td>
                                <td>{space.space_name || "-"}</td>
                                {/* <td>{space.role || "-"}</td> */}
                                <td>
                                  {activeLease
                                    ? leaseBadge(activeLease.status)
                                    : leaseBadge(undefined)}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-muted-foreground">No spaces assigned</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* HISTORY */}
            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <History className="h-5 w-5" /> Activity History
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {tenant.created_at && (
                      <li>
                        Tenant created on{" "}
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </li>
                    )}
                    {tenant.tenant_spaces &&
                      tenant.tenant_spaces.length > 0 && (
                        <li>Space assigned</li>
                      )}
                    {tenant.tenant_leases &&
                      tenant.tenant_leases.some(
                        (l) => l.status === "active"
                      ) && <li>Lease activated</li>}
                    {!tenant.created_at &&
                      !tenant.tenant_spaces?.length &&
                      !tenant.tenant_leases?.length && (
                        <li className="text-muted-foreground">
                          No activity history available
                        </li>
                      )}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ContentContainer>
  );
}
