import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserX, RefreshCw, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/Pagination";
import { workloadManagementApiService } from "@/services/ticketing_service/workloadmanagementapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";

export default function TicketWorkload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [siteList, setSiteList] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newAssignee, setNewAssignee] = useState("");
  const [assignedTicketsPage, setAssignedTicketsPage] = useState(1);
  const [assignedTicketsPageSize] = useState(7);
  const [unassignedTicketsPage, setUnassignedTicketsPage] = useState(1);
  const [unassignedTicketsPageSize] = useState(6);
  useEffect(() => {
    loadSiteLookup();
  }, []);

  useEffect(() => {
    if (selectedSiteId) {
      loadWorkloadData();
      setAssignedTicketsPage(1); // Reset to first page when site changes
      setUnassignedTicketsPage(1); // Reset to first page when site changes
    }
  }, [selectedSiteId]);

  const loadSiteLookup = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response.success) {
      setSiteList(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedSiteId(response.data[0].id);
      }
    }
  };

  const loadWorkloadData = async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    const response = await workloadManagementApiService.getTeamWorkloadManagement(selectedSiteId);
    if (response.success) {
      setWorkloadData(response.data);
    } else {
      toast({
        title: "Error",
        description: "Failed to load workload data",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const technicianWorkloads = workloadData?.technicians_workload || [];
  const assignedTickets = workloadData?.assigned_tickets || [];
  const unassignedTickets = workloadData?.unassigned_tickets || [];

  // Create a map of technician_id to technician_name for quick lookup
  const technicianNameMap = technicianWorkloads.reduce((acc: any, tech: any) => {
    if (tech.technician_id && tech.technician_name) {
      acc[tech.technician_id] = tech.technician_name;
    }
    return acc;
  }, {});

 
  const getTechnicianName = (technicianId: string) => {
    if (!technicianId) return null;
    return technicianNameMap[technicianId] || null;
  };

  // Pagination for assigned tickets
  const assignedTicketsStartIndex = (assignedTicketsPage - 1) * assignedTicketsPageSize;
  const assignedTicketsEndIndex = assignedTicketsStartIndex + assignedTicketsPageSize;
  const paginatedAssignedTickets = assignedTickets.slice(assignedTicketsStartIndex, assignedTicketsEndIndex);

  // Pagination for unassigned tickets
  const unassignedTicketsStartIndex = (unassignedTicketsPage - 1) * unassignedTicketsPageSize;
  const unassignedTicketsEndIndex = unassignedTicketsStartIndex + unassignedTicketsPageSize;
  const paginatedUnassignedTickets = unassignedTickets.slice(unassignedTicketsStartIndex, unassignedTicketsEndIndex);

  // Available technicians for reassignment
  const availableTechnicians = [
    { id: 101, name: 'John Smith - Electrician' },
    { id: 103, name: 'Mike Johnson - Plumber' },
    { id: 104, name: 'Sarah Davis - HVAC Tech' },
    { id: 105, name: 'Tom Wilson - Maintenance' },
  ];

  const handleReassign = (ticketId: string | number) => {
    setSelectedTicket(ticketId.toString());
    setIsReassignOpen(true);
  };

  const handleReassignSubmit = () => {
    if (!newAssignee) {
      toast({
        title: "Error",
        description: "Please select a technician",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ticket Reassigned",
      description: `Ticket #${selectedTicket} has been reassigned successfully`,
    });

    setIsReassignOpen(false);
    setNewAssignee("");
    setSelectedTicket(null);
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED':
        return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'ESCALATED':
        return 'bg-red-100 text-red-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      case 'REOPENED':
        return 'bg-orange-100 text-orange-800';
      case 'ON_HOLD':
      case 'ON HOLD':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      OPEN: "outline",
      ASSIGNED: "secondary",
      IN_PROGRESS: "default",
      ESCALATED: "destructive",
      CLOSED: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const priorityUpper = priority?.toUpperCase();
    switch (priorityUpper) {
      case 'HIGH':
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge className={getPriorityColor(priority)}>{priority}</Badge>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Workload Management</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-sidebar-primary">Team Workload</h2>
                  <p className="text-muted-foreground">
                    View and manage ticket assignments across your team
                  </p>
                </div>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent>
                  {siteList.map((site: any) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {technicianWorkloads.map((technician: any) => (
                <Card key={technician.technician_id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {technician.technician_name || ` ${technician.technician_id?.substring(0, 8) }`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold">{technician.total_tickets}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Open:</span>
                        <span>{technician.open_tickets}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">In Progress:</span>
                        <span>{technician.in_progress_tickets}</span>
                      </div>
                      {(technician.escalated_tickets) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Escalated:</span>
                          <span className="font-bold text-red-600">{technician.escalated_tickets}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {technicianWorkloads.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <UserX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No technician workload data available</p>
                </div>
              )}
            </div>

            {/* Detailed Ticket List */}
            <Card>
              <CardHeader>
                <CardTitle>All Assigned Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAssignedTickets.map((ticket: any) => (
                      <TableRow key={ticket.id || ticket.ticket_id}>
                        <TableCell>#{ticket.ticket_no || ticket.ticket_id}</TableCell>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{ticket.category_name || ticket.category}</TableCell>
                        <TableCell>
                          {ticket.assigned_to_name || getTechnicianName(ticket.assigned_to) || ticket.assigned_to || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        </TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReassign(ticket.id || ticket.ticket_id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Reassign
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/tickets/${ticket.id || ticket.ticket_id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {assignedTickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No assigned tickets for this site</p>
                  </div>
                )}
                {assignedTickets.length > 0 && (
                  <Pagination
                    page={assignedTicketsPage}
                    pageSize={assignedTicketsPageSize}
                    totalItems={assignedTickets.length}
                    onPageChange={setAssignedTicketsPage}
                  />
                )}
              </CardContent>
            </Card>

            {/* Unassigned Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Unassigned Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUnassignedTickets.map((ticket: any) => (
                      <TableRow key={ticket.id || ticket.ticket_id}>
                        <TableCell>#{ticket.ticket_no || ticket.ticket_id}</TableCell>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{ticket.category_name || ticket.category}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        </TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleReassign(ticket.id || ticket.ticket_id)}
                          >
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {unassignedTickets.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    All tickets have been assigned
                  </p>
                )}
                {unassignedTickets.length > 0 && (
                  <Pagination
                    page={unassignedTicketsPage}
                    pageSize={unassignedTicketsPageSize}
                    totalItems={unassignedTickets.length}
                    onPageChange={setUnassignedTicketsPage}
                  />
                )}
              </CardContent>
            </Card>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Reassign Dialog */}
      <Dialog open={isReassignOpen} onOpenChange={setIsReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Ticket #{selectedTicket}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Technician</Label>
              <Select value={newAssignee} onValueChange={setNewAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a technician" />
                </SelectTrigger>
                <SelectContent>
                  {availableTechnicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id.toString()}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReassignOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReassignSubmit}>Reassign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
