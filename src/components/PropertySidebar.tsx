import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  Users,
  FileText,
  BarChart3,
  Wrench,
  Car,
  Zap,
  UserCheck,
  Hotel,
  ShoppingCart,
  Settings,
  Bell,
  Shield,
  Home,
  Calendar,
  CreditCard,
  Briefcase,
  Package,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Archive,
  Key,
  Receipt,
  Bot,
  Search,
  UserCog,
  FolderTree,
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
import { useAuth } from "../context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { navigationItems } from "@/data/navigationItems";

export function PropertySidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Overview"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleWiseNavigationItems, setRoleWiseNavigationItems] = useState<any[]>(
    []
  );
  const { canRead } = useAuth();
  const { systemName } = useSettings();

  // Ensure the group containing the current route is always expanded
  useEffect(() => {
    const activeGroups: string[] = [];

    const filteredRoleWiseNavigationItems = navigationItems
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => canRead(item.resource)),
      }))
      .filter((section) => section.items.length > 0);

    console.log("filtered pages:", filteredRoleWiseNavigationItems);

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
    setExpandedGroups((prev) =>
      prev.includes(groupTitle)
        ? prev.filter((g) => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  // Filter navigation items based on search query
  const filteredNavigationItems = roleWiseNavigationItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-primary">
                {systemName}
              </h2>
              <p className="text-xs text-sidebar-foreground">
                Property Management
              </p>
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
                          {!isCollapsed && (
                            <span className="ml-2 text-sm">{item.title}</span>
                          )}
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
