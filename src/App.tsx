import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import LeaseCharges from "./pages/LeaseCharges";
import Invoices from "./pages/Invoices";
import RevenueReports from "./pages/RevenueReports";
import TaxManagement from "./pages/TaxManagement";
import Assets from "./pages/Assets";
import WorkOrders from "./pages/WorkOrders";
import ServiceRequests from "./pages/ServiceRequests";
import PreventiveMaintenance from "./pages/PreventiveMaintenance";
import Vendors from "./pages/Vendors";
import Contracts from "./pages/Contracts";
import MetersReadings from "./pages/MetersReadings";
import ConsumptionReports from "./pages/ConsumptionReports";
import Bookings from "./pages/Bookings";
import RatePlans from "./pages/RatePlans";
import Housekeeping from "./pages/Housekeeping";
import ChatBot from "./pages/ChatBot";
import ParkingZones from "./pages/ParkingZones";
import AccessLogs from "./pages/AccessLogs";
import Visitors from "./pages/Visitors";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/buildings" element={<Buildings />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/spaces/:kind" element={<SpacesByKind />} />
          <Route path="/space-groups" element={<SpaceGroups />} />
          <Route path="/space-assignments" element={<SpaceAssignments />} />
          <Route path="/leases" element={<Leases />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/lease-charges" element={<LeaseCharges />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/revenue-reports" element={<RevenueReports />} />
          <Route path="/tax-management" element={<TaxManagement />} />
          <Route path="/assets" element={<Assets />} />
        <Route path="/work-orders" element={<WorkOrders />} />
        <Route path="/service-requests" element={<ServiceRequests />} />
        <Route path="/preventive-maintenance" element={<PreventiveMaintenance />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/meters" element={<MetersReadings />} />
        <Route path="/consumption" element={<ConsumptionReports />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/rates" element={<RatePlans />} />
        <Route path="/housekeeping" element={<Housekeeping />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/parking-zones" element={<ParkingZones />} />
        <Route path="/access-logs" element={<AccessLogs />} />
        <Route path="/visitors" element={<Visitors />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
