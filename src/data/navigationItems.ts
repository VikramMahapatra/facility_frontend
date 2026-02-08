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
  ShieldCheck,
  FolderTree,
  Ticket,
  CheckCircle2,
  Move,
} from "lucide-react";

export const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        resource: "dashboard",
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: TrendingUp,
        resource: "analytics",
      },
      // {
      //   title: "AI Predictions",
      //   url: "/ai-predictions",
      //   icon: Bot,
      //   resource: "ai_predictions",
      // },
    ],
  },
  {
    title: "Spaces & Sites",
    items: [
      {
        title: "Organizations",
        url: "/organizations",
        icon: Building2,
        resource: "organizations",
      },
      {
        title: "Sites (Properties)",
        url: "/sites",
        icon: MapPin,
        resource: "sites",
      },
      {
        title: "Buildings (Wings/Towers)",
        url: "/buildings",
        icon: Building2,
        resource: "buildings",
      },
      { title: "Spaces", url: "/spaces", icon: Home, resource: "spaces" },
      {
        title: "Space Groups (Templates)",
        url: "/space-groups",
        icon: Archive,
        resource: "space_groups",
      },
      {
        title: "Group Assignments",
        url: "/space-assignments",
        icon: Users,
        resource: "group_assignments",
      },
      {
        title: "Maintenance (CAM)",
        url: "/space-maintenance",
        icon: Wrench,
        resource: "spaces",
      },
    ],
  },
  {
    title: "Leasing & Tenants",
    items: [
      { title: "Tenants", url: "/tenants", icon: Users, resource: "tenants" },
      { title: "Leases", url: "/leases", icon: FileText, resource: "leases" },
      {
        title: "Lease Charges",
        url: "/lease-charges",
        icon: Receipt,
        resource: "lease_charges",
      },
      {
        title: "Lease Charge Codes",
        url: "/lease-charge-codes",
        icon: Key,
        resource: "leases_charge_codes",
      },
    ],
  },
  {
    title: "Ticketing Service",
    items: [
      {
        title: "Ticket Dashboard",
        url: "/ticket-dashboard",
        icon: BarChart3,
        resource: "ticket_dashboard",
      },
      {
        title: "Tickets",
        url: "/tickets",
        icon: AlertTriangle,
        resource: "tickets",
      },
      {
        title: "Ticket Categories",
        url: "/ticket-categories",
        icon: Archive,
        resource: "ticket_categories",
      },
      {
        title: "Ticket Category SLA",
        url: "/sla-policies",
        icon: ShieldCheck,
        resource: "sla_policies",
      },
      {
        title: "Ticket Work Orders",
        url: "/ticket-work-orders",
        icon: Wrench,
        resource: "tickets_work_order",
      },
      {
        title: "Workload Management",
        url: "/ticket-workload",
        icon: Users,
        resource: "workload_management",
      },
    ],
  },
  {
    title: "Procurement",
    items: [
      {
        title: "Vendors",
        url: "/vendors",
        icon: Building2,
        resource: "vendors",
      },
      {
        title: "Contracts",
        url: "/contracts",
        icon: FileText,
        resource: "contracts",
      },
    ],
  },
  {
    title: "Maintenance & Assets",
    items: [
      { title: "Assets", url: "/assets", icon: Package, resource: "assets" },
      {
        title: "Asset Categories",
        url: "/asset-categories",
        icon: FolderTree,
        resource: "asset_categories",
      },
      // {
      //   title: "Work Orders",
      //   url: "/work-orders",
      //   icon: Wrench,
      //   resource: "work_orders",
      // },
      // {
      //   title: "Service Requests",
      //   url: "/service-requests",
      //   icon: AlertTriangle,
      //   resource: "service_requests",
      // },
      {
        title: "Preventive Maintenance",
        url: "/preventive-maintenance",
        icon: Calendar,
        resource: "preventive_maintenance",
      },
    ],
  },
  // {
  //   title: "Hospitality",
  //   items: [
  //     {
  //       title: "Bookings",
  //       url: "/bookings",
  //       icon: Hotel,
  //       resource: "bookings",
  //     },
  //     { title: "Guests", url: "/guests", icon: Users, resource: "guests" },
  //     {
  //       title: "Rate Plans",
  //       url: "/rates",
  //       icon: CreditCard,
  //       resource: "rate_plans",
  //     },
  //     { title: "Folios", url: "/folios", icon: Receipt, resource: "folios" },
  //     {
  //       title: "Housekeeping",
  //       url: "/housekeeping",
  //       icon: Shield,
  //       resource: "housekeeping",
  //     },
  //   ],
  // },
  {
    title: "Parking & Access",
    items: [
      {
        title: "Parking Zones",
        url: "/parking-zones",
        icon: Car,
        resource: "parking_zones",
      },
      {
        title: "Parking Passes",
        url: "/parking-passes",
        icon: Ticket,
        resource: "parking_passes",
      },
      {
        title: "Access Logs",
        url: "/access-logs",
        icon: Key,
        resource: "access_logs",
      },
      {
        title: "Visitor Management",
        url: "/visitors",
        icon: UserCheck,
        resource: "visitors",
      },
    ],
  },
  {
    title: "Energy consumption",
    items: [
      {
        title: "Meters & Readings",
        url: "/meters",
        icon: Zap,
        resource: "meter_readings",
      },
      {
        title: "Consumption Reports",
        url: "/consumption",
        icon: BarChart3,
        resource: "consumption_reports",
      },
    ],
  },
  {
    title: "Financials",
    items: [
      {
        title: "Invoices & Payments",
        url: "/invoices",
        icon: BarChart3,
        resource: "invoices",
      },
      {
        title: "Revenue Reports",
        url: "/revenue-reports",
        icon: TrendingUp,
        resource: "revenue_reports",
      },
      {
        title: "Tax Management",
        url: "/tax-management",
        icon: Briefcase,
        resource: "tax_management",
      },
    ],
  },
  // {
  //   title: "AI & Automation",
  //   items: [
  //     {
  //       title: "AI ChatBot",
  //       url: "/chatbot",
  //       icon: Bot,
  //       resource: "ai_chatbot",
  //     },
  //   ],
  // },
  {
    title: "Approval Requests",
    items: [
      {
        title: "Users",
        url: "/pending-approvals",
        icon: UserCheck,
        resource: "pending_approvals",
      },
      {
        title: "Space Ownerships",
        url: "/space-ownership-approvals",
        icon: CheckCircle2,
        resource: "space_ownership_approvals",
      },
      {
        title: "Space Tenants",
        url: "/tenant-space-approvals",
        icon: CheckCircle2,
        resource: "tenant_space_approvals",
      },
      {
        title: "Space Move/Out",
        url: "/space-move-out-approvals",
        icon: Move,
        resource: "tenant_space_approvals",
      },
    ],
  },
  {
    title: "Access & Control",
    items: [
      {
        title: "Roles Management",
        url: "/roles",
        icon: Shield,
        resource: "roles",
      },
      {
        title: "Role Policies",
        url: "/role-policies",
        icon: UserCog,
        resource: "role_policies",
      },

      {
        title: "Users Management",
        url: "/users-management",
        icon: Users,
        resource: "users_management",
      },
      {
        title: "Approval Rules",
        url: "/approval-rules",
        icon: Shield,
        resource: "approval_rules",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
        resource: "notifications",
      },
      // {
      //   title: "Settings",
      //   url: "/settings",
      //   icon: Settings,
      //   resource: "settings",
      // },
      // {
      //   title: "Documentation",
      //   url: "/documentation",
      //   icon: FileText,
      //   resource: "documentation",
      // },
    ],
  },
];

export const pageHeaderOverrides = [
  {
    match: (path: string) => path === "/profile",
    meta: {
      title: "My Profile",
      breadcrumb: {
        current: {
          label: "My Profile",
          icon: UserCog,
        },
      },
    },
  },
];
