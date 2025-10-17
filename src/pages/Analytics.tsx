import { useState, useEffect } from "react";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter, RadialBarChart, RadialBar
} from "recharts";
//import { kpiData } from "@/data/mockAnalyticsData";
import { ArrowUpRight, ArrowDownRight, RefreshCw, Download, Users } from "lucide-react";
import { analyticsApiService } from "@/services/analyticsapi";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("12m");
  const [advanceAnalytics, setAdvanceAnalytics] = useState<AdvanceAnalytics[]>([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [siteProfitability, setSiteProfitability] = useState<any[]>([]);
  const [collectionPerformance, setCollectionPerformance] = useState<CollectionPerformance | null>(null);
  const [occupancyTrends, setOccupancyTrends] = useState<OccupancyTrends | null>(null);
  const [spaceTypePerformance, setSpaceTypePerformance] = useState<SpaceTypePerformance[]>([]);
  const [portfolioDistribution, setPortfolioDistribution] = useState<PortfolioDistribution[]>([]);
  const [yoyPerformance, setYoyPerformance] = useState<YoyPerformance | null>(null);
  const [siteComparison, setSiteComparison] = useState<SiteComparison[]>([]);
  const [maintenanceEfficiency, setMaintenanceEfficiency] = useState<MaintenanceEfficiency[]>([]);
  const [energyConsumption, setEnergyConsumption] = useState<EnergyConsumption[]>([]);
  const [dailyVisitorTrends, setDailyVisitorTrends] = useState<DailyVisitorTrends[] | null>(null);
  const [hourlyAccessPattern, setHourlyAccessPattern] = useState<HourlyAccessPattern[] | null>(null);
  const [tenantSatisfaction, setTenantSatisfaction] = useState<TenantSatisfaction[] | null>(null);
  const [tenantRetention, setTenantRetention] = useState<TenantRetention[] | null>(null);
  const [portfolioHeatmap, setPortfolioHeatmap] = useState<PortfolioHeatmap[] | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [selectedSite, setSelectedSite] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  
  // Dropdown data states
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [siteOptions, setSiteOptions] = useState<any[]>([]);

  interface AdvanceAnalytics {
    title: string;
    value: string;
    change: number;
    trend: string;
    subtitle: string;
    color: string;
  }

  interface RevenueAnalytics { 
    monthly: {
      date: string;
      rental: number;
      cam: number;
      parking: number;
      utilities: number;
      total: number;
    }[];
    forecasted: {
      date: string;
      rental: number;
      cam: number;
      parking: number;
      utilities: number;
      total: number;
    }[];
  }

  interface SiteProfitability {
    site: string;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  }

  interface CollectionPerformance {
    collection: {
      month: string;
      collected: number;
      pending: number;
      overdue: number;
    }[];
  }

  interface OccupancyTrends {
    trend: {
      date: string;
      occupancy: number;
      available: number;
      maintenance: number;
    }[];
  }

  interface SpaceTypePerformance {
    type: string;
    occupancy: number;
    total: number;
    occupied: number;
    available: number;
  }

  interface PortfolioDistribution {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }

  interface YoyPerformance {
    revenue: {
      current: number;
      previous: number;
      growth: number;
    };
    occupancy: {
      current: number;
      previous: number;
      growth: number;
    };
    expenses: {
      current: number;
      previous: number;
      growth: number;
    };
    profit: {
      current: number;
      previous: number;
      growth: number;
    };
  }

  interface SiteComparison {
    site: string;
    metrics: {
      occupancy: number;
      revenue: number;
      satisfaction: number;
      efficiency: number;
    };
  }

  interface MaintenanceEfficiency {
    month: string;
    completed: number;
    pending: number;
    overdue: number;
    efficiency: number;
  }

  interface EnergyConsumption {
    month: string;
    electricity: number;
    water: number;
    gas: number;
    cost: number;
  }

  interface DailyVisitorTrends {
    date: string;
    visitors: number;
    entries: number;
    exits: number;
    peak_hour: string;
  }

  interface HourlyAccessPattern {
    hour: string;
    entries: number;
    exits: number;
  }

  interface TenantSatisfaction {
    category: string;
    score: number;
    trend: number;
  }

  interface TenantRetention {
    year: number;
    renewals: number;
    departures: number;
    rate: number;
  }

  interface PortfolioHeatmap {
    floor: string;
    block: string;
    occupancy: number;
  }

  interface PerformanceSummary {
    "Total Properties": string;
    "Total Spaces": string;
    "Avg Occupancy": string;
    "Monthly Revenue": string;
    "Collection Rate": string;
  }
  
  const loadAdvanceAnalytics = async () => {
    const advanceObj = await analyticsApiService.getAdvanceAnalytics();
    setAdvanceAnalytics(advanceObj);
  };
  
  const loadRevenueAnalytics = async () => {
    const revenueObj = await analyticsApiService.getRevenueAnalytics();
    setRevenueAnalytics(revenueObj);
  };

  const loadSiteProfitability = async () => {
    const siteProfitObj = await analyticsApiService.getSiteProfitability();
    setSiteProfitability(siteProfitObj);
  };

  const loadCollectionPerformance = async () => {
    const collectionObj = await analyticsApiService.getCollectionPerformance();
    setCollectionPerformance(collectionObj);
  };

  const loadOccupancyTrends = async () => {
    const occupancyObj = await analyticsApiService.getOccupancyTrends();
    setOccupancyTrends(occupancyObj);
  };

  const loadSpaceTypePerformance = async () => {
    const spaceTypeObj = await analyticsApiService.getSpaceTypePerformance();
    setSpaceTypePerformance(spaceTypeObj);
  };

  const loadPortfolioDistribution = async () => {
    const portfolioObj = await analyticsApiService.getPortfolioDistribution();
    setPortfolioDistribution(portfolioObj);
  };

  const loadYoyPerformance = async () => {
    const yoyObj = await analyticsApiService.getYoyPerformance();
    setYoyPerformance(yoyObj);
  };

  const loadSiteComparison = async () => {
    const siteCompObj = await analyticsApiService.getSiteComparison();
    setSiteComparison(siteCompObj);
  };

  const loadMaintenanceEfficiency = async () => {
    const maintenanceObj = await analyticsApiService.getMaintenanceEfficiency();
    setMaintenanceEfficiency(maintenanceObj);
  };

  const loadEnergyConsumption = async () => {
    const energyObj = await analyticsApiService.getEnergyConsumption();
    setEnergyConsumption(energyObj);
  };

  const loadDailyVisitorTrends = async () => {
    const visitorObj = await analyticsApiService.getDailyVisitorTrends();
    setDailyVisitorTrends(visitorObj);
  };

  const loadHourlyAccessPattern = async () => {
    const accessObj = await analyticsApiService.getHourlyAccessPattern();
    setHourlyAccessPattern(accessObj);
  };

  const loadTenantSatisfaction = async () => {
    const satisfactionObj = await analyticsApiService.getTenantSatisfaction();
    setTenantSatisfaction(satisfactionObj);
  };

  const loadTenantRetention = async () => {
    const retentionObj = await analyticsApiService.getTenantRetention();
    setTenantRetention(retentionObj);
  };

  const loadPortfolioHeatmap = async () => {
    const heatmapObj = await analyticsApiService.getPortfolioHeatmap();
    setPortfolioHeatmap(heatmapObj);
  };

  const loadPerformanceSummary = async () => {
    const summaryObj = await analyticsApiService.getPerformanceSummary();
    setPerformanceSummary(summaryObj);
  };
  
  const loadMonthlyData = async () => {
    const monthlyObj = await analyticsApiService.getByMonth();
    setMonthlyData(monthlyObj);
  };
  
  const loadSiteOptions = async () => {
    const siteObj = await analyticsApiService.getSitePropertyLookup();
    setSiteOptions(siteObj);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadAdvanceAnalytics(),
      loadRevenueAnalytics(),
      loadSiteProfitability(),
      loadCollectionPerformance(),
      loadOccupancyTrends(),
      loadSpaceTypePerformance(),
      loadPortfolioDistribution(),
      loadYoyPerformance(),
      loadSiteComparison(),
      loadMaintenanceEfficiency(),
      loadEnergyConsumption(),
      loadDailyVisitorTrends(),
      loadHourlyAccessPattern(),
      loadTenantSatisfaction(),
      loadTenantRetention(),
      loadPortfolioHeatmap(),
      loadPerformanceSummary(),
      loadMonthlyData(),
      loadSiteOptions()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadAdvanceAnalytics();
    loadRevenueAnalytics();
    loadSiteProfitability();
    loadCollectionPerformance();  
    loadOccupancyTrends();
    loadSpaceTypePerformance();
    loadPortfolioDistribution();
    loadYoyPerformance();
    loadSiteComparison();
    loadMaintenanceEfficiency();
    loadEnergyConsumption();
    loadDailyVisitorTrends();
    loadHourlyAccessPattern();
    loadTenantSatisfaction();
    loadTenantRetention();
    loadPortfolioHeatmap();
    loadPerformanceSummary();
    loadMonthlyData();
    loadSiteOptions();
  }, [])

  const KPICard = ({ kpi }: { kpi: AdvanceAnalytics }) => (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {kpi.title}
          </CardTitle>
          <div className={`flex items-center space-x-1 ${
            kpi.trend === 'up' ? 'text-green-600' : 
            kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : 
             kpi.trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
            <span className="text-xs font-medium">
              {kpi.change > 0 ? '+' : ''}{kpi.change}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{kpi.value}</p>
          <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${typeof entry.value === 'number' ? 
                entry.value.toLocaleString() : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger className="mr-2" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold">Advanced Analytics</h1>
                  <p className="text-sm text-muted-foreground">Comprehensive insights & performance metrics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Months</SelectItem>
                      {monthlyData.map((item, index) => (
                        <SelectItem key={index} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {siteOptions.map((site, index) => (
                        <SelectItem key={index} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                     <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(advanceAnalytics ).map((kpi, index) => (
                <KPICard key={index} kpi={kpi} />
              ))}
            </div>

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="operational">Operations</TabsTrigger>
                <TabsTrigger value="tenant">Tenants</TabsTrigger>
                <TabsTrigger value="access">Access</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue" className="space-y-4">
                {/* Revenue Trends - Full Width */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend & Forecast</CardTitle>
                    <CardDescription>Monthly revenue breakdown with 3-month forecast</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <ResponsiveContainer width="100%" height={400}>
                       <ComposedChart data={revenueAnalytics?.monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="rental" stackId="1" stroke="#10b981" fill="#10b981" name="Rental Income" />
                        <Area type="monotone" dataKey="cam" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="CAM Charges" />
                        <Area type="monotone" dataKey="utilities" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Utilities" />
                        <Area type="monotone" dataKey="parking" stackId="1" stroke="#ef4444" fill="#ef4444" name="Parking" />
                        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} name="Total Revenue" />
                       </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Site Profitability and Collection Performance*/}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Site Profitability</CardTitle>
                      <CardDescription>Revenue vs expenses by property</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={siteProfitability}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="site" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                          <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                          <Bar dataKey="profit" fill="#10b981" name="Profit" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Collection Performance</CardTitle>
                      <CardDescription>Payment collection trends over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={collectionPerformance?.collection}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area type="monotone" dataKey="collected" stackId="1" stroke="#10b981" fill="#10b981" name="Collected %" />
                          <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Pending %" />
                          <Area type="monotone" dataKey="overdue" stackId="1" stroke="#ef4444" fill="#ef4444" name="Overdue %" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="occupancy" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Occupancy Trends</CardTitle>
                      <CardDescription>Historical occupancy rates and availability</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                         <AreaChart data={occupancyTrends?.trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                           <Area type="monotone" dataKey="occupancy" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} name="Occupied %" />
                           <Area type="monotone" dataKey="available" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Available %" />
                           <Area type="monotone" dataKey="maintenance" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} name="Maintenance %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Space Type Performance</CardTitle>
                      <CardDescription>Occupancy rates by space category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={spaceTypePerformance} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="type" type="category" width={80} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="occupancy" fill="#3b82f6" name="Occupancy %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio Distribution</CardTitle>
                      <CardDescription>Space allocation across property types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                              data={portfolioDistribution}
                            cx="50%"
                            cy="50%"
                             labelLine={true}
                             label={({ name, percentage }) => `${name} (${percentage}%)`}
                             outerRadius={100}
                             fill="#8884d8"
                             dataKey="value"
                           >
                              {(portfolioDistribution).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Year-over-Year Performance</CardTitle>
                      <CardDescription>Key financial metrics comparison</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {yoyPerformance && Object.entries(yoyPerformance).map(([key, data]) => (
                          <div key={key} className="text-center p-4 border rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground capitalize">{key}</h4>
                            <p className="text-2xl font-bold mt-2">
                              {typeof data === 'object' && data?.current ? 
                                (key === 'occupancy' ? `${data.current}%` : 
                                 key === 'revenue' || key === 'expenses' || key === 'profit' ? `₹${data.current.toLocaleString()}` : 
                                 data.current) : 
                               typeof data === 'string' ? data.replace('$', '₹') : 
                               String(data)}
                            </p>
                            <div className={`flex items-center justify-center mt-2 ${
                              typeof data === 'object' && data?.growth > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {typeof data === 'object' && data?.growth > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                              <span className="text-sm font-medium">
                                {typeof data === 'object' && data?.growth !== undefined ? `${data.growth}%` : 
                                 typeof data === 'string' ? data : 
                                 '0%'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Site Comparison</CardTitle>
                      <CardDescription>Performance across properties</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {siteComparison?.map((site, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <h4 className="font-medium mb-2">{site.site}</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Occupancy:</span>
                                <span className="font-medium ml-1">{site.metrics.occupancy}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Revenue:</span>
                                <span className="font-medium ml-1">₹{site.metrics.revenue.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Satisfaction:</span>
                                <span className="font-medium ml-1">{site.metrics.satisfaction}/5</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Efficiency:</span>
                                <span className="font-medium ml-1">{site.metrics.efficiency}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="operational" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Efficiency</CardTitle>
                      <CardDescription>Work order completion trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={maintenanceEfficiency}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="completed" fill="#10b981" name="Completed" />
                          <Bar yAxisId="left" dataKey="pending" fill="#f59e0b" name="Pending" />
                          <Bar yAxisId="left" dataKey="overdue" fill="#ef4444" name="Overdue" />
                          <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={3} name="Efficiency %" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Energy Consumption</CardTitle>
                      <CardDescription>Monthly utility usage and costs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={energyConsumption}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="electricity" fill="#3b82f6" name="Electricity (kWh)" />
                          <Bar yAxisId="left" dataKey="water" fill="#06b6d4" name="Water (L)" />
                          <Bar yAxisId="left" dataKey="gas" fill="#f59e0b" name="Gas (m³)" />
                          <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} name="Total Cost (₹)" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="access" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Visitor Trends</CardTitle>
                      <CardDescription>Entry and exit patterns over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyVisitorTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="visitors" stroke="#8884d8" strokeWidth={3} name="Unique Visitors" />
                          <Line type="monotone" dataKey="entries" stroke="#82ca9d" strokeWidth={2} name="Total Entries" />
                          <Line type="monotone" dataKey="exits" stroke="#ffc658" strokeWidth={2} name="Total Exits" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Hourly Access Patterns</CardTitle>
                      <CardDescription>Peak hours and traffic flow</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={hourlyAccessPattern}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="entries" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} name="Entries" />
                          <Area type="monotone" dataKey="exits" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.8} name="Exits" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tenant" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tenant Satisfaction</CardTitle>
                      <CardDescription>Service rating across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={tenantSatisfaction }>
                          <RadialBar dataKey="score" cornerRadius={10} fill="#3b82f6" />
                          <Tooltip content={<CustomTooltip />} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tenant Retention</CardTitle>
                      <CardDescription>Lease renewal trends over years</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={tenantRetention || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} name="Retention Rate %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Portfolio Heat Map</CardTitle>
                      <CardDescription>Occupancy distribution across floors and blocks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-2">
                        {(portfolioHeatmap || []).map((item, index) => {
                          const occupancyNum = item.occupancy || 0;
                          return (
                            <div 
                              key={index} 
                              className="p-3 rounded-lg text-center text-white text-xs font-medium"
                              style={{ 
                                backgroundColor: `hsl(${occupancyNum * 1.2}, 70%, 50%)`, 
                                opacity: 0.8 + (occupancyNum / 500) 
                              }}
                            >
                              <div>{item.floor}</div>
                              <div>{item.block}</div>
                              <div className="font-bold">{occupancyNum}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Summary</CardTitle>
                      <CardDescription>Key metrics overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Properties</span>
                          <Badge variant="secondary">{performanceSummary?.["Total Properties"] || "0 Sites"}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Spaces</span>
                          <Badge variant="secondary">{performanceSummary?.["Total Spaces"] || "0 Units"}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Avg Occupancy</span>
                          <Badge variant="outline" className="text-green-600">{performanceSummary?.["Avg Occupancy"] || "0%"}%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Monthly Revenue</span>
                          <Badge variant="outline" className="text-blue-600">{performanceSummary?.["Monthly Revenue"] || '₹0K'}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Collection Rate</span>
                          <Badge variant="outline" className="text-purple-600">{performanceSummary?.["Collection Rate"] || "0%"}%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}