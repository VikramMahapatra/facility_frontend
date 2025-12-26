import React, { useState, useEffect } from "react";
import {
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
//import { mockConsumptionReports, mockMeterReadings, type ConsumptionReport } from "@/data/mockEnergyData";
import { consumptionApiService } from "@/services/energy_iot/consumptionapi";
import { useLoader } from "@/context/LoaderContext";
import ContentContainer from "@/components/ContentContainer";
import { useAuth } from "@/context/AuthContext";

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

const getTrendBadge = (trend: string, percentage: number) => {
  const variants = {
    up: "bg-red-100 text-red-800",
    down: "bg-green-100 text-green-800",
    stable: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge className={variants[trend as keyof typeof variants]}>
      {trend === "up" ? "+" : trend === "down" ? "-" : "±"}
      {percentage}%
    </Badge>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ConsumptionReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedMeterKind, setSelectedMeterKind] = useState("all");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [weeklyTrendData, setWeeklyTrendData] = useState<any[]>([]);
  const [monthlyCostAnalysisData, setMonthlyCostAnalysisData] = useState<any[]>(
    []
  );
  const [utilityTypes, setUtilityTypes] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<any[]>([]);
  const [consumptionReports, setConsumptionReports] = useState<any[]>([]);
  const [loadingWeeklyTrend, setLoadingWeeklyTrend] = useState(false);
  const [loadingMonthlyCost, setLoadingMonthlyCost] = useState(false);
  const [loadingConsumptionReports, setLoadingConsumptionReports] =
    useState(false);
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();

  useEffect(() => {
    loadOverviewData();
    loadWeeklyTrendData();
    loadMonthlyCostAnalysisData();
    loadUtilityTypes();
    loadAvailableMonths();
    loadConsumptionReports();
  }, []);

  useEffect(() => {
    loadConsumptionReports();
  }, [selectedPeriod, selectedMeterKind]);

  const loadUtilityTypes = async () => {
    const types = await withLoader(async () => {
      return await consumptionApiService.getConsumptionReportsTypeLookup();
    });
    if (types?.success) setUtilityTypes(types.data || []);
  };

  const loadAvailableMonths = async () => {
    const months = await withLoader(async () => {
      return await consumptionApiService.getConsumptionReportsMonthLookup();
    });
    if (months?.success) setAvailableMonths(months.data || []);
  };

  const loadOverviewData = async () => {
    const data = await withLoader(async () => {
      return await consumptionApiService.getOverview();
    });
    if (data?.success) setOverviewData(data.data || null);
  };

  const loadWeeklyTrendData = async () => {
    setLoadingWeeklyTrend(true);
    try {
      const data = await consumptionApiService.getWeeklyConsumptionTrend();
      if (data?.success) setWeeklyTrendData(data.data || []);
    } finally {
      setLoadingWeeklyTrend(false);
    }
  };

  const loadMonthlyCostAnalysisData = async () => {
    setLoadingMonthlyCost(true);
    try {
      const data = await consumptionApiService.getMonthlyCostAnalysis();
      if (data?.success) setMonthlyCostAnalysisData(data.data || []);
    } finally {
      setLoadingMonthlyCost(false);
    }
  };

  const loadConsumptionReports = async () => {
    const params = new URLSearchParams();
    if (selectedMeterKind && selectedMeterKind !== "all") {
      params.append("utility_type", selectedMeterKind);
    }
    if (selectedPeriod && selectedPeriod !== "all") {
      params.append("month", selectedPeriod);
    }

    setLoadingConsumptionReports(true);
    try {
      const data = await consumptionApiService.getConsumptionReports(params);
      if (data?.success) {
        const reports = data.data?.data || data.data || [];
        setConsumptionReports(Array.isArray(reports) ? reports : []);
      }
    } finally {
      setLoadingConsumptionReports(false);
    }
  };

  /* const filteredReports = mockConsumptionReports.filter(report => {
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
      //value: formatCurrency(totalCost), 
      value: overviewData?.totalCost, 
      icon: <BarChart3 className="h-4 w-4" />,
      //trend: "up",
      //trendValue: 12.5
      trend: overviewData?.totalCostTrend,
      trendValue: overviewData?.totalCostTrendValue
    },
    { 
      title: "Electricity", 
     // value: `${totalConsumptionByKind.electricity || 0} kWh`,
      value: overviewData?.electricity, 
      icon: <TrendingUp className="h-4 w-4 text-yellow-500" />,
      //trend: "up",
      //trendValue: 15.2
      trend: overviewData?.electricityTrend,
      trendValue: overviewData?.electricityTrendValue
    },
    { 
      title: "Water", 
      //value: `${totalConsumptionByKind.water || 0} m³`,
      value: overviewData?.water,      
      icon: <TrendingDown className="h-4 w-4 text-blue-500" />,
       //trend: "down",
      //trendValue: 8.1
      trend: overviewData?.waterTrend,
      trendValue: overviewData?.waterTrendValue
    },
    { 
      title: "Daily Average", 
      //value: formatCurrency(avgDailyCost), 
      value: overviewData?.dailyAverage, 
      icon: <Minus className="h-4 w-4 text-gray-500" />,
      //trend: "stable",
      //trendValue: 2.3
      trend: overviewData?.dailyAverageTrend,
      trendValue: overviewData?.dailyAverageTrendValue
    }
  ];
  */

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
            {/* LEFT SIDE */}
            <div className="flex items-start gap-3">
              <SidebarTrigger className="-ml-1 mt-1" />

              <div className="flex flex-col">
                {/* ICON + TITLE */}
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <h1 className="text-lg font-semibold">Consumption Reports</h1>
                </div>

                {/* SUBTITLE */}
                <p className="text-sm text-muted-foreground">
                  Analyze utility consumption patterns and costs
                </p>
              </div>
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

          <main className="flex-1 space-y-6 p-6">
            <ContentContainer>
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {overviewData && (
                    <>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Cost
                          </CardTitle>
                          <BarChart3 className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overviewData.Totalcost ||
                              overviewData.totalCost ||
                              "₹0"}
                          </div>
                          {/* <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>*/}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Electricity
                          </CardTitle>
                          <TrendingUp className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overviewData.Electricity ||
                              overviewData.electricity ||
                              "0"}{" "}
                            kWh
                          </div>
                          {/* <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>*/}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Water
                          </CardTitle>
                          <TrendingDown className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overviewData.Water || overviewData.water || "0"} m³
                          </div>
                          {/* <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          </div>*/}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Daily Average
                          </CardTitle>
                          <Minus className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overviewData.DailyAverage ||
                              overviewData.dailyAverage ||
                              "₹0"}
                          </div>
                          {/* <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Minus className="h-4 w-4 text-gray-500" />
                          </div>*/}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="relative">
                    {loadingWeeklyTrend && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>Weekly Consumption Trends</CardTitle>
                      <CardDescription>
                        Consumption patterns by utility type
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weeklyTrendData}>
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

                  <Card className="relative">
                    {loadingMonthlyCost && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>Monthly Cost Analysis</CardTitle>
                      <CardDescription>
                        Total utility costs over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyCostAnalysisData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [
                              formatCurrency(value as number),
                              "Cost",
                            ]}
                          />
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
                <Card className="relative">
                  {loadingConsumptionReports && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                      <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle>Consumption Reports</CardTitle>
                        <CardDescription>
                          Detailed consumption analysis by site and utility type
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="flex items-center justify-between space-y-2 mb-6">
                      <div className="flex flex-1 items-center space-x-4 max-w-xl">
                        <Select
                          value={selectedMeterKind}
                          onValueChange={setSelectedMeterKind}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Utility Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {utilityTypes
                              .filter(
                                (type) =>
                                  (type.value || type.id) &&
                                  (type.value || type.id) !== ""
                              )
                              .map((type) => {
                                const value = type.value || type.id;
                                const name = type.name || type.label;
                                return (
                                  <SelectItem key={value} value={String(value)}>
                                    {name}
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedPeriod}
                          onValueChange={setSelectedPeriod}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Months</SelectItem>
                            {availableMonths
                              .filter(
                                (month) =>
                                  (month.value || month.id) &&
                                  (month.value || month.id) !== ""
                              )
                              .map((month) => {
                                const value = month.value || month.id;
                                const name = month.name || month.label;
                                return (
                                  <SelectItem key={value} value={String(value)}>
                                    {name}
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
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
                        {consumptionReports.length > 0 ? (
                          consumptionReports.map(
                            (report: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {report.site || "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {report.utility_type || "-"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {report.total_consumption !== undefined
                                    ? `${report.total_consumption} ${
                                        report.unit || ""
                                      }`
                                    : report.consumption !== undefined
                                    ? `${report.consumption} ${
                                        report.unit || ""
                                      }`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {report.daily_average !== undefined
                                    ? `${report.daily_average} ${
                                        report.unit || ""
                                      }`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {report.peak_usage !== undefined
                                    ? `${report.peak_usage} ${
                                        report.unit || ""
                                      }`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {report.cost !== undefined
                                    ? formatCurrency(report.cost)
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {report.trend ? (
                                    <div className="flex items-center gap-1">
                                      {getTrendIcon(report.trend)}
                                      {report.trend_percentage !==
                                        undefined && (
                                        <span className="text-xs">
                                          {report.trend_percentage}%
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          )
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center text-muted-foreground py-8"
                            >
                              No consumption data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </ContentContainer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
