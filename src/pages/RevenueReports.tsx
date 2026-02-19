import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Target,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
//import { mockRevenueReports } from "@/data/mockFinancialsData";
import { useState } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import { revenueReportsApiService } from "@/services/financials/revenuereportsapi";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { AsyncAutocompleteRQ } from "@/components/common/async-autocomplete-rq";
import { useSettings } from "@/context/SettingsContext";

interface RevenueReportsOverview {
  TotalRevenue: number;
  RENTRevenue: number;
  CAMRevenue: number;
  CollectionRate: number;
}

export default function RevenueReports() {
  const { toast } = useToast();
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [siteList, setSiteList] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [chargeCodes, setChargeCodes] = useState<string[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [outstandingReceivablesData, setOutstandingReceivablesData] = useState<
    any[]
  >([]);
  const { systemCurrency } = useSettings();
  const [revenueReportsOverview, setRevenueReportsOverview] =
    useState<RevenueReportsOverview>({
      TotalRevenue: 0.0,
      RENTRevenue: 0.0,
      CAMRevenue: 0.0,
      CollectionRate: 0.0,
    });

  const loadSiteLookup = async () => {
    const lookup = await withLoader(async () => {
      return await siteApiService.getSiteLookup();
    });
    if (lookup?.success) setSiteList(lookup.data || []);
  };

  const loadRevenueReportsMonthLookup = async () => {
    const response = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsMonthLookup();
    });
    if (response?.success && response.data) {
      const validPeriods = [
        "Last_Month",
        "Last_3_Months",
        "Last_6_Months",
        "Last_Year",
      ];
      if (validPeriods.includes(response.data)) {
        setSelectedPeriod(response.data);
      }
    }
  };

  const loadRevenueReportsByTrend = async () => {
    const params = new URLSearchParams();
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    if (selectedPeriod && selectedPeriod !== "all") {
      // Map period to month values (1, 2, 3, 4)
      const monthMap: Record<string, string> = {
        Last_Month: "1",
        Last_3_Months: "2",
        Last_6_Months: "3",
        Last_Year: "4",
      };
      if (monthMap[selectedPeriod]) {
        params.append("month", monthMap[selectedPeriod]);
      }
    }
    const trendData = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsByTrend(params);
    });
    if (trendData?.success) {
      const data = trendData.data || [];
      if (data.length > 0) {
        // Get all charge code fields from the first item (excluding metadata fields)
        const firstItem = data[0];
        const metadataFields = [
          "month",
          "total",
          "collected",
          "outstanding",
          "penalties",
        ];
        const allChargeCodes = Object.keys(firstItem).filter(
          (key) => !metadataFields.includes(key.toLowerCase()),
        );

        // Store charge codes for dynamic rendering
        setChargeCodes(allChargeCodes);

        // Transform the data: convert strings to numbers
        const transformedData = data.map((item: any) => {
          const transformed: any = {
            month: item.month,
          };

          // Process each charge code - convert to numbers
          allChargeCodes.forEach((code) => {
            const codeLower = code.toLowerCase();
            transformed[codeLower] = Number(item[code] || 0);
          });

          return transformed;
        });
        setTrendData(transformedData);
      } else {
        setChargeCodes([]);
        setTrendData([]);
      }
    }
  };

  const loadRevenueReportsBySource = async () => {
    const params = new URLSearchParams();
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    if (selectedPeriod && selectedPeriod !== "all") {
      const monthMap: Record<string, string> = {
        Last_Month: "1",
        Last_3_Months: "2",
        Last_6_Months: "3",
        Last_Year: "4",
      };
      if (monthMap[selectedPeriod]) {
        params.append("month", monthMap[selectedPeriod]);
      }
    }
    const sourceData = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsBySource(params);
    });
    if (sourceData?.success) setSourceData(sourceData.data || []);
  };

  const loadRevenueReportsByOutstandingReceivables = async () => {
    const params = new URLSearchParams();
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    if (selectedPeriod && selectedPeriod !== "all") {
      const monthMap: Record<string, string> = {
        Last_Month: "1",
        Last_3_Months: "2",
        Last_6_Months: "3",
        Last_Year: "4",
      };
      if (monthMap[selectedPeriod]) {
        params.append("month", monthMap[selectedPeriod]);
      }
    }
    const outstandingReceivablesData = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsByOutstandingReceivables(
        params,
      );
    });
    if (outstandingReceivablesData?.success)
      setOutstandingReceivablesData(outstandingReceivablesData.data || []);
  };

  const loadRevenueReportsOverview = async () => {
    const params = new URLSearchParams();
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    if (selectedPeriod && selectedPeriod !== "all") {
      const monthMap: Record<string, string> = {
        Last_Month: "1",
        Last_3_Months: "2",
        Last_6_Months: "3",
        Last_Year: "4",
      };
      if (monthMap[selectedPeriod]) {
        params.append("month", monthMap[selectedPeriod]);
      }
    }
    const revenueReportsOverview = await withLoader(async () => {
      return await revenueReportsApiService.getRevenueReportsOverview(params);
    });
    if (revenueReportsOverview?.success)
      setRevenueReportsOverview(revenueReportsOverview.data || {});
  };

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

  const formatCurrency = (val?: number) => {
    if (val == null) return "-";
    return systemCurrency.format(val);
  };

  return (
    <div className="flex-1 space-y-6">
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
            <Select
              value={selectedPeriod || undefined}
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last_Month">Last Month</SelectItem>
                <SelectItem value="Last_3_Months">Last 3 Months</SelectItem>
                <SelectItem value="Last_6_Months">Last 6 Months</SelectItem>
                <SelectItem value="Last_Year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-[180px]">
              <AsyncAutocompleteRQ
                value={selectedSite}
                onChange={(value) => {
                  setSelectedSite(value);
                }}
                placeholder="All Sites"
                queryKey={["sites"]}
                queryFn={async (search) => {
                  const res = await siteApiService.getSiteLookup(search);
                  const sites = res.data.map((s: any) => ({
                    id: s.id,
                    label: s.name,
                  }));
                  return [{ id: "all", label: "All Sites" }, ...sites];
                }}
                fallbackOption={
                  selectedSite === "all"
                    ? { id: "all", label: "All Sites" }
                    : undefined
                }
                minSearchLength={0}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(revenueReportsOverview.TotalRevenue)}
                </div>
                {/* <p className="text-xs text-muted-foreground flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                        +12.5% from last period
                      </p>*/}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rent Revenue
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(revenueReportsOverview.RENTRevenue)}
                </div>
                {/* <p className="text-xs text-muted-foreground flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                        +8.3% from last period
                      </p>*/}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  CAM Revenue
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(revenueReportsOverview.CAMRevenue)}
                </div>
                {/* <p className="text-xs text-muted-foreground flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                        -2.1% from last period
                      </p>*/}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Collection Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueReportsOverview.CollectionRate}%
                </div>
                {/* <p className="text-xs text-muted-foreground flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                        +3.2% from last period
                      </p>*/}
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
                    {chargeCodes.map((code, index) => {
                      // Color palette for dynamic assignment
                      const colors = [
                        "#8884d8", // Purple
                        "#82ca9d", // Green
                        "#ffc658", // Yellow
                        "#ff6b6b", // Red
                        "#4ecdc4", // Teal
                        "#ffa500", // Orange
                        "#9b59b6", // Purple
                        "#3498db", // Blue
                        "#e74c3c", // Red
                        "#1abc9c", // Turquoise
                        "#f39c12", // Orange
                        "#34495e", // Dark Gray
                      ];
                      const color = colors[index % colors.length];
                      const dataKey = code.toLowerCase();

                      // Format charge code name for display
                      const formatChargeCodeName = (code: string) => {
                        const codeLower = code.toLowerCase();
                        const nameMap: Record<string, string> = {
                          rent: "Rent",
                          cam: "CAM",
                          utilities: "Utilities",
                          elec: "Electricity",
                          parking: "Parking",
                          penalties: "Penalties",
                        };
                        return nameMap[codeLower] || code.toUpperCase();
                      };

                      return (
                        <Area
                          key={code}
                          type="monotone"
                          dataKey={dataKey}
                          stackId="1"
                          stroke={color}
                          fill={color}
                          name={formatChargeCodeName(code)}
                        />
                      );
                    })}
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
                      data={
                        sourceData && sourceData.length > 0 ? sourceData : []
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(sourceData && sourceData.length > 0
                        ? sourceData
                        : []
                      ).map((entry, index) => {
                        const colors = [
                          "#0088FE",
                          "#00C49F",
                          "#FFBB28",
                          "#FF8042",
                          "#FF6B9D",
                          "#C44569",
                        ];
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend with grouped labels */}
                {sourceData && sourceData.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                      {(() => {
                        const data = sourceData;
                        const total = data.reduce(
                          (sum: number, d: any) => sum + d.value,
                          0,
                        );
                        const colors = [
                          "#0088FE",
                          "#00C49F",
                          "#FFBB28",
                          "#FF8042",
                          "#FF6B9D",
                          "#C44569",
                        ];

                        // Group entries by percentage
                        const groupedByPercent = data.reduce(
                          (acc: any, entry: any, index: number) => {
                            const percent = Math.round(
                              (entry.value / total) * 100,
                            );
                            if (!acc[percent]) {
                              acc[percent] = [];
                            }
                            acc[percent].push({
                              ...entry,
                              color: colors[index % colors.length],
                            });
                            return acc;
                          },
                          {},
                        );

                        // Sort by percentage descending
                        const sortedGroups = Object.keys(groupedByPercent)
                          .sort((a, b) => Number(b) - Number(a))
                          .map((percent) => ({
                            percent: Number(percent),
                            entries: groupedByPercent[percent],
                          }));

                        return sortedGroups.map((group) => (
                          <div
                            key={group.percent}
                            className="flex items-center gap-2 flex-wrap"
                          >
                            {group.entries.map((entry: any, idx: number) => (
                              <div
                                key={`${entry.name}-${idx}`}
                                className="flex items-center gap-1.5"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: entry.color,
                                  }}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {entry.name}
                                </span>
                                {idx === group.entries.length - 1 && (
                                  <span className="text-sm font-medium">
                                    {group.percent}%
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Outstanding Receivables */}
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Receivables</CardTitle>
              <CardDescription>
                Aging analysis of pending payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={
                    outstandingReceivablesData &&
                    outstandingReceivablesData.length > 0
                      ? outstandingReceivablesData
                      : []
                  }
                >
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
  );
}
