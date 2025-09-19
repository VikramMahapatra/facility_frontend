import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, DollarSign, FileText, Calendar, Target } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockRevenueReports } from "@/data/mockFinancialsData";
import { useState } from "react";

export default function RevenueReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedSite, setSelectedSite] = useState("all");

  // Calculate summary metrics
  const totalRevenue = mockRevenueReports.reduce((sum, report) => sum + report.total, 0);
  const totalCollected = mockRevenueReports.reduce((sum, report) => sum + report.collected, 0);
  const totalOutstanding = mockRevenueReports.reduce((sum, report) => sum + report.outstanding, 0);
  const collectionRate = ((totalCollected / totalRevenue) * 100).toFixed(1);

  // Prepare chart data
  const chartData = mockRevenueReports.map(report => ({
    month: report.month,
    rent: report.rent,
    cam: report.cam,
    utilities: report.utilities,
    penalties: report.penalties,
    total: report.total,
    collected: report.collected,
    outstanding: report.outstanding,
    collectionRate: ((report.collected / report.total) * 100).toFixed(1)
  }));

  // Revenue composition data for pie chart
  const compositionData = [
    { name: 'Rent', value: mockRevenueReports.reduce((sum, r) => sum + r.rent, 0), color: '#8884d8' },
    { name: 'CAM', value: mockRevenueReports.reduce((sum, r) => sum + r.cam, 0), color: '#82ca9d' },
    { name: 'Utilities', value: mockRevenueReports.reduce((sum, r) => sum + r.utilities, 0), color: '#ffc658' },
    { name: 'Penalties', value: mockRevenueReports.reduce((sum, r) => sum + r.penalties, 0), color: '#ff7300' }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Reports</h1>
          <p className="text-muted-foreground">Financial performance and analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              <SelectItem value="site-1">Downtown Mall</SelectItem>
              <SelectItem value="site-2">Business Park</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {collectionRate}% collection rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -8.2% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(totalRevenue / mockRevenueReports.length).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per month average</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
              <Legend />
              <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Total Revenue" />
              <Area type="monotone" dataKey="collected" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Collected" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Composition */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Composition</CardTitle>
            <CardDescription>Breakdown by revenue streams</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Collection Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Rate Trend</CardTitle>
            <CardDescription>Monthly collection efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Collection Rate']} />
                <Line type="monotone" dataKey="collectionRate" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown by Category</CardTitle>
          <CardDescription>Monthly performance across revenue streams</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
              <Legend />
              <Bar dataKey="rent" stackId="revenue" fill="#8884d8" name="Rent" />
              <Bar dataKey="cam" stackId="revenue" fill="#82ca9d" name="CAM" />
              <Bar dataKey="utilities" stackId="revenue" fill="#ffc658" name="Utilities" />
              <Bar dataKey="penalties" stackId="revenue" fill="#ff7300" name="Penalties" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Outstanding Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding vs Collection Analysis</CardTitle>
          <CardDescription>Monthly comparison of collections and outstanding amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
              <Legend />
              <Bar dataKey="collected" fill="#82ca9d" name="Collected" />
              <Bar dataKey="outstanding" fill="#ff7300" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}