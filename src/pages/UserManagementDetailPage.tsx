import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  UserCog,
  Building,
  UserPlus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Pencil,
  Shield,
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
  org_name?: string;
  account_types?: Array<{
    account_type: string;
    user_org_id: string;
    org_id: string;
    organization_name: string;
    is_default: boolean;
  }>;
  tenant_spaces?: Array<{
    site_id: string;
    site_name?: string;
    building_block_id?: string;
    building_block_name?: string;
    space_id: string;
    space_name?: string;
    role?: string;
    status?: string;
    is_primary?: boolean;
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
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [isAccountListExpanded, setIsAccountListExpanded] = useState(false);

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
        return <Badge className="bg-purple-100 text-purple-700">Tenant</Badge>;
      case "vendor":
        return <Badge className="bg-gray-100 text-gray-700">Vendor</Badge>;
      case "residential":
        return (
          <Badge className="bg-green-100 text-green-700">Residential</Badge>
        );
      case "service provider":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            Service Provider
          </Badge>
        );
      default:
        return <Badge variant="outline">{accountType}</Badge>;
    }
  };

  const getSpaceStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSwitchAccount = async (accountType: {
    account_type: string;
    user_org_id: string;
    org_id: string;
    organization_name: string;
    is_default: boolean;
  }) => {
    if (accountType.is_default) {
      toast.info("This is already your active account");
      return;
    }

    setIsSwitchingAccount(true);
    try {
      toast.success(`Switching to ${accountType.organization_name}...`);

      // Reload user data after switching
      if (id) {
        const response = await withLoader(async () => {
          return await userManagementApiService.getUserById(id);
        });
        if (response?.success) {
          setUser(response.data);
        }
      }
    } catch (error) {
      toast.error("Failed to switch account");
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const showSwitchAccount =
    user?.account_types && user.account_types.length > 1;

  return (
    <ContentContainer>
      <LoaderOverlay />
      {user && (
        <div className="space-y-8">
          {/* BACK + HEADER ROW */}
          <div className="flex items-start gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/users-management")}
              className="mt-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {/* HEADER + SIDE INFO */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-8 ">
              {/* LEFT: USER HEADER */}
              <div className="xl:col-span-2">
                <div className="rounded-xl bg-muted/30 ">
                  <div className="flex items-start gap-6">
                    {/* Square Avatar */}
                    <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-primary/80 
                            flex items-center justify-center shadow-lg ring-4 ring-primary/10">
                      <span className="text-3xl font-bold text-primary-foreground">
                        {getInitials(user.full_name)}
                      </span>
                    </div>

                    {/* Header Content */}
                    <div className="flex-1 space-y-3">
                      {/* Name + Edit */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-semibold leading-tight">
                          {capitalizeName(user.full_name)}
                        </h1>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            navigate(`/users-management/${id}/edit`)
                          }
                          className="top-6 right-6 h-8 px-3"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {getAccountTypeBadge(user.account_type)}
                        {getStatusBadge(user.status)}
                      </div>


                      {/* Switch Account */}
                      {showSwitchAccount && (
                        <div className="pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSwitchingAccount}
                            className="text-primary p-0 h-auto font-normal"
                            onClick={() =>
                              setIsAccountListExpanded(!isAccountListExpanded)
                            }
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Switch Account
                            {isAccountListExpanded ? (
                              <ChevronUp className="h-4 w-4 ml-2" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ml-2" />
                            )}
                          </Button>

                          {isAccountListExpanded &&
                            user.account_types?.length > 1 && (
                              <div className="mt-3 space-y-2">
                                {/* existing account cards */}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Contact Information & Roles & Account */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5" /> Contact Information
                </h3>
                <div className="space-y-5">
                  <div>
                    <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                      <Mail className="h-4 w-4" />
                      Email
                    </span>
                    <p className="font-semibold text-base">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                        <Phone className="h-4 w-4" />
                        Phone
                      </span>
                      <p className="font-semibold text-base">{user.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Roles & Account */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Roles & Account
                </h3>
                <div className="space-y-5">
                  <div>
                    <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                      <UserCog className="h-4 w-4" />
                      Roles
                    </span>
                    {user.roles && user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => {
                          const getRoleBadgeColor = (roleName: string) => {
                            const name = roleName?.toLowerCase();
                            if (name === "tenant") {
                              return "bg-purple-100 text-purple-700";
                            }

                            if (name === "staff") {
                              return "bg-orange-100 text-orange-700";
                            }
                            if (name === "vendor") {
                              return "bg-gray-100 text-gray-700";
                            }
                            if (name === "organization") {
                              return "bg-orange-100 text-orange-700";
                            }
                            if (name === "individual") {
                              return "bg-purple-100 text-purple-700";
                            }
                            return "bg-blue-100 text-blue-700";
                          };
                          return (
                            <Badge
                              key={role.id}
                              className={getRoleBadgeColor(role.name)}
                            >
                              {role.name}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground font-semibold">
                        No roles assigned
                      </p>
                    )}
                  </div>
                  {user.org_name && (
                    <div>
                      <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                        <Building className="h-4 w-4" />
                        Organization
                      </span>
                      <p className="font-semibold text-base">{user.org_name}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                      <UserPlus className="h-4 w-4" />
                      User ID
                    </span>
                    <p className="font-semibold text-sm font-mono">
                      {user.id.slice(0, 20)}..
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spaces & Access */}
          {user.account_type.toLowerCase() === "tenant" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Spaces & Access
              </h3>

              {user.tenant_spaces && user.tenant_spaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.tenant_spaces.map((space, idx) => (
                    <Card
                      key={idx}
                      className="hover:shadow-lg transition-all border"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <Building className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-lg">
                                  {space.site_name || "N/A"}
                                </p>
                                {space.is_primary && (
                                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2 py-0.5">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {space.building_block_name || "N/A"}
                              </p>
                              <p className="text-base font-medium text-foreground">
                                {space.space_name || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="pt-1">
                            {getSpaceStatusBadge(space.status)}
                          </div>
                        </div>
                        {space.role && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-3 border-t">
                            <UserPlus className="h-4 w-4" />
                            <span className="font-medium">
                              Access: {space.role}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-sm">
                  <CardContent className="p-8">
                    <p className="text-muted-foreground text-center text-base">
                      No spaces assigned
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </ContentContainer>
  );
}
