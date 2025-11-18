import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Plus, TicketIcon, AlertTriangle, Search } from "lucide-react";
import TicketForm from "@/components/TicketForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { mockTickets } from "@/data/mockTicketData";
import { ticketsApiService } from "@/services/ticketing_service/ticketsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";

export default function Tickets() {
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [siteList, setSiteList] = useState<any[]>([]);
  const [priorityList, setPriorityList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(10); // items per page
  const [totalItems, setTotalItems] = useState(0);

  useSkipFirstEffect(() => {
    loadTickets();
  }, [page]);

  useEffect(() => {
    loadSiteLookup();
    loadPriorityLookup();
    loadStatusLookup();
  }, []);

  useEffect(() => {
    if (page === 1) {
      loadTickets();
    } else {
      setPage(1); 
    }
  }, [statusFilter, priorityFilter, selectedSite, searchTerm]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadPriorityLookup = async () => {
    const lookup = await ticketsApiService.getPriorityLookup();
    if (lookup.success) setPriorityList(lookup.data || []);
  };

  const loadStatusLookup = async () => {
    const lookup = await ticketsApiService.getStatusLookup();
    if (lookup.success) setStatusList(lookup.data || []);
  };

  const loadTickets = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (priorityFilter !== "ALL") params.append("priority", priorityFilter);
    if (selectedSite && selectedSite !== "all") params.append("site_id", selectedSite);
    if (searchTerm) params.append("search", searchTerm);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await ticketsApiService.getTickets(params);
    });
    if (response?.success) {
      setTickets(response.data?.tickets || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const handleCreate = async (data: any) => {
    const response = await withLoader(async () => {
      return await ticketsApiService.addTicket(data);
    });
    if (response) {
      setIsFormOpen(false);
      loadTickets();
      toast.success("Service ticket has been created successfully.");
      return { success: true, data: response };
    }
    return { success: false };
  };

  const handleEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    const response = await ticketsApiService.addTicket(data);
    if (response.success) {
      setIsEditOpen(false);
      setEditingTicket(null);
      loadTickets();
      toast.success("Service ticket has been updated successfully.");
    }
    return response;
  };

  const handleView = (ticketId: string | number) => {
    navigate(`/tickets/${ticketId}`);
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

  const getPriorityColor = (priority: string) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Service Tickets</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-sidebar-primary">All Tickets</h2>
                  <p className="text-muted-foreground">
                    Track and manage all service tickets
                  </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Ticket
                </Button>
              </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedSite} onValueChange={setSelectedSite}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Site" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sites</SelectItem>
                        {siteList.map((site: any) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        {statusList.map((status: any) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Priority</SelectItem>
                        {priorityList.map((priority: any) => (
                          <SelectItem key={priority.id} value={priority.id}>
                            {priority.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-md border">
                  <ContentContainer>
                    <LoaderOverlay />
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
                      {tickets.map((ticket) => (
                        <TableRow key={ticket.id || ticket.ticket_id}>
                          <TableCell className="font-medium">#{ticket.ticket_no}</TableCell>
                          <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ticket.category}</Badge>
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
                              <Button variant="ghost" size="sm" onClick={() => handleView(ticket.id || ticket.ticket_id)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {/* <Button variant="ghost" size="sm" onClick={() => handleEdit(ticket)}>
                                <Edit className="w-4 h-4" />
                              </Button> */}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      onPageChange={(newPage) => setPage(newPage)}
                    />
                  </ContentContainer>
                </div>
              </CardContent>
            </Card>
            </div>
          </main>
        </SidebarInset>
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