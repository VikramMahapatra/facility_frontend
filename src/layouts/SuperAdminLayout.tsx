import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Building2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import zentrixelLogo from "@/assets/zentrixel-logo.svg";
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

function SuperAdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-sidebar-border">
        {!isCollapsed ? (
          <div>
            <img
              src={zentrixelLogo}
              alt="Zentrixel"
              className="h-16 w-auto"
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <img
              src={zentrixelLogo}
              alt="Zentrixel"
              className="h-10 w-auto"
              draggable={false}
            />
          </div>
        )}
      </div>

      <SidebarContent className="p-2">
        <SidebarGroup className="mb-2">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/70 px-2 py-1">
              Overview
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="mb-1">
                  <NavLink
                    to="/super-admin/dashboard"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                    }
                    title={isCollapsed ? "Dashboard" : undefined}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {!isCollapsed && (
                      <span className="ml-2 text-sm">Dashboard</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="mb-1">
                  <NavLink
                    to="/super-admin/org-approvals"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                    }
                    title={isCollapsed ? "Organization Approvals" : undefined}
                  >
                    <Building2 className="h-4 w-4" />
                    {!isCollapsed && (
                      <span className="ml-2 text-sm">
                        Organization Approvals
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
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
          <PageHeader />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
