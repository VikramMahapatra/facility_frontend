import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leasingData, financialData, maintenanceData, energyData, occupancyData } from "@/data/mockPropertyData";

const COLORS = ['hsl(215 100% 25%)', 'hsl(156 73% 59%)', 'hsl(0 84.2% 60.2%)', 'hsl(45 93% 47%)'];

export function RevenueChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Monthly Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={financialData.monthlyRevenueTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px"
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary) / 0.1)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="rental" 
              stroke="hsl(var(--accent))" 
              fill="hsl(var(--accent) / 0.1)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function OccupancyChart() {
  const pieData = [
    { name: 'Occupied', value: occupancyData.occupiedSpaces, color: 'hsl(var(--accent))' },
    { name: 'Available', value: occupancyData.availableSpaces, color: 'hsl(var(--primary))' },
    { name: 'Out of Service', value: occupancyData.outOfServiceSpaces, color: 'hsl(var(--destructive))' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Space Occupancy</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-4 mt-4">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MaintenanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Orders by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={maintenanceData.priorityBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="priority" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px"
              }} 
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {maintenanceData.priorityBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EnergyChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Energy Consumption Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={energyData.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px"
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="electricity" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              name="Electricity (kWh)"
            />
            <Line 
              type="monotone" 
              dataKey="water" 
              stroke="hsl(var(--accent))" 
              strokeWidth={3}
              name="Water (gallons)"
            />
            <Line 
              type="monotone" 
              dataKey="gas" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={3}
              name="Gas (cubic ft)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function FloorOccupancyChart() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Occupancy by Floor</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={occupancyData.floorDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="floor" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px"
              }} 
            />
            <Bar dataKey="occupied" stackId="a" fill="hsl(var(--accent))" name="Occupied" />
            <Bar dataKey="available" stackId="a" fill="hsl(var(--primary))" name="Available" />
            <Bar dataKey="outOfService" stackId="a" fill="hsl(var(--destructive))" name="Out of Service" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}