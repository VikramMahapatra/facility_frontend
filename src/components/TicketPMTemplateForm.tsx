"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TicketPMTemplateFormValues, ticketPMTemplateSchema } from "@/schemas/ticketpmtemplate.schema";
import { ticketsApiService } from "@/services/ticketing_service/ticketsapi";
import { toast } from "sonner";

interface TicketPMTemplateFormProps {
  template?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: TicketPMTemplateFormValues = {
  template_name: "",
  category_id: "",
  frequency: "monthly",
  description: "",
  assigned_to: "",
  priority: "medium",
  estimated_duration: undefined,
  status: 'active',
  instructions: "",
};

export function TicketPMTemplateForm({ template, isOpen, onClose, onSave, mode }: TicketPMTemplateFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TicketPMTemplateFormValues>({
    resolver: zodResolver(ticketPMTemplateSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  useEffect(() => {
    loadCategoryLookup();
  }, []);

  useEffect(() => {
    if (template && mode !== "create") {
      reset({
        template_name: template.template_name || "",
        category_id: template.category_id || "",
        frequency: template.frequency || "monthly",
        description: template.description || "",
        assigned_to: template.assigned_to || "",
        priority: template.priority || "medium",
        estimated_duration: template.estimated_duration || undefined,
        status: template.status || 'active',
        instructions: template.instructions || "",
      });
      // Load employees if category is set
      if (template.category_id) {
        loadEmployeesForCategory(template.category_id);
      }
    } else {
      reset(emptyFormData);
    }
    setIsSubmitted(false);
  }, [template, mode, reset, isOpen]);

  const selectedCategoryId = watch("category_id");

  useEffect(() => {
    if (selectedCategoryId) {
      loadEmployeesForCategory(selectedCategoryId);
    } else {
      setEmployeeList([]);
    }
  }, [selectedCategoryId]);

  const isReadOnly = mode === "view";

  const loadCategoryLookup = async () => {
    try {
      const lookup = await ticketsApiService.getCategoryLookup();
      if (lookup.success) setCategoryList(lookup.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategoryList([]);
    }
  };

  const loadEmployeesForCategory = async (categoryId: string) => {
    if (!categoryId) {
      setEmployeeList([]);
      return;
    }
    try {
      const response = await ticketsApiService.getEmployeesForTicket(categoryId);
      if (response.success) {
        setEmployeeList(
          Array.isArray(response.data)
            ? response.data
            : response.data?.employees || []
        );
      }
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeList([]);
    }
  };

  const onSubmitForm = async (data: TicketPMTemplateFormValues) => {
    // Get employee name if assigned_to is selected
    const assignedEmployee = employeeList.find((emp: any) => emp.user_id === data.assigned_to);
    
    const formResponse = await onSave({
      ...template,
      ...data,
      assigned_to_name: assignedEmployee?.full_name || undefined,
    });
    
    if (formResponse?.success) {
      setIsSubmitted(true);
    } else if (formResponse?.errors) {
      // Handle API errors if any
      Object.keys(formResponse.errors).forEach((key) => {
        toast.error(formResponse.errors[key]);
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New PM Template" : mode === "edit" ? "Edit PM Template" : "View PM Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template_name">Template Name *</Label>
            <Input
              id="template_name"
              {...register("template_name")}
              disabled={isReadOnly}
              placeholder="Enter template name"
              className={errors.template_name ? 'border-red-500' : ''}
            />
            {errors.template_name && (
              <p className="text-sm text-red-500">{errors.template_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryList.length === 0 ? (
                        <SelectItem value="none" disabled>No categories available</SelectItem>
                      ) : (
                        categoryList.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-red-500">{errors.category_id.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.frequency ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.frequency && (
                    <p className="text-sm text-red-500">{errors.frequency.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              disabled={isReadOnly}
              placeholder="Enter description of the maintenance task"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="assigned_to"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assigned To</Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isReadOnly || !selectedCategoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCategoryId ? "Select person" : "Select category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeList.length === 0 ? (
                        <SelectItem value="none" disabled>
                          {selectedCategoryId ? "No employees available" : "Select category first"}
                        </SelectItem>
                      ) : (
                        employeeList.map((user: any) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.full_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-sm text-red-500">{errors.priority.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
              <Input
                id="estimated_duration"
                type="number"
                {...register("estimated_duration", { valueAsNumber: true })}
                disabled={isReadOnly}
                className={errors.estimated_duration ? 'border-red-500' : ''}
                min="1"
                placeholder="e.g., 60"
              />
              {errors.estimated_duration && (
                <p className="text-sm text-red-500">{errors.estimated_duration.message}</p>
              )}
            </div>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              {...register("instructions")}
              disabled={isReadOnly}
              placeholder="Enter any special instructions or notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting || isSubmitted}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Template" : "Update Template"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

