import { useState, useEffect } from 'react';
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
//import {  occupancyData, leasingData , financialData , dashboardStats } from "@/data/mockPropertyData";
import { dashboardApiService } from '@/services/dashboardapi';
import { useLoader } from '@/context/LoaderContext';
import ContentContainer from '@/components/ContentContainer';
import LoaderOverlay from '@/components/LoaderOverlay';

const COLORS = ['hsl(215 100% 25%)', 'hsl(156 73% 59%)', 'hsl(0 84.2% 60.2%)', 'hsl(45 93% 47%)'];

export function RevenueChart() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const { withLoader } = useLoader();

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      const resp = await withLoader(async () => {
        return await dashboardApiService.getMonthlyRevenueTrend();
      });
      if (resp?.success) setRevenueData(resp.data);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
      setRevenueData([]);
    }
  };

  return (
    <Card className="col-span-2 relative overflow-hidden">
      <CardHeader>
        <CardTitle>Monthly Revenue Trend</CardTitle>
      </CardHeader>
      <ContentContainer>
        <LoaderOverlay />
        <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
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
              dataKey="rental"
              stroke="hsl(var(--accent))"
              fill="hsl(var(--accent) / 0.1)"
              strokeWidth={2}
              name="Rental Income"
            />
            <Area
              type="monotone"
              dataKey="cam"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive) / 0.1)"
              strokeWidth={2}
              name="CAM Charges"
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary) / 0.1)"
              strokeWidth={2}
              name="Total Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
        </CardContent>
      </ContentContainer>
      {/* Coming soon overlay 
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center text-muted-foreground font-semibold pointer-events-none">
        Not Available
      </div>*/}
    </Card>
  );
}

export function OccupancyChart() {
  const [pieData, setPieData] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ total: number; occupancyRate: number } | null>(null);
  const { withLoader } = useLoader();

  useEffect(() => {
    loadOccupancy();
  }, []);

  const loadOccupancy = async () => {
    try {
      const resp = await withLoader(async () => {
        return await dashboardApiService.getSpaceOccupancy();
      });
      if (resp?.success) {
        const chartData = [
          { name: 'Occupied', value: resp.data.occupied, color: 'hsl(var(--accent))' },
          { name: 'Available', value: resp.data.available, color: 'hsl(var(--primary))' },
          { name: 'Out of Service', value: resp.data.outOfService, color: 'hsl(var(--destructive))' }
        ];
        setPieData(chartData);
        setMeta({ total: Number(resp.data.total), occupancyRate: Number(resp.data.occupancyRate) });
      }

    } catch (error) {
      console.error('Failed to load space occupancy:', error);
      setPieData([]);
      setMeta(null);
    }
  };

  const hasData = pieData.length > 0;

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Space Occupancy</CardTitle>
      </CardHeader>
      <ContentContainer>
        <LoaderOverlay />
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
        {meta && (
          <div className="mt-3 flex items-center justify-center gap-6 text-sm">
            <span>
              Total Spaces: <strong>{meta.total}</strong>
            </span>
            <span>
              Occupancy Rate: <strong>{meta.occupancyRate}%</strong>
            </span>
          </div>
        )}
        {hasData && (
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
        )}
        </CardContent>
      </ContentContainer>
    </Card>
  );
}

export function MaintenanceChart() {
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const { withLoader } = useLoader();

  useEffect(() => {
    loadPriority();
  }, []);

  const loadPriority = async () => {
    try {
      const resp = await withLoader(async () => {
        return await dashboardApiService.getWorkOrdersPriority();
      });
      if (resp?.success) setPriorityData(resp.data);
    } catch (error) {
      console.error('Failed to load work orders priority:', error);
      setPriorityData([]);
    }
  }
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Work Orders by Priority</CardTitle>
      </CardHeader>
      <ContentContainer>
        <LoaderOverlay />
        <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={priorityData}>
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
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </CardContent>
      </ContentContainer>
    </Card>
  );
}

export function EnergyChart() {
  const [energyTrend, setEnergyTrend] = useState<any[]>([]);
  const { withLoader } = useLoader();

  useEffect(() => {
    loadEnergy();
  }, []);

  const loadEnergy = async () => {
    try {
      const resp = await withLoader(async () => {
        return await dashboardApiService.getEnergyConsumptionTrend();
      });
      if (resp?.success) setEnergyTrend(resp.data);
    } catch (error) {
      console.error('Failed to load energy trend:', error);
      setEnergyTrend([]);
    }
  };

  return (
    <Card className="col-span-2 relative overflow-hidden">
      <CardHeader>
        <CardTitle>Energy Consumption Trend</CardTitle>
      </CardHeader>
      <ContentContainer>
        <LoaderOverlay />
        <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={energyTrend}>
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
      </ContentContainer>
      {/* Coming soon overlay 
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center text-muted-foreground font-semibold pointer-events-none">
        Not Available
      </div>*/}
    </Card>
  );
}

export function FloorOccupancyChart() {
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const { withLoader } = useLoader();

  useEffect(() => {
    loadOccupancyData();
  }, []);

  const loadOccupancyData = async () => {
    const resp = await withLoader(async () => {
      return await dashboardApiService.getOccupancyByFloor();
    });
    if (resp?.success) setOccupancyData(resp.data);
  };

  return (
    <Card className="col-span-3 relative">
      <CardHeader>
        <CardTitle>Occupancy by Floor</CardTitle>
      </CardHeader>
      <ContentContainer>
        <LoaderOverlay />
        <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={occupancyData}>
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
            <Bar dataKey="total" stackId="a" fill="hsl(var(--muted-foreground))" name="Total" />
          </BarChart>
        </ResponsiveContainer>
        </CardContent>
      </ContentContainer>
    </Card>
  );
}