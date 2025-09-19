// Mock data for property management dashboard

export const occupancyData = {
  totalSpaces: 248,
  occupiedSpaces: 187,
  availableSpaces: 45,
  outOfServiceSpaces: 16,
  occupancyRate: 75.4,
  floorDistribution: [
    { floor: "Ground", total: 65, occupied: 52, available: 10, outOfService: 3 },
    { floor: "1st Floor", total: 58, occupied: 43, available: 12, outOfService: 3 },
    { floor: "2nd Floor", total: 55, occupied: 42, available: 11, outOfService: 2 },
    { floor: "3rd Floor", total: 52, occupied: 38, available: 9, outOfService: 5 },
    { floor: "Basement", total: 18, occupied: 12, available: 3, outOfService: 3 }
  ]
};

export const leasingData = {
  activeLeases: 187,
  renewalsDue30Days: 12,
  renewalsDue60Days: 8,
  renewalsDue90Days: 15,
  rentCollectionRate: 94.2,
  camCollectionRate: 89.7,
  revenueShare: 156750,
  monthlyTrend: [
    { month: "Jan", leases: 182, renewals: 8, collection: 92.1 },
    { month: "Feb", leases: 184, renewals: 12, collection: 93.5 },
    { month: "Mar", leases: 186, renewals: 9, collection: 94.8 },
    { month: "Apr", leases: 187, renewals: 11, collection: 94.2 },
  ]
};

export const financialData = {
  pendingInvoices: 45,
  overdueAmount: 125420,
  monthlyRentalIncome: 487500,
  recentPayments: 342100,
  outstandingCAM: 78900,
  monthlyRevenueTrend: [
    { month: "Oct", rental: 465000, cam: 72000, total: 537000 },
    { month: "Nov", rental: 478000, cam: 75500, total: 553500 },
    { month: "Dec", rental: 483000, cam: 76800, total: 559800 },
    { month: "Jan", rental: 487500, cam: 78900, total: 566400 },
  ]
};

export const maintenanceData = {
  openWorkOrders: 28,
  closedWorkOrders: 156,
  upcomingPM: 23,
  activeServiceRequests: 14,
  assetsAtRisk: 7,
  priorityBreakdown: [
    { priority: "Critical", count: 3, color: "#ef4444" },
    { priority: "High", count: 8, color: "#f97316" },
    { priority: "Medium", count: 12, color: "#eab308" },
    { priority: "Low", count: 5, color: "#22c55e" }
  ]
};

export const accessData = {
  todayVisitors: 142,
  parkingOccupancy: 78.5,
  totalParkingSpaces: 120,
  occupiedParking: 94,
  recentAccessEvents: [
    { time: "09:45", type: "Entry", location: "Main Gate", user: "John Doe" },
    { time: "10:12", type: "Exit", location: "Parking Gate", user: "Jane Smith" },
    { time: "10:30", type: "Entry", location: "Service Entry", user: "Mike Wilson" },
  ]
};

export const hospitalityData = {
  currentBookings: 45,
  checkInsToday: 12,
  checkOutsToday: 8,
  housekeepingTasks: 23,
  occupancyRate: 87.3,
  avgRoomRate: 145,
  roomStatus: [
    { status: "Occupied", count: 45, color: "#22c55e" },
    { status: "Vacant Clean", count: 8, color: "#3b82f6" },
    { status: "Vacant Dirty", count: 5, color: "#f59e0b" },
    { status: "Out of Order", count: 2, color: "#ef4444" }
  ]
};

export const energyData = {
  totalConsumption: 45680, // kWh
  monthlyTrend: [
    { month: "Sep", electricity: 42500, water: 1250, gas: 890 },
    { month: "Oct", electricity: 44200, water: 1180, gas: 920 },
    { month: "Nov", electricity: 46800, water: 1320, gas: 850 },
    { month: "Dec", electricity: 45680, water: 1280, gas: 880 },
  ],
  alerts: [
    { type: "High Usage", message: "Building A electricity usage 15% above normal" },
    { type: "Meter Issue", message: "Water meter B-3 needs maintenance" }
  ]
};

export const dashboardStats = [
  {
    title: "Total Properties",
    value: "24",
    icon: "Building2",
    change: "+12%",
    trend: "up",
    description: "Active properties"
  },
  {
    title: "Occupancy Rate",
    value: "75.4%",
    icon: "Users", 
    change: "+3.2%",
    trend: "up",
    description: "Current occupancy"
  },
  {
    title: "Monthly Revenue",
    value: "$566.4K",
    icon: "BarChart3",
    change: "+8.1%", 
    trend: "up",
    description: "This month's income"
  },
  {
    title: "Work Orders",
    value: "28",
    icon: "Wrench",
    change: "-15%",
    trend: "down", 
    description: "Open tickets"
  },
  {
    title: "Rent Collection",
    value: "94.2%",
    icon: "CreditCard",
    change: "+2.1%",
    trend: "up",
    description: "Collection rate"
  },
  {
    title: "Energy Usage",
    value: "45.7K kWh",
    icon: "Zap",
    change: "-2.3%",
    trend: "down",
    description: "Monthly consumption"
  }
];