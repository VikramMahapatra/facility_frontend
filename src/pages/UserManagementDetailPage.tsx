import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building2,
  History,
  ArrowLeft,
  Mail,
  Phone,
  UserCog,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { toast } from "sonner";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";

interface User {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  phone?: string;
  account_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  site_id?: string;
  building_block_id?: string;
  space_id?: string;
  site_ids?: string[];
  tenant_type?: string;
  staff_role?: string;
  tenant_spaces?: Array<{
    site_id: string;
    site_name?: string;
    building_block_id?: string;
    building_block_name?: string;
    space_id: string;
    space_name?: string;
    role?: string;
  }>;
}

interface Role {
  id: string;
  org_id: string;
  name: string;
  description: string;
}

export default function UserManagementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { withLoader } = useLoader();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadUser = async () => {
      const response = await withLoader(async () => {
        return await userManagementApiService.getUserById(id);
      });

      if (response?.success) {
        setUser(response.data);
      } else {
        toast.error("Failed to load user details");
        navigate("/users-management");
      }
    };

    loadUser();
  }, [id]);

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
      case "pending_approval":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            Pending Approval
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAccountTypeBadge = (accountType: string) => {
    switch (accountType?.toLowerCase()) {
      case "organization":
        return (
          <Badge className="bg-blue-100 text-blue-700">Organization</Badge>
        );
      case "individual":
        return (
          <Badge className="bg-purple-100 text-purple-700">Individual</Badge>
        );
      case "staff":
        return <Badge className="bg-orange-100 text-orange-700">Staff</Badge>;
      case "tenant":
        return <Badge className="bg-green-100 text-green-700">Tenant</Badge>;
      case "vendor":
        return <Badge className="bg-gray-100 text-gray-700">Vendor</Badge>;
      default:
        return <Badge variant="outline">{accountType}</Badge>;
    }
  };

  return (
    <ContentContainer>
      <LoaderOverlay />
      {user && (
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/users-management")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {capitalizeName(user.full_name)}
                </h1>
                <p>
                  <strong className="text-muted-foreground">
                    Account Type:
                  </strong>{" "}
                  {getAccountTypeBadge(user.account_type)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/users/${id}/edit`)}
              >
                Edit
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="spaces">Spaces & Access</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="font-semibold">{user.email}</p>
                    </div>
                    {user.phone && (
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                        <p className="font-semibold">{user.phone}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div className="font-semibold">
                        {getStatusBadge(user.status)}
                      </div>
                    </div>
                    {user.staff_role && (
                      <div>
                        <Label className="text-muted-foreground">
                          Staff Role
                        </Label>
                        <p className="font-semibold">{user.staff_role}</p>
                      </div>
                    )}
                    {user.tenant_type && (
                      <div>
                        <Label className="text-muted-foreground">
                          Tenant Type
                        </Label>
                        <p className="font-semibold">{user.tenant_type}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <UserCog className="h-4 w-4" />
                        Roles
                      </Label>
                      {user.roles && user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.roles.map((role) => (
                            <Badge key={role.id} variant="secondary">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground font-semibold">
                          No roles assigned
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SPACES & ACCESS */}
            <TabsContent value="spaces" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Assigned Spaces
                  </h3>

                  {user.tenant_spaces && user.tenant_spaces.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="text-muted-foreground">
                        <tr>
                          <th className="text-left py-2">Site</th>
                          <th className="text-left py-2">Building</th>
                          <th className="text-left py-2">Space</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.tenant_spaces.map((space, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-3">{space.site_name || "-"}</td>
                            <td>{space.building_block_name || "-"}</td>
                            <td>{space.space_name || "-"}</td>
                          </tr>
                        ))}
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
                    {user.created_at && (
                      <li>
                        User created on{" "}
                        {new Date(user.created_at).toLocaleDateString()}
                      </li>
                    )}
                    {user.updated_at && user.created_at !== user.updated_at && (
                      <li>
                        Last updated on{" "}
                        {new Date(user.updated_at).toLocaleDateString()}
                      </li>
                    )}
                    {user.tenant_spaces && user.tenant_spaces.length > 0 && (
                      <li>Spaces assigned/updated</li>
                    )}
                    {!user.created_at &&
                      !user.tenant_spaces?.length &&
                      !user.updated_at && (
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
