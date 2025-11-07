import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockSLAPolicies } from "@/data/mockTicketData";

interface TicketCategoryFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function TicketCategoryForm({ onSubmit, onCancel, initialData }: TicketCategoryFormProps) {
  const [formData, setFormData] = useState({
    category_name: initialData?.category_name || "",
    auto_assign_role: initialData?.auto_assign_role || "",
    sla_hours: initialData?.sla_hours || 24,
    is_active: initialData?.is_active ?? true,
    sla_id: initialData?.sla_id || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category_name">Category Name *</Label>
        <Input
          id="category_name"
          value={formData.category_name}
          onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
          placeholder="e.g., Electrical Issues"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="auto_assign_role">Auto-Assign Role</Label>
        <Input
          id="auto_assign_role"
          value={formData.auto_assign_role}
          onChange={(e) => setFormData({ ...formData, auto_assign_role: e.target.value })}
          placeholder="e.g., electrician, plumber"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sla_hours">SLA Hours *</Label>
        <Input
          id="sla_hours"
          type="number"
          value={formData.sla_hours}
          onChange={(e) => setFormData({ ...formData, sla_hours: parseInt(e.target.value) })}
          min="1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sla_id">SLA Policy</Label>
        <Select value={formData.sla_id.toString()} onValueChange={(value) => setFormData({ ...formData, sla_id: parseInt(value) })}>
          <SelectTrigger>
            <SelectValue placeholder="Select SLA Policy" />
          </SelectTrigger>
          <SelectContent>
            {mockSLAPolicies.map((policy) => (
              <SelectItem key={policy.sla_id} value={policy.sla_id.toString()}>
                {policy.service_category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? "Update" : "Create"} Category
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
