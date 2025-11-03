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
import { UserFormValues, userSchema } from "@/schemas/user.schema";

// Define interfaces for API data
interface User {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
  roles?: Role[];
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
  phone: "",
  status: "active",
  role_ids: [],
};

export function UserForm({ user, open, onOpenChange, onSubmit, mode = "create" }: UserFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [statusList, setStatusList] = useState([]);
  const [roleList, setRoleList] = useState([]);

  const selectedRoleIds = watch("role_ids") || [];
  const isReadOnly = mode === "view";

  // Load lookup data when form opens 
  useEffect(() => {
    if (open) {
      loadStatusLookup();
      loadRolesLookup();
    }
  }, [open]);

  useEffect(() => {
    if (user && mode !== "create") {
      reset({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        status: user.status || "active",
        role_ids: user.roles?.map(r => r.id) || [],
      });
    } else {
      reset(emptyFormData);
    }
  }, [user, mode, reset]);

  const loadStatusLookup = async () => {
    const lookup = await userManagementApiService.getUserStatusOverview();
    if (lookup?.success) setStatusList(lookup.data || []);
  };

  const loadRolesLookup = async () => {
    const lookup = await userManagementApiService.getUserRolesLookup();
    if (lookup?.success) setRoleList(lookup.data || []);
  };

  const onSubmitForm = async (data: UserFormValues) => {
    try {
      await onSubmit(data);
      reset(emptyFormData);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New User"}
            {mode === "edit" && "Edit User"}
            {mode === "view" && "User Details"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="John Doe"
              disabled={isReadOnly}
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
                disabled={isReadOnly}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      field.onChange(value);
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={isReadOnly}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              )}
            />
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
                  <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
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
                  <p className="text-sm text-red-500">{errors.status.message}</p>
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
                <div className="space-y-2 border rounded-md p-4 max-h-48 overflow-y-auto">
                  {roleList.map((role) => {
                    const isChecked = selectedRoleIds.includes(role.id);
                    return (
                      <div key={role.id} className="flex items-center space-x-3">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, role.id]);
                            } else {
                              field.onChange(
                                currentValues.filter((value) => value !== role.id)
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
                  <p className="text-sm text-red-500">{errors.role_ids.message}</p>
                )}
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create User" : "Update User"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}