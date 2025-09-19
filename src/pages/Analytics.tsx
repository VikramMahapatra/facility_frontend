import { useState } from "react";
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
import {
  TrendingUp, TrendingDown, Calendar, Filter, Download, RefreshCw,
  Building2, Users, DollarSign, Activity, Zap, Star, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  kpiData, revenueAnalytics, occupancyAnalytics, financialAnalytics,
  operationalAnalytics, accessAnalytics, tenantAnalytics, portfolioDistribution,
  comparativeAnalytics
} from "@/data/mockAnalyticsData";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("12m");
  const [selectedSite, setSelectedSite] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const KPICard = ({ kpi }: { kpi: typeof kpiData[0] }) => (
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
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
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
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="3m">Last 3 months</SelectItem>
                      <SelectItem value="6m">Last 6 months</SelectItem>
                      <SelectItem value="12m">Last 12 months</SelectItem>
                      <SelectItem value="ytd">Year to date</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="site-1">Grand Plaza</SelectItem>
                      <SelectItem value="site-2">Tech Park</SelectItem>
                      <SelectItem value="site-3">Luxury Hotel</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {kpiData.map((kpi, index) => (
                <KPICard key={index} kpi={kpi} />
              ))}
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="tenants">Tenants</TabsTrigger>
                <TabsTrigger value="access">Access</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              </TabsList>

              {/* Revenue Analytics */}
              <TabsContent value="revenue" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Revenue Trend & Forecast</CardTitle>
                      <CardDescription>Monthly revenue breakdown with 3-month forecast</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={[...revenueAnalytics.monthly, ...revenueAnalytics.forecasted]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area type="monotone" dataKey="total" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Total Revenue" />
                          <Area type="monotone" dataKey="rental" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Rental Income" />
                          <Area type="monotone" dataKey="cam" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} name="CAM Charges" />
                          <Line type="monotone" dataKey="parking" stroke="#8b5cf6" strokeWidth={3} name="Parking Revenue" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Site Profitability</CardTitle>
                      <CardDescription>Revenue vs expenses by property</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={financialAnalytics.profitability}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="site" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                          <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                          <Bar dataKey="profit" fill="#10b981" name="Profit" />
                        </BarChart>
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
                        <AreaChart data={financialAnalytics.collection}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="collected" stackId="1" stroke="#10b981" fill="#10b981" name="Collected %" />
                          <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Pending %" />
                          <Area type="monotone" dataKey="overdue" stackId="1" stroke="#ef4444" fill="#ef4444" name="Overdue %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Occupancy Analytics */}
              <TabsContent value="occupancy" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Occupancy Trends</CardTitle>
                      <CardDescription>Historical occupancy rates and availability</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={occupancyAnalytics.trend}>
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
                        <BarChart data={occupancyAnalytics.bySpaceType} layout="horizontal">
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
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percentage }) => `${name} (${percentage}%)`}
                          >
                            {portfolioDistribution.map((entry, index) => (
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

              {/* Financial Analytics */}
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Year-over-Year Performance</CardTitle>
                      <CardDescription>Key financial metrics comparison</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(comparativeAnalytics.yearOverYear).map(([key, data]) => (
                          <div key={key} className="text-center p-4 border rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground capitalize">{key}</h4>
                            <p className="text-2xl font-bold mt-2">
                              {key === 'occupancy' ? `${data.current}%` : `₹${(data.current / 1000).toFixed(0)}K`}
                            </p>
                            <div className={`flex items-center justify-center mt-2 ${
                              data.growth > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {data.growth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                              <span className="text-sm font-medium">{data.growth.toFixed(1)}%</span>
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
                        {comparativeAnalytics.siteComparison.map((site, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <h4 className="font-medium mb-2">{site.site}</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Occupancy:</span>
                                <span className="font-medium ml-1">{site.metrics.occupancy}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Revenue:</span>
                                <span className="font-medium ml-1">₹{(site.metrics.revenue / 1000).toFixed(0)}K</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Rating:</span>
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

              {/* Operations Analytics */}
              <TabsContent value="operations" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Efficiency</CardTitle>
                      <CardDescription>Work order completion trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={operationalAnalytics.maintenance}>
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
                        <ComposedChart data={operationalAnalytics.energy}>
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

              {/* Tenant Analytics */}
              <TabsContent value="tenants" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tenant Satisfaction</CardTitle>
                      <CardDescription>Service rating across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={tenantAnalytics.satisfaction}>
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
                        <LineChart data={tenantAnalytics.retention}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} name="Retention Rate %" />
                          <Bar dataKey="renewals" fill="#3b82f6" name="Renewals" />
                          <Bar dataKey="departures" fill="#ef4444" name="Departures" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Access Analytics */}
              <TabsContent value="access" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Visitor Trends</CardTitle>
                      <CardDescription>Entry and exit patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={accessAnalytics.daily}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={3} name="Unique Visitors" />
                          <Line type="monotone" dataKey="entries" stroke="#10b981" strokeWidth={2} name="Total Entries" />
                          <Line type="monotone" dataKey="exits" stroke="#f59e0b" strokeWidth={2} name="Total Exits" />
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
                        <AreaChart data={accessAnalytics.patterns}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="entries" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Entries" />
                          <Area type="monotone" dataKey="exits" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Exits" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Portfolio Overview */}
              <TabsContent value="portfolio" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Portfolio Heat Map</CardTitle>
                      <CardDescription>Occupancy distribution across floors and blocks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-2">
                        {occupancyAnalytics.heatmap.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg text-center text-white text-xs font-medium"
                            style={{
                              backgroundColor: `hsl(${item.occupancy * 1.2}, 70%, 50%)`,
                              opacity: 0.8 + (item.occupancy / 500)
                            }}
                          >
                            <div>{item.floor}</div>
                            <div>Block {item.block}</div>
                            <div className="font-bold">{item.occupancy}%</div>
                          </div>
                        ))}
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
                          <Badge variant="secondary">3 Sites</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Spaces</span>
                          <Badge variant="secondary">597 Units</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Avg Occupancy</span>
                          <Badge variant="outline" className="text-green-600">83.4%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Monthly Revenue</span>
                          <Badge variant="outline" className="text-blue-600">₹714.8K</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Collection Rate</span>
                          <Badge variant="outline" className="text-purple-600">96.8%</Badge>
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