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
import AccountCard from "@/components/userdetails/AccountCard";
import { User, UserAccount } from "@/interfaces/user_interface";
import AccountEditModal from "@/components/userdetails/UserAccountEditModal";
import { useAuth } from "@/context/AuthContext";


export default function UserManagementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { withLoader } = useLoader();
  const [user, setUser] = useState<User | null>(null);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [isAccountListExpanded, setIsAccountListExpanded] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [accountMode, setAccountMode] = useState<"create" | "edit">("create");

  const resolvedUserId = id ?? authUser.id;

  useEffect(() => {
    if (!resolvedUserId) return;

    const loadUser = async () => {
      const response = await withLoader(async () => {
        return await userManagementApiService.getUserById(resolvedUserId);
      });

      if (response?.success) {
        setUser(response.data);
      } else {
        toast.error("Failed to load user details");
        navigate("/users-management");
      }
    };

    loadUser();
  }, [resolvedUserId]);

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
        return <Badge className="bg-green-100 text-green-700">active</Badge>;
      case "inactive":
        return <Badge variant="secondary">inactive</Badge>;
      case "pending_approval":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            pending approval
          </Badge>
        );
      default:
        return <Badge variant="outline">{status.toLowerCase()}</Badge>;
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
        return <Badge variant="outline">{accountType.toLowerCase()}</Badge>;
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
        return <Badge variant="outline">{status.toLowerCase()}</Badge>;
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
      if (resolvedUserId) {
        const response = await withLoader(async () => {
          return await userManagementApiService.getUserById(resolvedUserId);
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

  const setOpenAddAccount = (open: boolean) => {
    if (open) {
      setEditingAccount(null); // create mode
      setAccountMode("create");
    }
    setIsAccountModalOpen(open);

  };

  const openEditAccount = (account: UserAccount) => {
    console.log("account data :", account);
    setEditingAccount(account); // edit mode
    setAccountMode("edit");
    setIsAccountModalOpen(true);
  };

  const handleAccountSave = async (accountData, accountMode) => {
    let response;
    if (accountMode === "create") {
      response = await userManagementApiService.addAccount(accountData);
    } else if (accountMode === "edit") {
      response = await userManagementApiService.updateAccount(accountData);
    }
    if (response.success) {
      setUser(response.data);
      setIsAccountModalOpen(false);
      setEditingAccount(null);
      toast.success(
        `${accountData.account_type} account has been ${accountMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
  };

  const onMarkASDefault = async (accountData) => {
    const response = await userManagementApiService.markAsDefault(accountData.id);
    if (response.success) {
      setUser(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          accounts: prev.accounts.map(acc => ({
            ...acc,
            is_default: acc.id === accountData.id, // 🔥 only one default
          })),
        };
      });
      toast.success(
        `${accountData.account_type} account has been mark as default successfully.`
      );
    }
    return response;
  };

  const showSwitchAccount =
    user?.accounts && user.accounts.length > 1;

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

                        {/* <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            navigate(`/users-management/${resolvedUserId}/edit`)
                          }
                          className="top-6 right-6 h-8 px-3"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button> */}
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {user?.accounts.length} Account(s)
                        </Badge>

                      </div>


                      {/* Switch Account */}
                      {/* {showSwitchAccount && (
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
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Contact Information */}
          <div className="flex flex-col gap-6">
            {/* Contact Information */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5" /> Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  {/* <div>
                    <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                      <UserPlus className="h-4 w-4" />
                      User ID
                    </span>
                    <p className="font-semibold text-sm font-mono">
                      {user.id.slice(0, 20)}..
                    </p>
                  </div> */}
                  <div>
                    <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                      <UserPlus className="h-4 w-4" />
                      Status
                    </span>
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spaces & Access */}
          {user.accounts && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Accounts
                </h2>

                <Button onClick={() => setOpenAddAccount(true)}>
                  + Add Account
                </Button>
              </div>

              {user?.accounts && user.accounts.length > 0 ? (
                user.accounts.map(account => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={() => openEditAccount(account)}
                    onMarkASDefault={() => onMarkASDefault(account)}
                  />
                ))) : (
                <Card className="p-6 text-center border-dashed border-2 border-gray-200">
                  <CardContent className="space-y-4">
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-sidebar-primary mb-2">
                        No accounts assigned
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        This user does not have any accounts yet. Accounts are required to access different roles and spaces.
                      </p>
                      <Button onClick={() => setOpenAddAccount(true)} variant="outline">
                        + Add Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <AccountEditModal
            open={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            account={editingAccount}
            mode={accountMode}
            onSubmit={async (data) => {

              if (accountMode === "create") {
                const newAccount = {
                  ...data,
                  user_id: user!.id
                };
                await handleAccountSave(newAccount, accountMode);
              } else {
                const updatedAccount = {
                  ...data,
                  user_id: user!.id,
                  user_org_id: editingAccount!.id
                };

                console.log("editing account:", editingAccount);
                await handleAccountSave(updatedAccount, accountMode);
              }
            }}
          />

        </div>
      )}
    </ContentContainer>
  );
}
