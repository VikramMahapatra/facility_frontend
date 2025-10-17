import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, DollarSign, FileText, Calendar, Target } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockRevenueReports } from "@/data/mockFinancialsData";
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { revenueReportsApiService } from "@/services/financials/revenuereportsapi";



interface RevenueReportsOverview {
  TotalRevenue: number;
  RentRevenue:  number;
  CamRevenue:  number;
  CollectionRate:  number;
}
  
  export default function RevenueReports() {
  const { toast } = useToast();
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


  useEffect(() => {
    loadSiteLookup();
  }, []);




  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  }

   

  useEffect(() => {
    loadRevenueReportsMonthLookup();
    loadRevenueReportsByTrend();
    loadRevenueReportsBySource();
    loadRevenueReportsByOutstandingReceivables();
    loadRevenueReportsOverview();
  }, []);
  

   const loadRevenueReportsMonthLookup= async () => {
      const selectedPeriod = await revenueReportsApiService.getRevenueReportsMonthLookup();
      setSelectedPeriod(selectedPeriod);
    }

    const loadRevenueReportsByTrend= async () => {
      const trendData = await revenueReportsApiService.getRevenueReportsByTrend();
      setTrendData(trendData);
    }
   
   
    const loadRevenueReportsBySource= async () => {
      const sourceData = await revenueReportsApiService.getRevenueReportsBySource();
     setSourceData(sourceData);
    }
    
    const loadRevenueReportsByOutstandingReceivables= async () => {
      const outstandingReceivablesData = await revenueReportsApiService.getRevenueReportsByOutstandingReceivables();
      setOutstandingReceivablesData(outstandingReceivablesData);
    }
    const loadRevenueReportsOverview= async () => {
      const revenueReportsOverview = await revenueReportsApiService.getRevenueReportsOverview();
     setRevenueReportsOverview(revenueReportsOverview);
    }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />

        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">Revenue Reports</h1>
                  <p className="text-sm text-muted-foreground">Financial performance and analytics</p>
                </div>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}