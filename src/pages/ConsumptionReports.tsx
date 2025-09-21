import { useState } from "react";
import { Search, Filter, Download, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { mockConsumptionReports, mockMeterReadings, type ConsumptionReport } from "@/data/mockEnergyData";

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
    case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
    default: return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

const getTrendBadge = (trend: string, percentage: number) => {
  const variants = {
    up: "bg-red-100 text-red-800",
    down: "bg-green-100 text-green-800",
    stable: "bg-gray-100 text-gray-800"
  };
  return (
    <Badge className={variants[trend as keyof typeof variants]}>
      {trend === 'up' ? '+' : trend === 'down' ? '-' : '±'}{percentage}%
    </Badge>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Mock chart data
const consumptionChartData = [
  { name: 'Week 1', electricity: 850, water: 120, gas: 180 },
  { name: 'Week 2', electricity: 920, water: 110, gas: 165 },
  { name: 'Week 3', electricity: 780, water: 105, gas: 190 },
  { name: 'Week 4', electricity: 1030, water: 125, gas: 175 }
];

const costChartData = [
  { name: 'Jan', cost: 45000 },
  { name: 'Feb', cost: 38000 },
  { name: 'Mar', cost: 52000 },
  { name: 'Apr', cost: 41000 },
  { name: 'May', cost: 49000 },
  { name: 'Jun', cost: 43000 }
];

export default function ConsumptionReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("January 2024");
  const [selectedMeterKind, setSelectedMeterKind] = useState("all");

  const filteredReports = mockConsumptionReports.filter(report => {
    const matchesSearch = report.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.meterKind.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind = selectedMeterKind === "all" || report.meterKind === selectedMeterKind;
    return matchesSearch && matchesKind;
  });

  const totalConsumptionByKind = mockConsumptionReports.reduce((acc, report) => {
    acc[report.meterKind] = (acc[report.meterKind] || 0) + report.totalConsumption;
    return acc;
  }, {} as Record<string, number>);

  const totalCost = mockConsumptionReports.reduce((sum, report) => sum + report.cost, 0);
  const avgDailyCost = totalCost / 31; // Assuming January has 31 days

  const stats = [
    { 
      title: "Total Cost", 
      value: formatCurrency(totalCost), 
      icon: <BarChart3 className="h-4 w-4" />,
      trend: "up",
      trendValue: 12.5
    },
    { 
      title: "Electricity", 
      value: `${totalConsumptionByKind.electricity || 0} kWh`, 
      icon: <TrendingUp className="h-4 w-4 text-yellow-500" />,
      trend: "up",
      trendValue: 15.2
    },
    { 
      title: "Water", 
      value: `${totalConsumptionByKind.water || 0} m³`, 
      icon: <TrendingDown className="h-4 w-4 text-blue-500" />,
      trend: "down",
      trendValue: 8.1
    },
    { 
      title: "Daily Average", 
      value: formatCurrency(avgDailyCost), 
      icon: <Minus className="h-4 w-4 text-gray-500" />,
      trend: "stable",
      trendValue: 2.3
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Consumption Reports</h1>
              <p className="text-sm text-muted-foreground">Analyze utility consumption patterns and costs</p>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      {getTrendIcon(stat.trend)}
                      {stat.trendValue}% from last month
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Consumption Trends</CardTitle>
                  <CardDescription>Consumption patterns by utility type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={consumptionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="electricity" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2} 
                        name="Electricity (kWh)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="water" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        name="Water (m³)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="gas" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2}
                        name="Gas (m³)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Cost Analysis</CardTitle>
                  <CardDescription>Total utility costs over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Cost']} />
                      <Bar 
                        dataKey="cost" 
                        fill="hsl(var(--chart-1))" 
                        name="Total Cost"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Reports Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Consumption Reports</CardTitle>
                    <CardDescription>Detailed consumption analysis by site and utility type</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex items-center justify-between space-y-2 mb-6">
                  <div className="flex flex-1 items-center space-x-4 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search sites or utility types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <Select value={selectedMeterKind} onValueChange={setSelectedMeterKind}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Utility Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="gas">Gas</SelectItem>
                        <SelectItem value="people_counter">Footfall</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="January 2024">January 2024</SelectItem>
                        <SelectItem value="December 2023">December 2023</SelectItem>
                        <SelectItem value="November 2023">November 2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site</TableHead>
                      <TableHead>Utility Type</TableHead>
                      <TableHead>Total Consumption</TableHead>
                      <TableHead>Daily Average</TableHead>
                      <TableHead>Peak Usage</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="font-medium">{report.siteName}</div>
                          <div className="text-sm text-muted-foreground">{report.period}</div>
                        </TableCell>
                        <TableCell>
                          <div className="capitalize font-medium">{report.meterKind}</div>
                          <div className="text-sm text-muted-foreground">{report.unit}</div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {report.totalConsumption.toLocaleString()} {report.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          {report.averageDaily.toFixed(1)} {report.unit}
                        </TableCell>
                        <TableCell>
                          <span className="text-orange-600 font-medium">
                            {report.peakUsage.toFixed(1)} {report.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(report.cost)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(report.trend)}
                            {getTrendBadge(report.trend, report.trendPercentage)}
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
    </SidebarProvider>
  );
}