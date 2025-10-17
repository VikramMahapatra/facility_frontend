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
  EnergyOverview 
} from "@/components/DashboardCards";
import { 
  RevenueChart, 
  OccupancyChart, 
  MaintenanceChart, 
  EnergyChart, 
  FloorOccupancyChart 
} from "@/components/DashboardCharts";
import { dashboardApiService } from "@/services/dashboardapi";

interface User {
  id: string;
  email: string;
  name: string;
  accountType: string;
  organizationName?: string;
  isAuthenticated: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
 
 

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser.isAuthenticated) {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
    } catch {
      navigate('/login');
    }
  }, [navigate]);



  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">F</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">FacilityOS</h1>
                    <p className="text-sm text-muted-foreground">
                      {user.organizationName || user.accountType} Dashboard
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.accountType}</p>
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
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  Welcome back, {user.name}!
                </h2>
                <p className="text-muted-foreground">
                  {user.organizationName 
                    ? `Managing facilities for ${user.organizationName}`
                    : "Your comprehensive property management dashboard"
                  }
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

              {/* Energy Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <EnergyOverview />
                <div className="lg:col-span-3">
                  {/* Additional content area */}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;