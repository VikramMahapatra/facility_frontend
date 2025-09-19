import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Edit, Calendar, Clock, CheckCircle, AlertTriangle, Settings, FileText } from "lucide-react";
import { mockPMTemplates, mockAssetCategories, type PMTemplate } from "@/data/mockMaintenanceData";

export default function PreventiveMaintenance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");

  const filteredPMTemplates = mockPMTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.categoryId === categoryFilter;
    const matchesFrequency = frequencyFilter === "all" || template.frequency === frequencyFilter;
    
    return matchesSearch && matchesCategory && matchesFrequency;
  });

  const getFrequencyBadge = (frequency: string) => {
    const variants = {
      monthly: "default",
      quarterly: "secondary",
      annual: "outline",
      meter_based: "destructive"
    } as const;
    
    return <Badge variant={variants[frequency as keyof typeof variants] || "outline"}>{frequency.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "destructive",
      critical: "destructive"
    } as const;
    
    const colors = {
      low: "text-blue-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      critical: "text-red-600"
    };
    
    return (
      <Badge variant={variants[priority as keyof typeof variants] || "outline"} className={colors[priority as keyof typeof colors]}>
        {priority}
      </Badge>
    );
  };

  // Mock scheduled PM data
  const scheduledPMs = [
    {
      id: "spm-001",
      templateId: "pm-001",
      templateName: "Monthly HVAC PM",
      assetName: "Central Chiller Unit 1",
      scheduledDate: "2024-03-15",
      status: "due",
      assignedTo: "Rajesh Kumar"
    },
    {
      id: "spm-002",
      templateId: "pm-002",
      templateName: "Quarterly Generator PM",
      assetName: "Emergency Generator 1",
      scheduledDate: "2024-03-30",
      status: "scheduled",
      assignedTo: "Suresh Patel"
    },
    {
      id: "spm-003",
      templateId: "pm-003",
      templateName: "Annual Elevator Inspection",
      assetName: "Passenger Elevator 1",
      scheduledDate: "2024-02-01",
      status: "completed",
      assignedTo: "Amit Sharma"
    }
  ];

  const getScheduleStatusBadge = (status: string) => {
    const variants = {
      due: "destructive",
      scheduled: "secondary",
      in_progress: "default",
      completed: "default",
      overdue: "destructive"
    } as const;
    
    const icons = {
      due: AlertTriangle,
      scheduled: Calendar,
      in_progress: Settings,
      completed: CheckCircle,
      overdue: AlertTriangle
    };
    
    const Icon = icons[status as keyof typeof icons];
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Preventive Maintenance</h1>
          <p className="text-muted-foreground">Manage PM templates and schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Generate Schedule
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create PM Template
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PM Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPMTemplates.length}</div>
            <p className="text-xs text-muted-foreground">Active templates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-muted-foreground">Need scheduling</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2</div>
            <p className="text-xs text-muted-foreground">Being executed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">On-time completion</p>
          </CardContent>
        </Card>
      </div>

      {/* PM Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>PM Templates</CardTitle>
          <CardDescription>Preventive maintenance procedures and checklists</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search PM templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockAssetCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="meter_based">Meter Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PM Templates Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Checklist Items</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPMTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.categoryName}</Badge>
                  </TableCell>
                  <TableCell>{getFrequencyBadge(template.frequency)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {template.checklist.length} items
                      <div className="text-xs text-muted-foreground">
                        {template.checklist.slice(0, 2).map(item => item.instruction).join(', ')}
                        {template.checklist.length > 2 && '...'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {template.sla && (
                      <div>
                        <div>Response: {template.sla.response_hrs}h</div>
                        <div>Resolve: {template.sla.resolve_hrs}h</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {template.sla && getPriorityBadge(template.sla.priority)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Scheduled PM Section */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Maintenance</CardTitle>
          <CardDescription>Upcoming and recent preventive maintenance activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PM Template</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledPMs.map((scheduled) => (
                <TableRow key={scheduled.id}>
                  <TableCell className="font-medium">{scheduled.templateName}</TableCell>
                  <TableCell>{scheduled.assetName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(scheduled.scheduledDate).toLocaleDateString()}
                      {new Date(scheduled.scheduledDate) < new Date() && scheduled.status !== 'completed' && (
                        <div className="text-red-600 text-xs">Overdue</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{scheduled.assignedTo}</TableCell>
                  <TableCell>{getScheduleStatusBadge(scheduled.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {scheduled.status === 'due' && (
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                      {scheduled.status === 'scheduled' && (
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PM Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>PM Calendar</CardTitle>
          <CardDescription>Monthly view of preventive maintenance schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p>Calendar view will be implemented here</p>
            <p className="text-sm">Shows monthly PM schedule and due dates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}