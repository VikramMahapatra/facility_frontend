import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Building2, Users, FileText, BarChart3, Wrench, Car, Zap, UserCheck,
  Hotel, ShoppingCart, Settings, Bell, Shield, Home, Calendar, CreditCard,
  Briefcase, Package, MapPin, AlertTriangle, TrendingUp, Archive, Key, Receipt, Bot, Search, UserCog
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home, resource: "dashboard" },
      { title: "Analytics", url: "/analytics", icon: TrendingUp, resource: "analytics" },
      { title: "AI Predictions", url: "/ai-predictions", icon: Bot, resource: "ai_predictions" },
    ]
  },
  {
    title: "Spaces & Sites",
    items: [
      { title: "Organizations", url: "/organizations", icon: Building2, resource: "organizations" },
      { title: "Sites (Properties)", url: "/sites", icon: MapPin, resource: "sites" },
      { title: "Buildings (Wings/Towers)", url: "/buildings", icon: Building2, resource: "buildings" },
      { title: "Space Groups (Templates)", url: "/space-groups", icon: Archive, resource: "space_groups" },
      { title: "Spaces", url: "/spaces", icon: Home, resource: "spaces" },
      { title: "Group Assignments", url: "/space-assignments", icon: Users, resource: "group_assignments" },
    ]
  },
  {
    title: "Leasing & Tenants",
    items: [
      { title: "Leases", url: "/leases", icon: FileText, resource: "leases" },
      { title: "Tenants", url: "/tenants", icon: Users, resource: "tenants" },
      { title: "Lease Charges", url: "/lease-charges", icon: Receipt, resource: "lease_charges" },
    ]
  },
  {
    title: "Financials",
    items: [
      { title: "Invoices & Payments", url: "/invoices", icon: BarChart3, resource: "invoices" },
      { title: "Revenue Reports", url: "/revenue-reports", icon: TrendingUp, resource: "revenue_reports" },
      { title: "Tax Management", url: "/tax-management", icon: Briefcase, resource: "tax_management" },
    ]
  },
  {
    title: "Maintenance & Assets",
    items: [
      { title: "Assets", url: "/assets", icon: Package, resource: "assets" },
      { title: "Work Orders", url: "/work-orders", icon: Wrench, resource: "work_orders" },
      { title: "Service Requests", url: "/service-requests", icon: AlertTriangle, resource: "service_requests" },
      { title: "Preventive Maintenance", url: "/preventive-maintenance", icon: Calendar, resource: "preventive_maintenance" },
    ]
  },
  {
    title: "Hospitality",
    items: [
      { title: "Bookings", url: "/bookings", icon: Hotel, resource: "bookings" },
      { title: "Guests", url: "/guests", icon: Users, resource: "guests" },
      { title: "Rate Plans", url: "/rates", icon: CreditCard, resource: "rate_plans" },
      { title: "Folios", url: "/folios", icon: Receipt, resource: "folios" },
      { title: "Housekeeping", url: "/housekeeping", icon: Shield, resource: "housekeeping" },
    ]
  },
  {
    title: "Procurement",
    items: [
      { title: "Vendors", url: "/vendors", icon: Building2, resource: "vendors" },
      { title: "Contracts", url: "/contracts", icon: FileText, resource: "contracts" },
    ]
  },
  {
    title: "Parking & Access",
    items: [
      { title: "Parking Zones", url: "/parking-zones", icon: Car, resource: "parking_zones" },
      { title: "Access Logs", url: "/access-logs", icon: Key, resource: "access_logs" },
      { title: "Visitor Management", url: "/visitors", icon: UserCheck, resource: "visitors" },
    ]
  },
  {
    title: "Energy & IoT",
    items: [
      { title: "Meters & Readings", url: "/meters", icon: Zap, resource: "meter_readings" },
      { title: "Consumption Reports", url: "/consumption", icon: BarChart3, resource: "consumption_reports" },
    ]
  },
  {
    title: "AI & Automation",
    items: [
      { title: "AI ChatBot", url: "/chatbot", icon: Bot, resource: "ai_chatbot" },
    ]
  },
  {
    title: "Access Control",
    items: [
      { title: "Roles Management", url: "/roles", icon: Shield, resource: "roles" },
      { title: "Role Policies", url: "/role-policies", icon: UserCog, resource: "role_policies" },
      { title: "Users Management", url: "/users-management", icon: Users, resource: "users_management" },
      { title: "Pending Approvals", url: "/pending-approvals", icon: UserCheck, resource: "pending_approvals" },
      { title: "Approval Rules", url: "/approval-rules", icon: Shield, resource: "approval_rules" },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Notifications", url: "/notifications", icon: Bell, resource: "notifications" },
      { title: "Settings", url: "/settings", icon: Settings, resource: "settings" },
      { title: "Documentation", url: "/documentation", icon: FileText, resource: "documentation" },
    ]
  }
];

export function PropertySidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Overview"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleWiseNavigationItems, setRoleWiseNavigationItems] = useState<any[]>([]);

  const storedUser = localStorage.getItem("loggedInUser");
  const user = JSON.parse(storedUser);

  // Ensure the group containing the current route is always expanded
  useEffect(() => {
    const activeGroups: string[] = [];

    const filteredRoleWiseNavigationItems = navigationItems
      .map((section) => ({
        ...section,
        items: section.items
          .filter((item) => userCanView(item.resource))
      }))
      .filter((section) => section.items.length > 0);

    console.log("filetered pages:", filteredRoleWiseNavigationItems);

    setRoleWiseNavigationItems(filteredRoleWiseNavigationItems);

    filteredRoleWiseNavigationItems.forEach((section) => {
      if (section.items.some((item) => currentPath.startsWith(item.url))) {
        activeGroups.push(section.title);
      }
    });
    setExpandedGroups((prev) => {
      // Merge previous expanded groups with activeGroups, avoiding duplicates
      const merged = Array.from(new Set([...prev, ...activeGroups]));
      return merged;
    });
  }, [currentPath]);
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (isActiveRoute: boolean) =>
    isActiveRoute
      ? "bg-sidebar-accent text-sidebar-primary font-medium"
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const userCanView = (resource?: string) => {
    if (!resource) return true; // allow if no restriction set

    console.log("user policies:", user.role_policies);
    return user.role_policies?.some(
      (policy) =>
        policy.resource === resource &&
        policy.action.toLowerCase() === "read"
    );
  };

  // Filter navigation items based on search query
  const filteredNavigationItems = roleWiseNavigationItems.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-primary">FacilityOS</h2>
              <p className="text-xs text-sidebar-foreground">Property Management</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <Building2 className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Search Box */}
      {!isCollapsed && (
        <div className="p-3 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
            <Input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8 text-sm bg-sidebar-accent/30 border-sidebar-border/50 focus:border-sidebar-primary"
            />
          </div>
        </div>
      )}

      <SidebarContent className="p-2">
        {filteredNavigationItems.map((section) => (
          <SidebarGroup key={section.title} className="mb-2">
            {!isCollapsed && (
              <SidebarGroupLabel
                className="text-sidebar-foreground/70 hover:text-sidebar-primary cursor-pointer flex items-center justify-between px-2 py-1"
                onClick={() => toggleGroup(section.title)}
              >
                <span className="text-xs font-medium">{section.title}</span>
                <span className="text-xs">
                  {expandedGroups.includes(section.title) ? "−" : "+"}
                </span>
              </SidebarGroupLabel>
            )}

            {(isCollapsed || expandedGroups.includes(section.title)) && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="mb-1">
                        <NavLink
                          to={item.url}
                          className={getNavClass(isActive(item.url))}
                          title={isCollapsed ? item.title : undefined}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span className="ml-2 text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}