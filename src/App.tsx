import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Organizations from "./pages/Organizations";
import Sites from "./pages/Sites";
import Buildings from "./pages/Buildings";
import Spaces from "./pages/Spaces";
import SpacesByKind from "./pages/SpacesByKind";
import SpaceGroups from "./pages/SpaceGroups";
import SpaceAssignments from "./pages/SpaceAssignments";
import Leases from "./pages/Leases";
import Tenants from "./pages/Tenants";
import TenantFormPage from "./pages/TenantFormPage";
import TenantDetailPage from "./pages/TenantDetailPage";
import LeaseCharges from "./pages/LeaseCharges";
import LeaseChargeCode from "./pages/LeaseChargeCode";
import Invoices from "./pages/Invoices";
import InvoiceFormPage from "./pages/InvoiceFormPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import RevenueReports from "./pages/RevenueReports";
import TaxManagement from "./pages/TaxManagement";
import Assets from "./pages/Assets";
import AssetCategories from "./pages/AssetCategories";
import WorkOrders from "./pages/WorkOrders";
import ServiceRequests from "./pages/ServiceRequests";
import ServiceRequestDetail from "./pages/ServiceRequestDetail";
import PreventiveMaintenance from "./pages/PreventiveMaintenance";
import Vendors from "./pages/Vendors";
import Contracts from "./pages/Contracts";
import MetersReadings from "./pages/MetersReadings";
import ConsumptionReports from "./pages/ConsumptionReports";
import Bookings from "./pages/Bookings";
import RatePlans from "./pages/RatePlans";
import Guests from "./pages/Guests";
import Folios from "./pages/Folios";
import Housekeeping from "./pages/Housekeeping";
import ChatBot from "./pages/ChatBot";
import ParkingZones from "./pages/ParkingZones";
import ParkingPasses from "./pages/ParkingPasses";
import AccessLogs from "./pages/AccessLogs";
import Visitors from "./pages/Visitors";
import AiPredictions from "./pages/AiPredictions";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Documentation from "./pages/Documentation";
import RolesManagement from "./pages/RolesManagement";
import RolePolicies from "./pages/RolePolicies";
import TicketDetail from "./pages/TicketDetail";
import UsersManagement from "./pages/UsersManagement";
import UserManagementDetailPage from "./pages/UserManagementDetailPage";
import TicketWorkload from "./pages/TicketWorkload";
import TicketCategories from "./pages/TicketCategories";
import PendingApprovals from "./pages/PendingApprovals";
import TicketDashboard from "./pages/TicketDashboard";
import Tickets from "./pages/Tickets";
import ApprovalRules from "./pages/ApprovalRules";
import SLAPolicies from "./pages/SLAPolicies";
import TicketWorkOrders from "./pages/TicketWorkOrders";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProtectedLayout from "./components/ProtectedLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrationStatus from "./pages/RegistrationStatus";
import MainLayout from "./layouts/MainLayout";
import "./App.css";
import SpaceDetailPage from "./pages/SpaceDetailPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/registration-status" element={<RegistrationStatus />} />

                  {/* All protected pages go inside */}
                  <Route element={<ProtectedRoute></ProtectedRoute>}>
                    {/* Layout mounted ONCE */}
                    <Route element={<MainLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/ai-predictions" element={<AiPredictions />} />
                      <Route path="/organizations" element={<Organizations />} />
                      <Route path="/sites" element={<Sites />} />
                      <Route path="/buildings" element={<Buildings />} />
                      <Route path="/spaces" element={<Spaces />} />
                      <Route path="/spaces/:id" element={<SpaceDetailPage />} />
                      <Route path="/spaces/:kind" element={<SpacesByKind />} />
                      <Route path="/space-groups" element={<SpaceGroups />} />
                      <Route path="/space-assignments" element={<SpaceAssignments />} />
                      <Route path="/leases" element={<Leases />} />
                      <Route path="/tenants" element={<Tenants />} />
                      <Route path="/tenants/create" element={<TenantFormPage />} />
                      <Route path="/tenants/:id/edit" element={<TenantFormPage />} />
                      <Route path="/tenants/:id/view" element={<TenantDetailPage />} />
                      <Route path="/lease-charges" element={<LeaseCharges />} />
                      <Route path="/lease-charge-codes" element={<LeaseChargeCode />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/invoices/create" element={<InvoiceFormPage />} />
                      <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />
                      <Route path="/invoices/:id/view" element={<InvoiceDetailPage />} />
                      <Route path="/revenue-reports" element={<RevenueReports />} />
                      <Route path="/tax-management" element={<TaxManagement />} />
                      <Route path="/assets" element={<Assets />} />
                      <Route path="/asset-categories" element={<AssetCategories />} />
                      <Route path="/work-orders" element={<WorkOrders />} />
                      <Route path="/service-requests" element={<ServiceRequests />} />
                      <Route path="/service-requests/:id" element={<ServiceRequestDetail />} />
                      <Route path="/preventive-maintenance" element={<PreventiveMaintenance />} />
                      <Route path="/vendors" element={<Vendors />} />
                      <Route path="/contracts" element={<Contracts />} />
                      <Route path="/meters" element={<MetersReadings />} />
                      <Route path="/consumption" element={<ConsumptionReports />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/rates" element={<RatePlans />} />
                      <Route path="/guests" element={<Guests />} />
                      {/* <Route path="/folios" element={<Folios />} /> */}
                      <Route path="/housekeeping" element={<Housekeeping />} />
                      <Route path="/chatbot" element={<ChatBot />} />
                      <Route path="/parking-zones" element={<ParkingZones />} />
                      <Route path="/parking-passes" element={<ParkingPasses />} />
                      <Route path="/access-logs" element={<AccessLogs />} />
                      <Route path="/visitors" element={<Visitors />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/documentation" element={<Documentation />} />
                      <Route path="/roles" element={<RolesManagement />} />
                      <Route path="/role-policies" element={<RolePolicies />} />
                      <Route path="/users-management" element={<UsersManagement />} />
                      <Route path="/users-management/:id/view" element={<UserManagementDetailPage />} />
                      <Route path="/pending-approvals" element={<PendingApprovals />} />
                      <Route path="/ticket-dashboard" element={<TicketDashboard />} />
                      <Route path="/tickets" element={<Tickets />} />
                      <Route path="/tickets/:ticketId" element={<TicketDetail />} />
                      <Route path="/ticket-categories" element={<TicketCategories />} />
                      <Route path="/sla-policies" element={<SLAPolicies />} />
                      <Route path="/ticket-work-orders" element={<TicketWorkOrders />} />
                      <Route path="/ticket-workload" element={<TicketWorkload />} />
                      <Route path="/approval-rules" element={<ApprovalRules />} />
                    </Route>
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </QueryClientProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
