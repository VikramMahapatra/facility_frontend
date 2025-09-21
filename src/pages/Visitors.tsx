import { useState } from "react";
import { UserCheck, Search, Plus, Eye, Edit, Trash2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { mockSites } from "@/data/mockParkingData";
import { VisitorForm } from "@/components/VisitorForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Visitor {
  id: string;
  org_id: string;
  site_id: string;
  name: string;
  phone: string;
  visiting: string;
  purpose: string;
  entry_time: string;
  exit_time?: string;
  status: 'checked_in' | 'checked_out' | 'expected';
  vehicle_no?: string;
}

const mockVisitors: Visitor[] = [
  {
    id: "v-1",
    org_id: "org-1",
    site_id: "site-1",
    name: "John Smith",
    phone: "+91-9876543210",
    visiting: "Apartment 101",
    purpose: "Meeting",
    entry_time: "2024-09-20T09:30:00Z",
    status: "checked_in",
    vehicle_no: "KA05XY1234"
  },
  {
    id: "v-2",
    org_id: "org-1",
    site_id: "site-1",
    name: "Sarah Johnson",
    phone: "+91-9123456789",
    visiting: "Office 205",
    purpose: "Delivery",
    entry_time: "2024-09-20T10:15:00Z",
    exit_time: "2024-09-20T11:00:00Z",
    status: "checked_out"
  },
  {
    id: "v-3",
    org_id: "org-1",
    site_id: "site-2",
    name: "Mike Wilson",
    phone: "+91-9998887777",
    visiting: "Shop 12",
    purpose: "Maintenance",
    entry_time: "2024-09-20T14:00:00Z",
    status: "expected"
  }
];

export default function Visitors() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [visitors, setVisitors] = useState<Visitor[]>(mockVisitors);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteVisitorId, setDeleteVisitorId] = useState<string | null>(null);

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = 
      visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.visiting.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSite === "all" || visitor.site_id === selectedSite;
    const matchesStatus = selectedStatus === "all" || visitor.status === selectedStatus;
    return matchesSearch && matchesSite && matchesStatus;
  });

  const getSiteName = (siteId: string) => {
    const site = mockSites.find(s => s.id === siteId);
    return site ? site.name : 'Unknown Site';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      checked_in: "bg-green-100 text-green-800",
      checked_out: "bg-gray-100 text-gray-800",
      expected: "bg-blue-100 text-blue-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCreate = () => {
    setSelectedVisitor(undefined);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleView = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleEdit = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = (visitorId: string) => {
    setDeleteVisitorId(visitorId);
  };

  const confirmDelete = () => {
    if (deleteVisitorId) {
      setVisitors(visitors.filter(visitor => visitor.id !== deleteVisitorId));
      toast({
        title: "Visitor Removed",
        description: "Visitor record has been removed successfully.",
      });
      setDeleteVisitorId(null);
    }
  };

  const handleSave = (visitorData: Partial<Visitor>) => {
    if (formMode === 'create') {
      const newVisitor: Visitor = {
        id: `v-${Date.now()}`,
        org_id: "org-1",
        ...visitorData as Omit<Visitor, 'id' | 'org_id'>
      };
      setVisitors([...visitors, newVisitor]);
    } else if (formMode === 'edit' && selectedVisitor) {
      setVisitors(visitors.map(visitor => 
        visitor.id === selectedVisitor.id 
          ? { ...visitor, ...visitorData }
          : visitor
      ));
    }
    setIsFormOpen(false);
  };

  const checkedInToday = visitors.filter(v => 
    v.status === 'checked_in' && 
    new Date(v.entry_time).toDateString() === new Date().toDateString()
  ).length;

  const expectedToday = visitors.filter(v => v.status === 'expected').length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Visitor Management</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">Visitor Management</h2>
                  <p className="text-muted-foreground">Track and manage visitor access</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Visitor
                </Button>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{checkedInToday}</div>
                    <p className="text-sm text-muted-foreground">Checked In Today</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{expectedToday}</div>
                    <p className="text-sm text-muted-foreground">Expected Today</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">{visitors.length}</div>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {visitors.filter(v => v.vehicle_no).length}
                    </div>
                    <p className="text-sm text-muted-foreground">With Vehicles</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Sites</option>
                  {mockSites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="expected">Expected</option>
                </select>
              </div>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Visitors ({filteredVisitors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Visiting</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Entry Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitors.map((visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{visitor.name}</div>
                              <div className="text-sm text-muted-foreground">{visitor.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{visitor.visiting}</TableCell>
                          <TableCell>{visitor.purpose}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {formatDateTime(visitor.entry_time)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(visitor.status)}>
                              {visitor.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {visitor.vehicle_no ? (
                              <Badge variant="outline">{visitor.vehicle_no}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleView(visitor)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(visitor)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(visitor.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredVisitors.length === 0 && (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No visitors found</h3>
                      <p className="text-muted-foreground">Try adjusting your search criteria or add a new visitor.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>

      <VisitorForm
        visitor={selectedVisitor}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog open={!!deleteVisitorId} onOpenChange={() => setDeleteVisitorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Visitor Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this visitor record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}