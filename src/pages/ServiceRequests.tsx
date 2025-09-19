import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Edit, MessageSquare, CheckCircle, Clock, AlertTriangle, User, Phone, Smartphone, Monitor } from "lucide-react";
import { mockServiceRequests, type ServiceRequest } from "@/data/mockMaintenanceData";

export default function ServiceRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  const filteredServiceRequests = mockServiceRequests.filter(request => {
    const matchesSearch = request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter;
    const matchesChannel = channelFilter === "all" || request.channel === channelFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesChannel;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "secondary",
      assigned: "outline",
      in_progress: "default",
      resolved: "default",
      closed: "secondary"
    } as const;
    
    const icons = {
      open: Clock,
      assigned: User,
      in_progress: AlertTriangle,
      resolved: CheckCircle,
      closed: CheckCircle
    };
    
    const Icon = icons[status as keyof typeof icons];
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
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

  const getChannelIcon = (channel: string) => {
    const icons = {
      portal: Monitor,
      app: Smartphone,
      kiosk: Monitor,
      phone: Phone,
      whatsapp: MessageSquare
    };
    
    const Icon = icons[channel as keyof typeof icons] || Monitor;
    return <Icon className="h-4 w-4" />;
  };

  const getRequesterKindBadge = (kind: string) => {
    const variants = {
      resident: "default",
      guest: "secondary",
      merchant: "outline",
      staff: "secondary",
      visitor: "outline"
    } as const;
    
    return <Badge variant={variants[kind as keyof typeof variants] || "outline"}>{kind}</Badge>;
  };

  // Calculate summary statistics
  const totalRequests = mockServiceRequests.length;
  const openRequests = mockServiceRequests.filter(req => req.status === 'open').length;
  const inProgressRequests = mockServiceRequests.filter(req => req.status === 'in_progress').length;
  const resolvedRequests = mockServiceRequests.filter(req => req.status === 'resolved').length;

  // Get unique categories for filter
  const categories = [...new Set(mockServiceRequests.map(req => req.category))];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Requests</h1>
          <p className="text-muted-foreground">Helpdesk and customer service management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Bulk Update
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Request
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{openRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inProgressRequests}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedRequests}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by requester, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="portal">Portal</SelectItem>
                <SelectItem value="app">App</SelectItem>
                <SelectItem value="kiosk">Kiosk</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
          <CardDescription>
            {filteredServiceRequests.length} request(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Space</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServiceRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium font-mono text-sm">
                    {request.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.requesterName}</div>
                      <div className="text-sm">{getRequesterKindBadge(request.requesterKind)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm">
                      {request.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {request.spaceName || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getChannelIcon(request.channel)}
                      <span className="text-sm capitalize">{request.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(request.createdAt).toLocaleDateString()}
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
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      {request.status === 'open' && (
                        <Button variant="ghost" size="sm">
                          <User className="h-4 w-4" />
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

      {/* Quick Stats by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Requests by Category</CardTitle>
          <CardDescription>Distribution of service requests across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(category => {
              const categoryRequests = mockServiceRequests.filter(req => req.category === category);
              const openCount = categoryRequests.filter(req => req.status === 'open').length;
              
              return (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category}</h4>
                    <Badge variant="secondary">{categoryRequests.length}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {openCount} open requests
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Avg response time: {Math.floor(Math.random() * 4) + 1}h
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}