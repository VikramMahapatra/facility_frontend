import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Users, BarChart3, Wrench, CreditCard, Zap, 
  TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign,
  Car, UserCheck, Calendar
} from "lucide-react";
import { dashboardStats, leasingData, maintenanceData, accessData, energyData } from "@/data/mockPropertyData";

const iconMap = {
  Building2,
  Users, 
  BarChart3,
  Wrench,
  CreditCard,
  Zap
};

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {dashboardStats.map((stat, index) => {
        const IconComponent = iconMap[stat.icon as keyof typeof iconMap];
        const isPositive = stat.trend === 'up';
        
        return (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  isPositive ? 'text-accent' : 'text-destructive'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm font-medium text-foreground">{stat.title}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function LeasingOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Leasing Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active Leases</span>
          <span className="text-xl font-semibold">{leasingData.activeLeases}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Renewals (30 days)</span>
            <Badge variant="outline" className="text-destructive border-destructive">
              {leasingData.renewalsDue30Days}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Renewals (60 days)</span>
            <Badge variant="outline" className="text-orange-500 border-orange-500">
              {leasingData.renewalsDue60Days}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Renewals (90 days)</span>
            <Badge variant="outline" className="text-primary border-primary">
              {leasingData.renewalsDue90Days}
            </Badge>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Collection Rate</span>
            <span className="text-accent font-semibold">{leasingData.rentCollectionRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MaintenanceOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="w-5 h-5" />
          <span>Maintenance Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{maintenanceData.openWorkOrders}</div>
            <div className="text-xs text-muted-foreground">Open</div>
          </div>
          <div className="text-center p-3 bg-accent/5 rounded-lg">
            <div className="text-2xl font-bold text-accent">{maintenanceData.closedWorkOrders}</div>
            <div className="text-xs text-muted-foreground">Closed</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming PM
            </span>
            <Badge variant="secondary">{maintenanceData.upcomingPM}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-muted-foreground">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Service Requests
            </span>
            <Badge variant="outline">{maintenanceData.activeServiceRequests}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-destructive">
              <Clock className="w-4 h-4 mr-2" />
              Assets at Risk
            </span>
            <Badge variant="destructive">{maintenanceData.assetsAtRisk}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccessOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5" />
          <span>Access & Parking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Today's Visitors</span>
          <span className="text-xl font-semibold text-accent">{accessData.todayVisitors}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-muted-foreground">
              <Car className="w-4 h-4 mr-2" />
              Parking Occupancy
            </span>
            <span className="font-semibold">{accessData.parkingOccupancy}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300" 
              style={{ width: `${accessData.parkingOccupancy}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {accessData.occupiedParking} of {accessData.totalParkingSpaces} spaces occupied
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Recent Access Events</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {accessData.recentAccessEvents.map((event, index) => (
              <div key={index} className="text-xs flex items-center justify-between">
                <span>{event.time} - {event.type}</span>
                <span className="text-muted-foreground">{event.location}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Financial Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-accent/5 rounded-lg">
            <div className="text-lg font-bold text-accent">$487.5K</div>
            <div className="text-xs text-muted-foreground">Monthly Income</div>
          </div>
          <div className="text-center p-3 bg-destructive/5 rounded-lg">
            <div className="text-lg font-bold text-destructive">$125.4K</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pending Invoices</span>
            <Badge variant="outline" className="text-orange-500 border-orange-500">45</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recent Payments</span>
            <span className="text-accent font-semibold">$342.1K</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Outstanding CAM</span>
            <span className="font-semibold">$78.9K</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EnergyOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Energy Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Consumption</span>
          <span className="text-xl font-semibold">{energyData.totalConsumption.toLocaleString()} kWh</span>
        </div>
        
        <div className="space-y-2">
          {energyData.alerts.map((alert, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold text-orange-700">{alert.type}</div>
                <div className="text-xs text-orange-600">{alert.message}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">Monthly trend: -2.3% vs last month</div>
        </div>
      </CardContent>
    </Card>
  );
}