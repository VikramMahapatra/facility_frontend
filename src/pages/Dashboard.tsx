import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { LogOut, Building2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  StatsGrid,
  LeasingOverview,
  MaintenanceOverview,
  AccessOverview,
  FinancialSummary,
  EnergyOverview,
} from "@/components/DashboardCards";
import {
  RevenueChart,
  OccupancyChart,
  MaintenanceChart,
  EnergyChart,
  FloorOccupancyChart,
} from "@/components/DashboardCharts";
import { dashboardApiService } from "@/services/dashboardapi";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { PageHeader } from "@/components/PageHeader";

interface User {
  id: string;
  email: string;
  name: string;
  accountType: string;
  organizationName?: string;
  isAuthenticated: boolean;
}

const Dashboard = () => {
  const { user, handleLogout } = useAuth();
  const { systemName } = useSettings();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Stats are now imported from mock data

  return (
    <div>
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-muted-foreground">
            {user.default_organization_name
              ? `Managing facilities for ${user.default_organization_name}`
              : "Your comprehensive property management dashboard"}
          </p>
        </div>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LeasingOverview />
          <MaintenanceOverview />
          <AccessOverview />
          <FinancialSummary />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevenueChart />
          <OccupancyChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MaintenanceChart />
          <EnergyChart />
        </div>

        <FloorOccupancyChart />

        {/*
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <EnergyOverview />
          <div className="lg:col-span-3">
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default Dashboard;
