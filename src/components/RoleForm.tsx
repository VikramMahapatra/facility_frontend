import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "@/interfaces/role_management";
import { AccountType, accountTypes, userAccountTypes } from "./common/AccountTypes";

const roleFormSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters").max(64),
  description: z.string().optional(),
  account_types: z.array(
    z.enum(userAccountTypes)
  ).optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: Role;
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

export function RoleForm({ role, isOpen, onClose, onSave, mode }: RoleFormProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      account_types: role?.account_types || [],
    },
  });

  const { isSubmitting } = form.formState;

  // Reset form when role changes
  useEffect(() => {
    form.reset({
      name: role?.name || "",
      description: role?.description || "",
      account_types: role?.account_types || [],
    });
  }, [role, form]);


  const handleSubmit = async (data: RoleFormValues) => {
    const formResponse = await onSave({
      ...role,
      ...data,
    });
  };

  const selectableAccountTypes = accountTypes

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={isSubmitting ? undefined : form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. admin, manager, accountant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the role's responsibilities"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Account Types - Checkbox Group */}
            <FormField
              control={form.control}
              name="account_types"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Types</FormLabel>
                  <FormControl>
                    <div>
                      <div className="grid grid-cols-1 gap-x-6 gap-y-3 border rounded-md p-4 max-h-[180px] overflow-y-auto">
                        {selectableAccountTypes.map((type) => (
                          <label
                            key={type.value}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={type.value}
                              checked={(field.value as string[])?.includes(type.value) || false}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...(field.value || []), type.value]);
                                } else {
                                  field.onChange(
                                    (field.value || []).filter((v) => v !== type.value)
                                  );
                                }
                              }}
                            />
                            {type.icon}
                            <div className="flex flex-col">
                              <span className="font-medium">{type.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {type.description}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />




            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onClose();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : role ? "Update Role" : "Create Role"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}