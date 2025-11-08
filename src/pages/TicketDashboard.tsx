import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTickets } from "@/data/mockTicketData";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, TicketIcon, Zap, Users, Calendar, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TicketDashboard() {
  const [selectedSiteId, setSelectedSiteId] = useState("1");
  const navigate = useNavigate();

  // Filter tickets by site
  const filteredTickets = mockTickets.filter(
    (ticket) => ticket.site_id === parseInt(selectedSiteId)
  );

  // Last 30 days filter
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const last30DaysTickets = filteredTickets.filter(
    (ticket) => new Date(ticket.created_at) >= thirtyDaysAgo
  );

  // Calculate statistics
  const totalTickets = filteredTickets.length;
  const openTickets = filteredTickets.filter((t) => t.status === 'OPEN').length;
  const escalatedTickets = filteredTickets.filter((t) => t.status === 'ESCALATED').length;
  const inProgressTickets = filteredTickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const closedTickets = filteredTickets.filter((t) => t.status === 'CLOSED').length;
  const highPriorityTickets = filteredTickets.filter((t) => t.priority === 'HIGH').length;

  // Last 30 days statistics
  const last30DaysPending = last30DaysTickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'ASSIGNED'
  ).length;
  const last30DaysResolved = last30DaysTickets.filter(
    (t) => t.status === 'CLOSED'
  ).length;
  const last30DaysEscalated = last30DaysTickets.filter(
    (t) => t.status === 'ESCALATED'
  ).length;

  // Workload distribution (assignee stats)
  const assigneeWorkload = filteredTickets.reduce((acc, ticket) => {
    if (ticket.assigned_to) {
      const assigneeId = ticket.assigned_to.toString();
      if (!acc[assigneeId]) {
        acc[assigneeId] = {
          total: 0,
          open: 0,
          inProgress: 0,
          escalated: 0,
        };
      }
      acc[assigneeId].total++;
      if (ticket.status === 'OPEN' || ticket.status === 'ASSIGNED') acc[assigneeId].open++;
      if (ticket.status === 'IN_PROGRESS') acc[assigneeId].inProgress++;
      if (ticket.status === 'ESCALATED') acc[assigneeId].escalated++;
    }
    return acc;
  }, {} as Record<string, { total: number; open: number; inProgress: number; escalated: number }>);

  // Category breakdown
  const categoryStats = filteredTickets.reduce((acc, ticket) => {
    const category = ticket.category_name || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">Ticketing Dashboard</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-sidebar-primary">Dashboard Overview</h2>
                  <p className="text-muted-foreground">
                    Monitor ticket status and performance metrics
                  </p>
                </div>
              <div className="flex gap-3">
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
                <Button onClick={() => navigate('/ticket-workload')}>
                  <Users className="h-4 w-4 mr-2" />
                  Workload Management
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                  <TicketIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">All tickets for this site</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">New Tickets</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{openTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting assignment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Escalated</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{escalatedTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">SLA breached tickets</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inProgressTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">Being worked on</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Closed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{closedTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">Resolved tickets</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                  <Zap className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{highPriorityTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">Urgent attention needed</p>
                </CardContent>
              </Card>
            </div>

            {/* Last 30 Days Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Last 30 Days Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Pending Tickets</p>
                    <p className="text-3xl font-bold">{last30DaysPending}</p>
                    <p className="text-xs text-muted-foreground">
                      {last30DaysTickets.length} total created
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{last30DaysResolved}</p>
                    <p className="text-xs text-muted-foreground">
                      {last30DaysTickets.length > 0 
                        ? Math.round((last30DaysResolved / last30DaysTickets.length) * 100)
                        : 0}% resolution rate
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Escalated</p>
                    <p className="text-3xl font-bold text-red-600">{last30DaysEscalated}</p>
                    <p className="text-xs text-muted-foreground">
                      {last30DaysTickets.length > 0
                        ? Math.round((last30DaysEscalated / last30DaysTickets.length) * 100)
                        : 0}% escalation rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignee Workload Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Workload Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(assigneeWorkload).map(([assigneeId, stats]) => (
                    <div key={assigneeId} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Technician #{assigneeId}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Open: {stats.open}</span>
                          <span>In Progress: {stats.inProgress}</span>
                          <span className="text-red-600">Escalated: {stats.escalated}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">Total assigned</p>
                      </div>
                    </div>
                  ))}
                  {Object.keys(assigneeWorkload).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No assigned tickets for this site
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryStats).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(count / totalTickets) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTickets.slice(0, 5).map((ticket) => (
                    <div key={ticket.ticket_id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground">{ticket.category_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            ticket.priority === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : ticket.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            ticket.status === 'ESCALATED'
                              ? 'bg-red-100 text-red-800'
                              : ticket.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : ticket.status === 'CLOSED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
