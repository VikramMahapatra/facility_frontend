import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";

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

const userFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(200),
  email: z.string().email("Invalid email address").max(200),
  phone: z.string().optional(),
  status: z.string(),
  role_ids: z.array(z.string()).min(1, "At least one role must be selected"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => void;
}

export function UserForm({ user, open, onOpenChange, onSubmit }: UserFormProps) {

  const [statusList, setStatusList] = useState([]);
  const [roleList, setRoleList] = useState([]);

  // Load lookup data when form opens 
  useEffect(() => {
    if (open) {
      loadStatusLookup();
      loadRolesLookup();
    }
  }, [open]);

  const loadStatusLookup = async () => {
    const lookup = await userManagementApiService.getUserStatusOverview();
    setStatusList(lookup || []);
  };

  const loadRolesLookup = async () => {
    const lookup = await userManagementApiService.getUserRolesLookup();
    setRoleList(lookup || []);
  };
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      status: user?.status || "active",
      role_ids: user?.roles?.map(r => r.id) || [],
    },
  });

  useEffect(() => {
    form.reset({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      status: user?.status || "active",
      role_ids: user?.roles?.map(r => r.id) || [],
    });
  }, [user, form]);

  const handleSubmit = (values: UserFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusList.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Assign Roles</FormLabel>
                  <div className="space-y-2 border rounded-md p-4 max-h-48 overflow-y-auto">
                    {roleList.map((role) => (
                      <FormField
                        key={role.id}
                        control={form.control}
                        name="role_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(role.id)}
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
                              />
                            </FormControl>
                            <div className="space-y-0">
                              <FormLabel className="font-medium cursor-pointer">
                                {role.name}
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                {role.description || "no description"}
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => {
                form.reset();
                loadStatusLookup();
                loadRolesLookup();
                onOpenChange(false);
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {user ? "Update" : "Create"} User
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}