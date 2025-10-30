import { useState, useEffect } from "react";
import { Key, Search, Download, Filter, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AccessEvent, AccessEventOverview } from "@/interfaces/parking_access_interface";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { accessEventApiService } from "@/services/parking_access/accesseventsapi";
import { Pagination } from "@/components/Pagination";

export default function AccessLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedDirection, setSelectedDirection] = useState<string>("all");

  const [events, setEvents] = useState<AccessEvent[]>([])
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const [siteList, setSiteList] = useState([]);
  const [eventOverview, setEventOverview] = useState<AccessEventOverview>({
    todayEvents: 0,
    totalEntries: 0,
    totalExits: 0,
    totalUniqueIDs: 0,
  });

  useSkipFirstEffect(() => {
    loadEvents();
  }, [page]);

  useEffect(() => {
    if (page === 1) {
      loadEvents();
    } else {
      setPage(1);    // triggers the page effect
    }
  }, [searchTerm, selectedSite, selectedDirection]);

  useEffect(() => {
    loadSiteLookup();
    loadEventOverView();
  }, []);

  const loadEvents = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite) params.append("site_id", selectedSite);
    if (selectedDirection) params.append("direction", selectedDirection);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await accessEventApiService.getAccessEvents(params);
    if (response.success) {
      setEvents(response.data?.events || []);
      setTotalItems(response.data?.total || 0);
    }
  }

  const loadEventOverView = async () => {
    const response = await accessEventApiService.getAccessEventOverview();
    if (response.success) setEventOverview(response.data || []);
  }

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  }

  const getDirectionIcon = (direction: 'in' | 'out') => {
    return direction === 'in' ?
      <ArrowUpCircle className="h-4 w-4 text-green-600" /> :
      <ArrowDownCircle className="h-4 w-4 text-orange-600" />;
  };

  const getDirectionColor = (direction: 'in' | 'out') => {
    return direction === 'in' ?
      "bg-green-100 text-green-800" :
      "bg-orange-100 text-orange-800";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Access Logs</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sidebar-primary">Access Logs</h2>
                  <p className="text-muted-foreground">Monitor entry and exit activities</p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Logs
                </Button>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sidebar-primary">{eventOverview.todayEvents}</div>
                    <p className="text-sm text-muted-foreground">Today's Events</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{eventOverview.totalEntries}</div>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">{eventOverview.totalExits}</div>
                    <p className="text-sm text-muted-foreground">Total Exits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {eventOverview.totalUniqueIDs}
                    </div>
                    <p className="text-sm text-muted-foreground">Unique IDs</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by vehicle, card ID, or gate..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80"
                  />
                </div>

                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Sites</option>
                  {siteList.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>

                <select
                  value={selectedDirection}
                  onChange={(e) => setSelectedDirection(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Directions</option>
                  <option value="in">Entry</option>
                  <option value="out">Exit</option>
                </select>
              </div>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Access Events ({events?.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Gate</TableHead>
                        <TableHead>Vehicle No.</TableHead>
                        <TableHead>Card ID</TableHead>
                        <TableHead>Site</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            {formatDateTime(event.ts)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getDirectionIcon(event.direction)}
                              <Badge className={getDirectionColor(event.direction)}>
                                {event.direction === 'in' ? 'Entry' : 'Exit'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{event.gate}</TableCell>
                          <TableCell>
                            {event.vehicle_no ? (
                              <Badge variant="outline">{event.vehicle_no}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {event.card_id ? (
                              <Badge variant="outline">{event.card_id}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{event.site_name}</TableCell>
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
                  {events.length === 0 && (
                    <div className="text-center py-8">
                      <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No events found</h3>
                      <p className="text-muted-foreground">Try adjusting your search criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}