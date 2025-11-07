import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Plus } from "lucide-react";
import { mockTickets } from "@/data/mockTicketData";
import TicketForm from "@/components/TicketForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tickets() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const filteredTickets = mockTickets.filter((ticket) => {
    if (statusFilter !== "ALL" && ticket.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && ticket.priority !== priorityFilter) return false;
    return true;
  });

  const handleCreate = (data: any) => {
    toast({
      title: "Ticket created",
      description: "Service ticket has been created successfully.",
    });
    setIsFormOpen(false);
  };

  const handleEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (data: any) => {
    toast({
      title: "Ticket updated",
      description: "Service ticket has been updated successfully.",
    });
    setIsEditOpen(false);
    setEditingTicket(null);
  };

  const handleView = (ticketId: number) => {
    navigate(`/tickets/${ticketId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED':
        return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'ESCALATED':
        return 'bg-red-100 text-red-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      case 'REOPENED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <Navigation />
          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Service Tickets</h1>
                <p className="text-muted-foreground mt-1">
                  Track and manage all service tickets
                </p>
              </div>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Tickets</CardTitle>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="ASSIGNED">Assigned</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="ESCALATED">Escalated</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Priority</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.ticket_id}>
                        <TableCell className="font-medium">#{ticket.ticket_id}</TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ticket.request_type}</Badge>
                        </TableCell>
                        <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(ticket.ticket_id)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(ticket)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Service Ticket</DialogTitle>
            <DialogDescription>Submit a new service request ticket.</DialogDescription>
          </DialogHeader>
          <TicketForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service Ticket</DialogTitle>
            <DialogDescription>Update ticket details.</DialogDescription>
          </DialogHeader>
          <TicketForm
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setIsEditOpen(false);
              setEditingTicket(null);
            }}
            initialData={editingTicket}
          />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
