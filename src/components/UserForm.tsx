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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { UserFormValues, createUserSchema } from "@/schemas/user.schema";
import { toast } from "sonner";
import {
  Building2,
  Truck,
  UserCog,
  Users,
  Eye,
  EyeOff,
  Trash2,
  Plus,
} from "lucide-react";
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
  tenant_spaces: [
    {
      site_id: "",
      building_block_id: "",
      space_id: "",
      role: "owner",
    },
  ],
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
    setValue,
    getValues,
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
  const [buildingList, setBuildingList] = useState<Record<string, any[]>>({});
  const [spaceList, setSpaceList] = useState<Record<string, any[]>>({});

  const selectedRoleIds = watch("role_ids") || [];
  const selectedSiteIds = watch("site_ids") || [];
  const accountType = watch("account_type");
  const selectedSiteId = watch("site_id");
  const selectedBuildingId = watch("building_id");
  const tenantSpaces = watch("tenant_spaces") || [];
  const isReadOnly = mode === "view";
  const isTenant = accountType === "tenant";
  const isStaff = accountType === "staff";
  const isOrganization = accountType === "organization";

  const loadAll = async () => {
    setFormLoading(true);

    if (mode === "create") {
      setBuildingList({});
      setSpaceList({});
    }

    const userSiteId =
      user && mode !== "create" ? (user as any).site_id : undefined;
    const userBuildingId =
      user && mode !== "create" ? (user as any).building_block_id : undefined;

    const promises = [loadStatusLookup(), loadRolesLookup(), loadSiteLookup()];

    // Preload building and space lists for existing user spaces (edit mode)
    if (user && mode !== "create" && (user as any).tenant_spaces) {
      const spaces = (user as any).tenant_spaces;
      if (Array.isArray(spaces) && spaces.length > 0) {
        const loadPromises = spaces.map(async (space: any) => {
          if (space.site_id) {
            await loadBuildingLookup(space.site_id);
            if (space.building_block_id) {
              await loadSpaceLookup(space.site_id, space.building_block_id);
            } else {
              await loadSpaceLookup(space.site_id);
            }
          }
        });
        promises.push(...loadPromises);
      }
    } else if (userSiteId) {
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
            tenant_type: (user as any).tenant_type || "residential",
            staff_role: (user as any).staff_role || "",
            tenant_spaces: (user as any).tenant_spaces || [],

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

  useEffect(() => {
    if (accountType === "tenant") {
      const currentTenantType = watch("tenant_type");
      if (!currentTenantType || currentTenantType === "individual") {
        setValue("tenant_type", "residential");
      }
    }
  }, [accountType, setValue, watch]);

  // Helper functions for managing multiple user spaces
  const addUserSpaceEntry = () => {
    const currentSpaces = getValues("tenant_spaces") || [];
    const newEntry = {
      site_id: "",
      building_block_id: "",
      space_id: "",
      role: "owner" as any,
    };
    setValue("tenant_spaces", [...currentSpaces, newEntry], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeUserSpaceEntry = (index: number) => {
    const currentSpaces = getValues("tenant_spaces") || [];
    const remaining = currentSpaces.filter((_, i) => i !== index);
    const ensured =
      remaining.length === 0
        ? [
            {
              site_id: "",
              building_block_id: "",
              space_id: "",
              role: "owner" as any,
            },
          ]
        : remaining;
    setValue("tenant_spaces", ensured, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateUserSpaceEntry = (
    index: number,
    field: "site_id" | "building_block_id" | "space_id" | "role",
    value: string
  ) => {
    const currentSpaces = getValues("tenant_spaces") || [];
    const updated = [...currentSpaces];
    updated[index] = { ...updated[index], [field]: value };

    // Reset building and space when site changes
    if (field === "site_id") {
      updated[index].building_block_id = "";
      updated[index].space_id = "";
      if (value) {
        loadBuildingLookup(value);
        loadSpaceLookup(value);
      }
    }
    // Reset space when building changes
    if (field === "building_block_id") {
      updated[index].space_id = "";
      if (updated[index].site_id) {
        loadSpaceLookup(updated[index].site_id, value || undefined);
      }
    }

    // Check for duplicate space entries (same site_id, building_block_id, and space_id)
    // Only check if space_id is being set and both site_id and space_id are present
    if (field === "space_id" && value && updated[index].site_id) {
      const currentEntry = updated[index];
      const duplicateIndex = updated.findIndex(
        (space: any, i: number) =>
          i !== index &&
          space.site_id &&
          space.space_id &&
          space.site_id === currentEntry.site_id &&
          (space.building_block_id || "") ===
            (currentEntry.building_block_id || "") &&
          space.space_id === value
      );

      if (duplicateIndex !== -1) {
        toast.error(
          "This space is already added. Please select a different space."
        );
        // Revert the change
        updated[index] = { ...currentSpaces[index] };
        setValue("tenant_spaces", updated, {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }
    }

    setValue("tenant_spaces", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

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
    if (siteId && !buildingList[siteId]) {
      const lookup = await buildingApiService.getBuildingLookup(siteId);
      if (lookup.success) {
        setBuildingList((prev) => ({
          ...prev,
          [siteId]: lookup.data || [],
        }));
      }
    }
  };

  const loadSpaceLookup = async (siteId: string, buildingId?: string) => {
    if (siteId) {
      const key = buildingId ? `${siteId}_${buildingId}` : siteId;
      if (!spaceList[key]) {
        const lookup = await spacesApiService.getSpaceLookup(
          siteId,
          buildingId
        );
        if (lookup.success) {
          setSpaceList((prev) => ({
            ...prev,
            [key]: lookup.data || [],
          }));
        }
      }
    }
  };

  const onSubmitForm = async (data: UserFormValues) => {
    // Process tenant_spaces for tenant account type
    let processedData = { ...data };

    if (isTenant && data.tenant_spaces) {
      // Filter out only completely empty entries (no site_id and no space_id)
      const validUserSpaces = data.tenant_spaces.filter(
        (space: any) => space.site_id && space.space_id
      );

      // Check for duplicate space entries (same site_id, building_block_id, and space_id combination)
      const duplicates: number[] = [];
      for (let i = 0; i < validUserSpaces.length; i++) {
        for (let j = i + 1; j < validUserSpaces.length; j++) {
          const space1 = validUserSpaces[i];
          const space2 = validUserSpaces[j];
          if (
            space1.site_id === space2.site_id &&
            (space1.building_block_id || "") ===
              (space2.building_block_id || "") &&
            space1.space_id === space2.space_id
          ) {
            if (!duplicates.includes(i)) duplicates.push(i);
            if (!duplicates.includes(j)) duplicates.push(j);
          }
        }
      }

      if (duplicates.length > 0) {
        toast.error(
          `Duplicate space entries detected at Space #${duplicates
            .map((d) => d + 1)
            .join(", #")}. Please remove duplicate spaces.`
        );
        return;
      }

      processedData = {
        ...data,
        tenant_spaces: validUserSpaces.length > 0 ? validUserSpaces : undefined,
      };
    }

    // If editing and password is empty, exclude it from the data (keep old password)
    if (
      mode === "edit" &&
      (!processedData.password || processedData.password.trim() === "")
    ) {
      const { password, ...dataWithoutPassword } = processedData;
      await onSubmit(dataWithoutPassword);
    } else {
      await onSubmit(processedData);
    }
  };

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList({});
    setSpaceList({});
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
                          disabled={isReadOnly || mode === "edit"}
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
                              disabled={isReadOnly || mode === "edit"}
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
                              value={field.value || "residential"}
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
                                <SelectItem value="residential">
                                  Residential
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
                          disabled={isReadOnly || mode === "edit"}
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
                              disabled={isReadOnly || mode === "edit"}
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
                          disabled={isReadOnly || mode === "edit"}
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
                              disabled={isReadOnly || mode === "edit"}
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
                          disabled={isReadOnly || mode === "edit"}
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
                              disabled={isReadOnly || mode === "edit"}
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tenant_spaces">Space(s)</Label>
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={addUserSpaceEntry}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Space
                        </Button>
                      )}
                    </div>

                    {/* Space Cards */}
                    <div className="space-y-4">
                      {tenantSpaces.map((space: any, index: number) => (
                        <Card key={index} className="relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                Space #{index + 1}
                              </CardTitle>
                              {!isReadOnly && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeUserSpaceEntry(index)}
                                  disabled={tenantSpaces.length === 1}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-4 gap-4">
                              {/* Site */}
                              <div className="space-y-2">
                                <Label>Site *</Label>
                                <Controller
                                  name={`tenant_spaces.${index}.site_id` as any}
                                  control={control}
                                  render={({ field, fieldState }) => (
                                    <Select
                                      value={field.value || ""}
                                      onValueChange={(value) => {
                                        updateUserSpaceEntry(
                                          index,
                                          "site_id",
                                          value
                                        );
                                      }}
                                      disabled={isReadOnly}
                                    >
                                      <SelectTrigger
                                        className={
                                          fieldState.error &&
                                          fieldState.isTouched
                                            ? "border-red-500"
                                            : ""
                                        }
                                      >
                                        <SelectValue placeholder="Select site" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {siteList.map((site) => (
                                          <SelectItem
                                            key={site.id}
                                            value={site.id}
                                          >
                                            {site.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>

                              {/* Building */}
                              <div className="space-y-2">
                                <Label>Building</Label>
                                <Controller
                                  name={
                                    `tenant_spaces.${index}.building_block_id` as any
                                  }
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value ? field.value : "none"}
                                      onValueChange={(v) => {
                                        updateUserSpaceEntry(
                                          index,
                                          "building_block_id",
                                          v === "none" ? "" : v
                                        );
                                      }}
                                      disabled={isReadOnly || !space?.site_id}
                                    >
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={
                                            space?.site_id
                                              ? "Select building"
                                              : "Select site first"
                                          }
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">
                                          Select building
                                        </SelectItem>
                                        {(
                                          buildingList[space?.site_id || ""] ||
                                          []
                                        ).map((building) => (
                                          <SelectItem
                                            key={building.id}
                                            value={building.id}
                                          >
                                            {building.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>

                              {/* Space */}
                              <div className="space-y-2">
                                <Label>Space *</Label>
                                <Controller
                                  name={`tenant_spaces.${index}.space_id` as any}
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value || ""}
                                      onValueChange={(value) => {
                                        updateUserSpaceEntry(
                                          index,
                                          "space_id",
                                          value
                                        );
                                      }}
                                      disabled={isReadOnly || !space?.site_id}
                                    >
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={
                                            !space?.site_id
                                              ? "Select site first"
                                              : "Select space"
                                          }
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(() => {
                                          const siteId = space?.site_id || "";
                                          const buildingId =
                                            space?.building_block_id || "";
                                          const key = buildingId
                                            ? `${siteId}_${buildingId}`
                                            : siteId;
                                          return (spaceList[key] || []).map(
                                            (sp) => (
                                              <SelectItem
                                                key={sp.id}
                                                value={sp.id}
                                              >
                                                {sp.name || sp.code}
                                              </SelectItem>
                                            )
                                          );
                                        })()}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>

                              {/* Role */}
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Controller
                                  name={`tenant_spaces.${index}.role` as any}
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value || "owner"}
                                      onValueChange={(value) => {
                                        updateUserSpaceEntry(
                                          index,
                                          "role",
                                          value
                                        );
                                      }}
                                      disabled={isReadOnly}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="owner">
                                          Owner
                                        </SelectItem>
                                        <SelectItem value="occupant">
                                          Occupant
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
