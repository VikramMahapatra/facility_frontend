import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { UserFormValues, createUserSchema } from "@/schemas/user.schema";
import { Building2, Truck, UserCog, Users, Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";

// Define interfaces for API data
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
}

interface Role {
  id: string;
  org_id: string;
  name: string;
  description: string;
}

interface UserFormProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => void;
  mode?: "create" | "edit" | "view";
}

const emptyFormData: UserFormValues = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  status: "active",
  account_type: "organization",
  role_ids: [],
  site_id: "",
  building_id: "",
  space_id: "",
  site_ids: [],
  tenant_type: "individual",
  staff_role: "",
};

const accountTypes = [
  {
    value: "organization",
    label: "Organization",
    description: "Property owners and facility managers",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    value: "staff",
    label: "Staff",
    description: "manages the sites of properties",
    icon: <UserCog className="w-5 h-5" />,
  },
  {
    value: "tenant",
    label: "Tenant",
    description: "Renters and occupants of properties",
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "Service providers and contractors",
    icon: <Truck className="w-5 h-5" />,
  },
];

export function UserForm({
  user,
  open,
  onOpenChange,
  onSubmit,
  mode = "create",
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema(mode === "create")),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [statusList, setStatusList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);

  const selectedRoleIds = watch("role_ids") || [];
  const selectedSiteIds = watch("site_ids") || [];
  const accountType = watch("account_type");
  const selectedSiteId = watch("site_id");
  const selectedBuildingId = watch("building_id");
  const isReadOnly = mode === "view";
  const isTenant = accountType === "tenant";
  const isStaff = accountType === "staff";
  const isOrganization = accountType === "organization";

  const loadAll = async () => {
    setFormLoading(true);

    if (mode === "create") {
      setBuildingList([]);
      setSpaceList([]);
    }

    const userSiteId =
      user && mode !== "create" ? (user as any).site_id : undefined;
    const userBuildingId =
      user && mode !== "create" ? (user as any).building_block_id : undefined;

    const promises = [loadStatusLookup(), loadRolesLookup(), loadSiteLookup()];

    if (userSiteId) {
      promises.push(loadBuildingLookup(userSiteId));
      promises.push(loadSpaceLookup(userSiteId, userBuildingId));
    }

    await Promise.all(promises);

    reset(
      user && mode !== "create"
        ? {
            full_name: user.full_name || "",
            email: user.email || "",
            password: "", // Don't populate password in edit mode
            phone: user.phone || "",
            status: user.status || "active",
            account_type: user.account_type || "organization",
            role_ids: user.roles?.map((r) => r.id) || [],
            site_id: userSiteId || "",
            building_id: userBuildingId || "",
            space_id: (user as any).space_id || "",
            site_ids: (user as any).site_ids || [],
            tenant_type: (user as any).tenant_type || "individual",
            staff_role: (user as any).staff_role || "",
          }
        : emptyFormData
    );
    setFormLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadAll();
    }
  }, [open, user, mode, reset]);

  // Load buildings when site changes
  useEffect(() => {
    if (selectedSiteId) {
      loadBuildingLookup(selectedSiteId);
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (selectedSiteId) {
      loadSpaceLookup(selectedSiteId, selectedBuildingId);
    } else {
      setSpaceList([]);
    }
  }, [selectedSiteId, selectedBuildingId]);

  const loadStatusLookup = async () => {
    const lookup = await userManagementApiService.getUserStatusOverview();
    if (lookup?.success) setStatusList(lookup.data || []);
  };

  const loadRolesLookup = async () => {
    const lookup = await userManagementApiService.getUserRolesLookup();
    if (lookup?.success) setRoleList(lookup.data || []);
  };

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadBuildingLookup = async (siteId: string) => {
    const lookup = await buildingApiService.getBuildingLookup(siteId);
    if (lookup.success) setBuildingList(lookup.data || []);
  };

  const loadSpaceLookup = async (siteId: string, buildingId?: string) => {
    const lookup = await spacesApiService.getSpaceLookup(siteId, buildingId);
    if (lookup.success) setSpaceList(lookup.data || []);
  };

  const onSubmitForm = async (data: UserFormValues) => {
    // If editing and password is empty, exclude it from the data (keep old password)
    if (mode === "edit" && (!data.password || data.password.trim() === "")) {
      const { password, ...dataWithoutPassword } = data;
      await onSubmit(dataWithoutPassword);
    } else {
      await onSubmit(data);
    }
  };

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList([]);
    setSpaceList([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New User"}
            {mode === "edit" && "Edit User"}
            {mode === "view" && "User Details"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2 -mr-2">
          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="space-y-4"
            id="user-form"
          >
            {formLoading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <div className="space-y-4">
                {/* Organization Layout */}
                {isOrganization ? (
                  <>
                    {/* Row 1: Full Name (full width) */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        {...register("full_name")}
                        placeholder="John Doe"
                        disabled={isReadOnly}
                        className={errors.full_name ? "border-red-500" : ""}
                      />
                      {errors.full_name && (
                        <p className="text-sm text-red-500">
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    {/* Row 2: Type and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="account_type"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select your account type" />
                              </SelectTrigger>
                              <SelectContent>
                                {accountTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    <div className="flex items-center space-x-3">
                                      {type.icon}
                                      <div>
                                        <div className="font-medium">
                                          {type.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {type.description}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.account_type && (
                              <p className="text-sm text-red-500">
                                {errors.account_type.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger
                                className={
                                  errors.status ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusList.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.status && (
                              <p className="text-sm text-red-500">
                                {errors.status.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Row 3: Email, Password, Phone */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="john@example.com"
                          disabled={isReadOnly}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">
                          Password {mode === "create" ? "*" : ""}
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder={
                              mode === "create"
                                ? "Enter password"
                                : "Leave empty to keep current password"
                            }
                            disabled={isReadOnly}
                            className={
                              errors.password ? "border-red-500 pr-10" : "pr-10"
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            disabled={isReadOnly}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <PhoneInput
                              country={"in"}
                              value={field.value || ""}
                              onChange={(value) => {
                                const digits = value.replace(/\D/g, "");
                                const finalValue = "+" + digits;
                                console.log("cleaned no :", finalValue);
                                field.onChange(finalValue);
                              }}
                              disabled={isReadOnly}
                              inputProps={{
                                name: "phone",
                                required: true,
                              }}
                              containerClass="w-full relative"
                              inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                              buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                              dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                              enableSearch={true}
                            />
                            {errors.phone && (
                              <p className="text-sm text-red-500">
                                {errors.phone.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </>
                ) : isTenant ? (
                  <>
                    {/* Tenant Layout */}
                    {/* Row 1: Full Name (full width) */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        {...register("full_name")}
                        placeholder="John Doe"
                        disabled={isReadOnly}
                        className={errors.full_name ? "border-red-500" : ""}
                      />
                      {errors.full_name && (
                        <p className="text-sm text-red-500">
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    {/* Row 2: Type, Tenant Type, Status */}
                    <div className="grid grid-cols-3 gap-4">
                      <Controller
                        name="account_type"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select your account type" />
                              </SelectTrigger>
                              <SelectContent>
                                {accountTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    <div className="flex items-center space-x-3">
                                      {type.icon}
                                      <div>
                                        <div className="font-medium">
                                          {type.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {type.description}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.account_type && (
                              <p className="text-sm text-red-500">
                                {errors.account_type.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name="tenant_type"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="tenant_type">Tenant Type *</Label>
                            <Select
                              value={field.value || "individual"}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger
                                className={
                                  errors.tenant_type ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Select tenant type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="individual">
                                  Individual
                                </SelectItem>
                                <SelectItem value="commercial">
                                  Commercial
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.tenant_type && (
                              <p className="text-sm text-red-500">
                                {errors.tenant_type.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger
                                className={
                                  errors.status ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusList.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.status && (
                              <p className="text-sm text-red-500">
                                {errors.status.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Row 3: Email, Password, Phone */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="john@example.com"
                          disabled={isReadOnly}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">
                          Password {mode === "create" ? "*" : ""}
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder={
                              mode === "create"
                                ? "Enter password"
                                : "Leave empty to keep current password"
                            }
                            disabled={isReadOnly}
                            className={
                              errors.password ? "border-red-500 pr-10" : "pr-10"
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            disabled={isReadOnly}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <PhoneInput
                              country={"in"}
                              value={field.value || ""}
                              onChange={(value) => {
                                const digits = value.replace(/\D/g, "");
                                const finalValue = "+" + digits;
                                console.log("cleaned no :", finalValue);
                                field.onChange(finalValue);
                              }}
                              disabled={isReadOnly}
                              inputProps={{
                                name: "phone",
                                required: true,
                              }}
                              containerClass="w-full relative"
                              inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                              buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                              dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                              enableSearch={true}
                            />
                            {errors.phone && (
                              <p className="text-sm text-red-500">
                                {errors.phone.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </>
                ) : isStaff ? (
                  <>
                    {/* Staff Layout */}
                    {/* Row 1: Full Name (full width) */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        {...register("full_name")}
                        placeholder="John Doe"
                        disabled={isReadOnly}
                        className={errors.full_name ? "border-red-500" : ""}
                      />
                      {errors.full_name && (
                        <p className="text-sm text-red-500">
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    {/* Row 2: Type, Staff Role, Status */}
                    <div className="grid grid-cols-3 gap-4">
                      <Controller
                        name="account_type"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select your account type" />
                              </SelectTrigger>
                              <SelectContent>
                                {accountTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    <div className="flex items-center space-x-3">
                                      {type.icon}
                                      <div>
                                        <div className="font-medium">
                                          {type.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {type.description}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.account_type && (
                              <p className="text-sm text-red-500">
                                {errors.account_type.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <div className="space-y-2">
                        <Label htmlFor="staff_role">Staff Role</Label>
                        <Input
                          id="staff_role"
                          {...register("staff_role")}
                          placeholder="Enter staff role"
                          disabled={isReadOnly}
                          className={errors.staff_role ? "border-red-500" : ""}
                        />
                        {errors.staff_role && (
                          <p className="text-sm text-red-500">
                            {errors.staff_role.message}
                          </p>
                        )}
                      </div>

                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger
                                className={
                                  errors.status ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusList.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.status && (
                              <p className="text-sm text-red-500">
                                {errors.status.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Row 3: Email, Password, Phone */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="john@example.com"
                          disabled={isReadOnly}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">
                          Password {mode === "create" ? "*" : ""}
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder={
                              mode === "create"
                                ? "Enter password"
                                : "Leave empty to keep current password"
                            }
                            disabled={isReadOnly}
                            className={
                              errors.password ? "border-red-500 pr-10" : "pr-10"
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            disabled={isReadOnly}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <PhoneInput
                              country={"in"}
                              value={field.value || ""}
                              onChange={(value) => {
                                const digits = value.replace(/\D/g, "");
                                const finalValue = "+" + digits;
                                console.log("cleaned no :", finalValue);
                                field.onChange(finalValue);
                              }}
                              disabled={isReadOnly}
                              inputProps={{
                                name: "phone",
                                required: true,
                              }}
                              containerClass="w-full relative"
                              inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                              buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                              dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                              enableSearch={true}
                            />
                            {errors.phone && (
                              <p className="text-sm text-red-500">
                                {errors.phone.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Vendor Layout (original) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          {...register("full_name")}
                          placeholder="John Doe"
                          disabled={isReadOnly}
                          className={errors.full_name ? "border-red-500" : ""}
                        />
                        {errors.full_name && (
                          <p className="text-sm text-red-500">
                            {errors.full_name.message}
                          </p>
                        )}
                      </div>

                      <Controller
                        name="account_type"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select your account type" />
                              </SelectTrigger>
                              <SelectContent>
                                {accountTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    <div className="flex items-center space-x-3">
                                      {type.icon}
                                      <div>
                                        <div className="font-medium">
                                          {type.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {type.description}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.account_type && (
                              <p className="text-sm text-red-500">
                                {errors.account_type.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="john@example.com"
                          disabled={isReadOnly}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">
                          Password {mode === "create" ? "*" : ""}
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder={
                              mode === "create"
                                ? "Enter password"
                                : "Leave empty to keep current password"
                            }
                            disabled={isReadOnly}
                            className={
                              errors.password ? "border-red-500 pr-10" : "pr-10"
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            disabled={isReadOnly}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <PhoneInput
                              country={"in"}
                              value={field.value || ""}
                              onChange={(value) => {
                                const digits = value.replace(/\D/g, "");
                                const finalValue = "+" + digits;
                                console.log("cleaned no :", finalValue);
                                field.onChange(finalValue);
                              }}
                              disabled={isReadOnly}
                              inputProps={{
                                name: "phone",
                                required: true,
                              }}
                              containerClass="w-full relative"
                              inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                              buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                              dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                              enableSearch={true}
                            />
                            {errors.phone && (
                              <p className="text-sm text-red-500">
                                {errors.phone.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger
                                className={
                                  errors.status ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusList.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.status && (
                              <p className="text-sm text-red-500">
                                {errors.status.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </>
                )}

                {isTenant && (
                  <div className="grid grid-cols-3 gap-4">
                    <Controller
                      name="site_id"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label htmlFor="site_id">Site *</Label>
                          <Select
                            value={field.value || ""}
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset building and space when site changes
                              reset({
                                ...watch(),
                                site_id: value,
                                building_id: "",
                                space_id: "",
                              });
                            }}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger
                              className={errors.site_id ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="Select site" />
                            </SelectTrigger>
                            <SelectContent>
                              {siteList.map((site: any) => (
                                <SelectItem key={site.id} value={site.id}>
                                  {site.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.site_id && (
                            <p className="text-sm text-red-500">
                              {errors.site_id.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      name="building_id"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label htmlFor="building_id">Building </Label>
                          <Select
                            value={field.value || ""}
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset space when building changes
                              reset({
                                ...watch(),
                                building_id: value,
                                space_id: "",
                              });
                            }}
                            disabled={isReadOnly || !selectedSiteId}
                          >
                            <SelectTrigger
                              className={
                                errors.building_id ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Select building" />
                            </SelectTrigger>
                            <SelectContent>
                              {buildingList.map((building: any) => (
                                <SelectItem
                                  key={building.id}
                                  value={building.id}
                                >
                                  {building.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.building_id && (
                            <p className="text-sm text-red-500">
                              {errors.building_id.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      name="space_id"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label htmlFor="space_id">Space *</Label>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            disabled={isReadOnly || !selectedSiteId}
                          >
                            <SelectTrigger
                              className={
                                errors.space_id ? "border-red-500" : ""
                              }
                            >
                              <SelectValue
                                placeholder={
                                  !selectedSiteId
                                    ? "Select site first"
                                    : "Select space"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {spaceList.map((space: any) => (
                                <SelectItem key={space.id} value={space.id}>
                                  {space.name || space.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.space_id && (
                            <p className="text-sm text-red-500">
                              {errors.space_id.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}

                {isStaff && (
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="site_ids"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Select Sites *</Label>
                          <div className="space-y-2 border rounded-md p-4 max-h-[180px] overflow-y-auto">
                            {siteList.map((site: any) => {
                              const isChecked = selectedSiteIds.includes(
                                site.id
                              );
                              return (
                                <div
                                  key={site.id}
                                  className="flex items-center space-x-3"
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([
                                          ...currentValues,
                                          site.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValues.filter(
                                            (value) => value !== site.id
                                          )
                                        );
                                      }
                                    }}
                                    disabled={isReadOnly}
                                  />
                                  <div className="space-y-0">
                                    <Label className="font-medium cursor-pointer">
                                      {site.name}
                                    </Label>
                                    {site.code && (
                                      <p className="text-xs text-muted-foreground">
                                        {site.code}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {errors.site_ids && (
                            <p className="text-sm text-red-500">
                              {errors.site_ids.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      name="role_ids"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Assign Roles *</Label>
                          <div className="space-y-2 border rounded-md p-4 max-h-[180px] overflow-y-auto">
                            {roleList.map((role) => {
                              const isChecked = selectedRoleIds.includes(
                                role.id
                              );
                              return (
                                <div
                                  key={role.id}
                                  className="flex items-center space-x-3"
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([
                                          ...currentValues,
                                          role.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValues.filter(
                                            (value) => value !== role.id
                                          )
                                        );
                                      }
                                    }}
                                    disabled={isReadOnly}
                                  />
                                  <div className="space-y-0">
                                    <Label className="font-medium cursor-pointer">
                                      {role.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {role.description || "no description"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {errors.role_ids && (
                            <p className="text-sm text-red-500">
                              {errors.role_ids.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}

                {!isStaff && (
                  <Controller
                    name="role_ids"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>Assign Roles *</Label>
                        <div className="space-y-2 border rounded-md p-4 max-h-[180px] overflow-y-auto">
                          {roleList.map((role) => {
                            const isChecked = selectedRoleIds.includes(role.id);
                            return (
                              <div
                                key={role.id}
                                className="flex items-center space-x-3"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([
                                        ...currentValues,
                                        role.id,
                                      ]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter(
                                          (value) => value !== role.id
                                        )
                                      );
                                    }
                                  }}
                                  disabled={isReadOnly}
                                />
                                <div className="space-y-0">
                                  <Label className="font-medium cursor-pointer">
                                    {role.name}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {role.description || "no description"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {errors.role_ids && (
                          <p className="text-sm text-red-500">
                            {errors.role_ids.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                )}
              </div>
            )}
          </form>
        </div>
        {!formLoading && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" form="user-form" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                  ? "Create User"
                  : "Update User"}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
