import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TicketIcon,
  Zap,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useNavigate } from "react-router-dom";
import { ticketDashboardApiService } from "@/services/ticketing_service/ticketdashboardapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useAuth } from "@/context/AuthContext";

export default function TicketDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [siteList, setSiteList] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();

  useEffect(() => {
    loadSiteLookup();
  }, []);

  useEffect(() => {
    if (selectedSiteId) {
      loadDashboard();
    }
  }, [selectedSiteId]);

  const loadSiteLookup = async () => {
    const response = await withLoader(async () => {
      return await siteApiService.getSiteLookup();
    });
    if (response?.success) {
      setSiteList(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedSiteId(response.data[0].id);
      }
    }
  };

  const loadDashboard = async () => {
    if (!selectedSiteId) return;
    const response = await withLoader(async () => {
      return await ticketDashboardApiService.getCompleteDashboard(
        selectedSiteId
      );
    });
    if (response?.success) {
      setDashboardData(response.data);
    } else {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const overview = dashboardData?.overview || {};
  const performance = dashboardData?.performance || {};
  const workloadDistribution =
    dashboardData?.team_workload?.technicians_workload || [];
  const categoryStatistics =
    dashboardData?.category_statistics?.statistics || [];
  const recentTickets = dashboardData?.recent_tickets?.tickets || [];

  const categoryDistribution = categoryStatistics.reduce(
    (acc: any, category: any) => {
      if (category.category_name) {
        acc[category.category_name] = category.total_tickets || 0;
      }
      return acc;
    },
    {}
  );

  const totalTickets = overview.total_tickets || 0;
  const openTickets = overview.new_tickets || 0;
  const escalatedTickets = overview.escalated_tickets || 0;
  const inProgressTickets = overview.in_progress_tickets || 0;
  const closedTickets = overview.closed_tickets || 0;
  const highPriorityTickets = overview.high_priority_tickets || 0;

  const last30DaysPending = performance.pending_tickets || 0;
  const last30DaysResolved = performance.resolved || 0;
  const last30DaysEscalated = performance.escalated || 0;
  const totalCreated = performance.total_created || 0;
  const resolutionRate = performance.resolution_rate || 0;
  const escalationRate = performance.escalation_rate || 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
            <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            
              <BarChart3 className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-primary">
                Ticketing Dashboard
              </h1>
            </div>
             <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.account_type}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-sidebar-primary">
                  Dashboard Overview
                </h2>
                <p className="text-muted-foreground">
                  Monitor ticket status and performance metrics
                </p>
              </div>
              <div className="flex gap-3">
                <Select
                  value={selectedSiteId}
                  onValueChange={setSelectedSiteId}
                >
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
                <Button onClick={() => navigate("/ticket-workload")}>
                  <Users className="h-4 w-4 mr-2" />
                  Workload Management
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="relative">
                  <ContentContainer>
                    <LoaderOverlay />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Tickets
                      </CardTitle>
                      <TicketIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalTickets}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All tickets for this site
                      </p>
                    </CardContent>
                  </ContentContainer>
                </Card>

                <Card className="relative">
                  <ContentContainer>
                    <LoaderOverlay />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        New Tickets
                      </CardTitle>
                      <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{openTickets}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Awaiting assignment
                      </p>
                    </CardContent>
                  </ContentContainer>
                </Card>

                <Card className="relative">
                  <ContentContainer>
                    <LoaderOverlay />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Escalated
                      </CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {escalatedTickets}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        SLA breached tickets
                      </p>
                    </CardContent>
                  </ContentContainer>
                </Card>

                <Card className="relative">
                  <ContentContainer>
                    <LoaderOverlay />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        In Progress
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {inProgressTickets}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Being worked on
                      </p>
                    </CardContent>
                  </ContentContainer>
                </Card>

                <Card className="relative">
                  <ContentContainer>
                    <LoaderOverlay />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Closed
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{closedTickets}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Resolved tickets
                      </p>
                    </CardContent>
                  </ContentContainer>
                </Card>

                <Card className="relative">
                  <ContentContainer>
                    <LoaderOverlay />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        High Priority
                      </CardTitle>
                      <Zap className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {highPriorityTickets}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Urgent attention needed
                      </p>
                    </CardContent>
                  </ContentContainer>
                </Card>
              </div>

              {/* Last 30 Days Analytics */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Last 30 Days Performance
                  </CardTitle>
                </CardHeader>
                <ContentContainer>
                  <LoaderOverlay />
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Pending Tickets
                        </p>
                        <p className="text-3xl font-bold">
                          {last30DaysPending}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {totalCreated} total created
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Resolved
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {last30DaysResolved}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {resolutionRate.toFixed(2)}% resolution rate
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Escalated
                        </p>
                        <p className="text-3xl font-bold text-red-600">
                          {last30DaysEscalated}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {escalationRate.toFixed(2)}% escalation rate
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </ContentContainer>
              </Card>

              {/* Assignee Workload Summary */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Workload Distribution
                  </CardTitle>
                </CardHeader>
                <ContentContainer>
                  <LoaderOverlay />
                  <CardContent>
                    <div className="space-y-4">
                      {workloadDistribution.map((workload: any) => (
                        <div
                          key={
                            workload.technician_name || workload.technician_id
                          }
                          className="flex items-center justify-between border-b pb-3 last:border-0"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {workload.technician_name ||
                                `Technician ${
                                  workload.technician_name?.substring(0, 8) ||
                                  "N/A"
                                }`}
                            </p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Open: {workload.open || 0}</span>
                              <span>
                                In Progress: {workload.in_progress || 0}
                              </span>
                              <span className="text-red-600">
                                Escalated: {workload.escalated || 0}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {workload.total || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total assigned
                            </p>
                          </div>
                        </div>
                      ))}
                      {workloadDistribution.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No assigned tickets for this site
                        </p>
                      )}
                    </div>
                  </CardContent>
                </ContentContainer>
              </Card>

              {/* Category Breakdown */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle>Tickets by Category</CardTitle>
                </CardHeader>
                <ContentContainer>
                  <LoaderOverlay />
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(categoryDistribution).map(
                        ([category_name, ticket_count]: [string, any]) => (
                          <div
                            key={category_name}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium">
                              {category_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{
                                    width: `${
                                      totalTickets > 0
                                        ? (ticket_count / totalTickets) * 100
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-8 text-right">
                                {ticket_count}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                      {Object.keys(categoryDistribution).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No category data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </ContentContainer>
              </Card>

              {/* Recent Tickets */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle>Recent Tickets</CardTitle>
                </CardHeader>
                <ContentContainer>
                  <LoaderOverlay />
                  <CardContent>
                    <div className="space-y-4">
                      {recentTickets.map((ticket: any) => (
                        <div
                          key={ticket.id || ticket.ticket_id}
                          className="flex items-center justify-between border-b pb-3 last:border-0"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {ticket.ticket_no} - {ticket.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ticket.category_name || ticket.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                ticket.priority === "HIGH" ||
                                ticket.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : ticket.priority === "MEDIUM" ||
                                    ticket.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {ticket.priority}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                ticket.status === "ESCALATED" ||
                                ticket.status === "escalated"
                                  ? "bg-red-100 text-red-800"
                                  : ticket.status === "IN_PROGRESS" ||
                                    ticket.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : ticket.status === "CLOSED" ||
                                    ticket.status === "closed"
                                  ? "bg-green-100 text-green-800"
                                  : ticket.status === "ON_HOLD" ||
                                    ticket.status === "on_hold" ||
                                    ticket.status === "ON HOLD" ||
                                    ticket.status === "on hold"
                                  ? "bg-orange-100 text-orange-800"
                                  : ticket.status === "OPEN" ||
                                    ticket.status === "open"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {recentTickets.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent tickets
                        </p>
                      )}
                    </div>
                  </CardContent>
                </ContentContainer>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
