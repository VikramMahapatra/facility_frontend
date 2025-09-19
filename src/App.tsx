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
import Sites from "./pages/Sites";
import Buildings from "./pages/Buildings";
import Spaces from "./pages/Spaces";
import SpacesByKind from "./pages/SpacesByKind";
import SpaceGroups from "./pages/SpaceGroups";
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
          <Route path="/sites" element={<Sites />} />
          <Route path="/buildings" element={<Buildings />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/spaces/:kind" element={<SpacesByKind />} />
          <Route path="/space-groups" element={<SpaceGroups />} />
          <Route path="/leases" element={<Leases />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/lease-charges" element={<LeaseCharges />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
