import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTickets } from "@/data/mockTicketData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserX, RefreshCw, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TicketWorkload() {
  const [selectedSiteId, setSelectedSiteId] = useState("1");
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [newAssignee, setNewAssignee] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter tickets by site
  const filteredTickets = mockTickets.filter(
    (ticket) => ticket.site_id === parseInt(selectedSiteId)
  );

  // Get assignee stats
  const assigneeStats = filteredTickets.reduce((acc, ticket) => {
    if (ticket.assigned_to) {
      const assigneeId = ticket.assigned_to.toString();
      if (!acc[assigneeId]) {
        acc[assigneeId] = {
          id: assigneeId,
          tickets: [],
          total: 0,
          open: 0,
          inProgress: 0,
          escalated: 0,
          avgPriority: 0,
        };
      }
      acc[assigneeId].tickets.push(ticket);
      acc[assigneeId].total++;
      if (ticket.status === 'OPEN' || ticket.status === 'ASSIGNED') acc[assigneeId].open++;
      if (ticket.status === 'IN_PROGRESS') acc[assigneeId].inProgress++;
      if (ticket.status === 'ESCALATED') acc[assigneeId].escalated++;
    }
    return acc;
  }, {} as Record<string, any>);

  // Available technicians for reassignment
  const availableTechnicians = [
    { id: 101, name: 'John Smith - Electrician' },
    { id: 103, name: 'Mike Johnson - Plumber' },
    { id: 104, name: 'Sarah Davis - HVAC Tech' },
    { id: 105, name: 'Tom Wilson - Maintenance' },
  ];

  const handleReassign = (ticketId: number) => {
    setSelectedTicket(ticketId);
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

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      HIGH: "bg-red-100 text-red-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      LOW: "bg-green-100 text-green-800",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[priority]}`}>
        {priority}
      </span>
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
                  <SelectItem value="1">Site 1 - Downtown</SelectItem>
                  <SelectItem value="2">Site 2 - Uptown</SelectItem>
                  <SelectItem value="3">Site 3 - Suburbs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.values(assigneeStats).map((stats: any) => (
                <Card key={stats.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Technician #{stats.id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold">{stats.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Open:</span>
                        <span>{stats.open}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">In Progress:</span>
                        <span>{stats.inProgress}</span>
                      </div>
                      {stats.escalated > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Escalated:</span>
                          <span className="font-bold text-red-600">{stats.escalated}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                    {filteredTickets
                      .filter((t) => t.assigned_to)
                      .map((ticket) => (
                        <TableRow key={ticket.ticket_id}>
                          <TableCell>#{ticket.ticket_id}</TableCell>
                          <TableCell className="font-medium">{ticket.title}</TableCell>
                          <TableCell>{ticket.category_name}</TableCell>
                          <TableCell>Tech #{ticket.assigned_to}</TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReassign(ticket.ticket_id)}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Reassign
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {filteredTickets.filter((t) => t.assigned_to).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No assigned tickets for this site</p>
                  </div>
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
                    {filteredTickets
                      .filter((t) => !t.assigned_to)
                      .map((ticket) => (
                        <TableRow key={ticket.ticket_id}>
                          <TableCell>#{ticket.ticket_id}</TableCell>
                          <TableCell className="font-medium">{ticket.title}</TableCell>
                          <TableCell>{ticket.category_name}</TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleReassign(ticket.ticket_id)}
                            >
                              Assign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {filteredTickets.filter((t) => !t.assigned_to).length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    All tickets have been assigned
                  </p>
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
