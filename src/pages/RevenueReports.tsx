import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { useToast } from "@/hooks/use-toast";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, DollarSign, FileText,Target } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
//import { mockRevenueReports } from "@/data/mockFinancialsData";
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import { revenueReportsApiService } from "@/services/financials/revenuereportsapi";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useAuth } from "@/context/AuthContext";



interface RevenueReportsOverview {
  TotalRevenue: number;
  RentRevenue:  number;
  CamRevenue:  number;
  CollectionRate:  number;
}
  
  export default function RevenueReports() {
  const { toast } = useToast();
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [siteList, setSiteList] = useState<any[]>([]);
  const[trendData,setTrendData]=useState<any[]>([]);
  const[sourceData,setSourceData]=useState<any[]>([]);
  const[outstandingReceivablesData,setOutstandingReceivablesData]=useState<any[]>([]);
  const [revenueReportsOverview, setRevenueReportsOverview] = useState<RevenueReportsOverview>({
       TotalRevenue: 85.7,
  RentRevenue: 62.4,
  CamRevenue: 23.3,
  CollectionRate: 92.5,
    });


  const loadSiteLookup = async () => {
    const lookup = await withLoader(async () => {
      return await siteApiService.getSiteLookup();
    });
    if (lookup?.success) setSiteList(lookup.data || []);
  }

  const loadRevenueReportsMonthLookup = async () => {
    const response = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsMonthLookup();
    });
    if (response?.success && response.data) {
      setSelectedPeriod(response.data);
    }
  }

  const loadRevenueReportsByTrend = async () => {
    const params = new URLSearchParams();
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    if (selectedPeriod && selectedPeriod !== "all") {
      // Map period to month values (1, 2, 3, 4)
      const monthMap: Record<string, string> = {
        "Last_Month": "1",
        "Last_3_Months": "2",
        "Last_6_Months": "3",
        "Last_Year": "4"
      };
      if (monthMap[selectedPeriod]) {
        params.append("month", monthMap[selectedPeriod]);
      }
    }
    const trendData = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsByTrend(params);
    });
    if (trendData?.success) setTrendData(trendData.data || []);
  }
   
  const loadRevenueReportsBySource = async () => {
    const params = new URLSearchParams();
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    if (selectedPeriod && selectedPeriod !== "all") {
      const monthMap: Record<string, string> = {
        "Last_Month": "1",
        "Last_3_Months": "2",
        "Last_6_Months": "3",
        "Last_Year": "4"
      };
      if (monthMap[selectedPeriod]) {
        params.append("month", monthMap[selectedPeriod]);
      }
    }
    const sourceData = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsBySource(params);
    });
    if (sourceData?.success) setSourceData(sourceData.data || []);
  }
    
  const loadRevenueReportsByOutstandingReceivables = async () => {
    const params = new URLSearchParams();
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    if (selectedPeriod && selectedPeriod !== "all") {
      const monthMap: Record<string, string> = {
        "Last_Month": "1",
        "Last_3_Months": "2",
        "Last_6_Months": "3",
        "Last_Year": "4"
      };
      if (monthMap[selectedPeriod]) {
        params.append("month", monthMap[selectedPeriod]);
      }
    }
    const outstandingReceivablesData = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsByOutstandingReceivables(params);
    });
    if (outstandingReceivablesData?.success) setOutstandingReceivablesData(outstandingReceivablesData.data || []);
  }

  const loadRevenueReportsOverview = async () => {
    const params = new URLSearchParams();
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    if (selectedPeriod && selectedPeriod !== "all") {
      const monthMap: Record<string, string> = {
        "Last_Month": "1",
        "Last_3_Months": "2",
        "Last_6_Months": "3",
        "Last_Year": "4"
      };
      if (monthMap[selectedPeriod]) {
        params.append("month", monthMap[selectedPeriod]);
      }
    }
    const revenueReportsOverview = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsOverview(params);
    });
    if (revenueReportsOverview?.success) setRevenueReportsOverview(revenueReportsOverview.data || {});
  }

  useEffect(() => {
    loadSiteLookup();
    loadRevenueReportsMonthLookup();
  }, []);

  useEffect(() => {
    loadRevenueReportsByTrend();
    loadRevenueReportsBySource();
    loadRevenueReportsByOutstandingReceivables();
    loadRevenueReportsOverview();
  }, [selectedPeriod, selectedSite]);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold">
              Revenue Reports
            </h1>
          </div>

          {/* RIGHT SIDE */}
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


          <div className="flex-1 space-y-6 p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sidebar-primary">
                  Revenue Reports
                </h2>
                <p className="text-muted-foreground">
                  Financial performance and analytics
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>

            <ContentContainer>
              <LoaderOverlay />
              <div className="space-y-6">
                {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
               <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Last_Month">Last Month</option>
                  <option value="Last_3_Months">Last 3 Months</option>
                  <option value="Last_6_Months">Last 6 Months</option>
                  <option value="Last_Year">Last Year</option>
                </select>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Sites</option>
                  {siteList.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{revenueReportsOverview.TotalRevenue}L</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                      +12.5% from last period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rent Revenue</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{revenueReportsOverview.RentRevenue}L</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                      +8.3% from last period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CAM Revenue</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{revenueReportsOverview.CamRevenue}L</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                      -2.1% from last period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{revenueReportsOverview.CollectionRate}%</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                      +3.2% from last period
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Trend Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="rent"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                        <Area
                          type="monotone"
                          dataKey="cam"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                        />
                        <Area
                          type="monotone"
                          dataKey="utilities"
                          stackId="1"
                          stroke="#ffc658"
                          fill="#ffc658"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Source</CardTitle>
                    <CardDescription>Current period breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                           data={sourceData && sourceData.length > 0 ? sourceData : []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(sourceData && sourceData.length > 0 ? sourceData : []).map((entry, index) => {
                          const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
                           return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}

                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Outstanding Receivables */}
              <Card>
                <CardHeader>
                  <CardTitle>Outstanding Receivables</CardTitle>
                  <CardDescription>Aging analysis of pending payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart  data={outstandingReceivablesData && outstandingReceivablesData.length > 0 ? outstandingReceivablesData : []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </div>
            </ContentContainer>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}