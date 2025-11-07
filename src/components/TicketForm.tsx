import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTicketCategories } from "@/data/mockTicketData";

interface TicketFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function TicketForm({ onSubmit, onCancel, initialData }: TicketFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id || "",
    priority: initialData?.priority || "MEDIUM",
    request_type: initialData?.request_type || "UNIT",
    site_id: initialData?.site_id || "1",
    space_id: initialData?.space_id || "",
    tenant_id: initialData?.tenant_id || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief description of the issue"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of the issue"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category_id">Category *</Label>
          <Select
            value={formData.category_id.toString()}
            onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {mockTicketCategories.map((category) => (
                <SelectItem key={category.category_id} value={category.category_id.toString()}>
                  {category.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="request_type">Request Type *</Label>
          <Select
            value={formData.request_type}
            onValueChange={(value) => setFormData({ ...formData, request_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNIT">Unit</SelectItem>
              <SelectItem value="COMMUNITY">Community</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_id">Site *</Label>
          <Select value={formData.site_id} onValueChange={(value) => setFormData({ ...formData, site_id: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Site 1 - Downtown</SelectItem>
              <SelectItem value="2">Site 2 - Uptown</SelectItem>
              <SelectItem value="3">Site 3 - Suburbs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="space_id">Space ID (Optional)</Label>
          <Input
            id="space_id"
            type="number"
            value={formData.space_id}
            onChange={(e) => setFormData({ ...formData, space_id: e.target.value })}
            placeholder="e.g., 101"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenant_id">Tenant ID (Optional)</Label>
          <Input
            id="tenant_id"
            type="number"
            value={formData.tenant_id}
            onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
            placeholder="e.g., 201"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? "Update" : "Create"} Ticket
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
