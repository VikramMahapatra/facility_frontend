import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Building2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { SuperAdminPageHeader } from "@/components/SuperAdminPageHeader";
import zentrixelLogo from "@/assets/zentrixel-logo-new.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { superAdminNavigationItems } from "@/data/navigationItems";
import { useEffect, useState } from "react";

function SuperAdminSidebar() {
  const { state } = useSidebar();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Administration"]);
  const currentPath = location.pathname;

  useEffect(() => {
    const activeGroups: string[] = [];

    setExpandedGroups((prev) => {
      // Merge previous expanded groups with activeGroups, avoiding duplicates
      const merged = Array.from(new Set([...prev, ...activeGroups]));
      return merged;
    });
  }, [currentPath]);
  const isCollapsed = state === "collapsed";

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const isActive = (path: string) => {
    const currentSegments = window.location.pathname.split("/").filter(Boolean);
    const pathSegments = path.split("/").filter(Boolean);

    // Compare segments one by one, ignoring UUIDs
    for (let i = 0; i < pathSegments.length; i++) {
      const curr = currentSegments[i];
      const seg = pathSegments[i];

      if (!curr || !seg) return false;

      if (UUID_REGEX.test(curr)) continue; // skip UUIDs in current URL

      if (curr !== seg) return false;
    }

    return true;
  };


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

  return (
    <Sidebar
      className={`flex flex-col ${isCollapsed ? "w-16" : "w-64"}`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-primary">
                FacilityOS
              </h2>
              <p className="text-xs text-sidebar-foreground">
                Property Management System
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
      <div className="flex-1 overflow-y-auto">
        {superAdminNavigationItems.map((section) => (
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
      </div>
      <div className="border-t border-sidebar-border p-4">

        <div className="flex flex-col items-center">

          <img
            src={zentrixelLogo}
            alt="Zentrixel"
            className={isCollapsed ? "h-8 w-8" : "h-10 w-auto"}
            draggable={false}
          />
        </div>
      </div>

    </Sidebar>
  );
}

export default function SuperAdminLayout() {
  const { user } = useAuth();

  if (!user || user.default_account_type !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Access Denied
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-x-hidden">
        <SuperAdminSidebar />

        <SidebarInset className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <SuperAdminPageHeader />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
