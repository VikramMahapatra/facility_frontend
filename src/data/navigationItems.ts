import {
    Building2, Users, FileText, BarChart3, Wrench, Car, Zap, UserCheck,
    Hotel, ShoppingCart, Settings, Bell, Shield, Home, Calendar, CreditCard,
    Briefcase, Package, MapPin, AlertTriangle, TrendingUp, Archive, Key, Receipt, Bot, Search, UserCog
} from "lucide-react";

export const navigationItems = [
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

