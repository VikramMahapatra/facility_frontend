import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Building2, Users, Wrench, Zap, Hotel, Car, Brain, FileText, TrendingUp, DollarSign, Shield, BarChart } from "lucide-react";

const Documentation = () => {
  const modules = [
    {
      category: "Space Management",
      icon: Building2,
      color: "from-blue-500 to-cyan-500",
      description: "Comprehensive tools for managing properties, buildings, and spaces across your entire portfolio.",
      features: [
        { name: "Organizations", desc: "Multi-tenant organization hierarchy management" },
        { name: "Sites & Buildings", desc: "Physical property structure and location tracking" },
        { name: "Spaces", desc: "Detailed space inventory with classifications by kind" },
        { name: "Space Groups", desc: "Logical grouping and zone management" },
        { name: "Space Assignments", desc: "Dynamic space allocation and tenant assignment" }
      ]
    },
    {
      category: "Leasing & Financials",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      description: "End-to-end lease lifecycle management with integrated financial operations and reporting.",
      features: [
        { name: "Lease Management", desc: "Contract lifecycle from creation to renewal" },
        { name: "Tenant Portal", desc: "Self-service tenant management interface" },
        { name: "Lease Charges", desc: "Automated billing and charge calculations" },
        { name: "Invoicing", desc: "Professional invoice generation and tracking" },
        { name: "Revenue Reports", desc: "Real-time financial analytics and forecasting" },
        { name: "Tax Management", desc: "Multi-jurisdiction tax compliance and reporting" }
      ]
    },
    {
      category: "Maintenance & Assets",
      icon: Wrench,
      color: "from-orange-500 to-red-500",
      description: "Proactive maintenance management with comprehensive asset tracking and vendor coordination.",
      features: [
        { name: "Asset Registry", desc: "Complete asset inventory with lifecycle tracking" },
        { name: "Work Orders", desc: "Digital work order management and dispatch" },
        { name: "Service Requests", desc: "Tenant-initiated maintenance request system" },
        { name: "Preventive Maintenance", desc: "Scheduled maintenance programs and compliance" },
        { name: "Vendor Management", desc: "Contractor network and performance tracking" },
        { name: "Contract Management", desc: "Service agreement administration" }
      ]
    },
    {
      category: "Energy Management",
      icon: Zap,
      color: "from-yellow-500 to-amber-500",
      description: "Smart energy monitoring and optimization for sustainability and cost reduction.",
      features: [
        { name: "Meter Readings", desc: "Automated utility meter data collection" },
        { name: "Consumption Reports", desc: "Energy usage analytics and benchmarking" },
        { name: "Sustainability Metrics", desc: "Carbon footprint and ESG reporting" }
      ]
    },
    {
      category: "Hospitality Services",
      icon: Hotel,
      color: "from-purple-500 to-pink-500",
      description: "Premium hospitality and amenity management for modern commercial spaces.",
      features: [
        { name: "Bookings", desc: "Conference room and amenity reservations" },
        { name: "Rate Plans", desc: "Dynamic pricing and package management" },
        { name: "Housekeeping", desc: "Cleaning schedule and quality management" }
      ]
    },
    {
      category: "Parking & Access",
      icon: Car,
      color: "from-indigo-500 to-blue-500",
      description: "Integrated parking and security systems for complete property access control.",
      features: [
        { name: "Parking Zones", desc: "Parking inventory and allocation management" },
        { name: "Access Logs", desc: "Real-time entry/exit monitoring and audit trails" },
        { name: "Visitor Management", desc: "Guest registration and credential management" }
      ]
    },
    {
      category: "AI & Analytics",
      icon: Brain,
      color: "from-rose-500 to-orange-500",
      description: "Advanced AI-powered insights, predictive analytics, and intelligent automation.",
      features: [
        { name: "Analytics Dashboard", desc: "Comprehensive KPI tracking and visualization" },
        { name: "AI Predictions", desc: "Machine learning forecasts and risk analysis" },
        { name: "AI ChatBot", desc: "Natural language interface for system operations" },
        { name: "Smart Alerts", desc: "Proactive notifications and anomaly detection" }
      ]
    },
    {
      category: "System & Administration",
      icon: Shield,
      color: "from-slate-500 to-gray-500",
      description: "Enterprise-grade configuration, security, and system management tools.",
      features: [
        { name: "User Management", desc: "Role-based access control and permissions" },
        { name: "Notifications", desc: "Multi-channel alert and communication system" },
        { name: "Settings", desc: "System configuration and customization" },
        { name: "Audit Logs", desc: "Complete activity tracking and compliance" }
      ]
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <PropertySidebar />
        <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl mb-6 shadow-elegant">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              FacilityOS System Documentation
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Enterprise Property & Facility Management Platform
            </p>
          </div>

          {/* Executive Summary */}
          <Card className="p-8 mb-12 border-2 shadow-elegant">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-gradient-primary rounded-lg">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Executive Summary</h2>
                <Badge variant="secondary" className="mb-4">Next-Generation IWMS Platform</Badge>
              </div>
            </div>
            
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                <strong className="text-foreground">FacilityOS</strong> is a comprehensive, AI-powered Integrated Workplace Management System (IWMS) designed to revolutionize how organizations manage their real estate portfolios, facilities, and workplace operations.
              </p>
              
              <p>
                Built on modern cloud-native architecture, FacilityOS unifies <strong className="text-foreground">space management, financial operations, maintenance, energy monitoring, and workplace services</strong> into a single, intelligent platform. Our system eliminates data silos and provides real-time visibility across all aspects of facility operations.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-6">
                <Card className="p-4 bg-muted/50">
                  <div className="text-3xl font-bold text-primary mb-2">8+</div>
                  <div className="text-sm">Integrated Modules</div>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm">Feature Components</div>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <div className="text-3xl font-bold text-primary mb-2">AI</div>
                  <div className="text-sm">Powered Analytics</div>
                </Card>
              </div>

              <p>
                The platform leverages <strong className="text-foreground">artificial intelligence and machine learning</strong> to deliver predictive maintenance scheduling, occupancy optimization, energy consumption forecasting, and financial trend analysis. Our AI engine identifies patterns, predicts issues before they occur, and recommends data-driven actions.
              </p>

              <p>
                <strong className="text-foreground">Key differentiators</strong> include seamless integration capabilities, mobile-first design, role-based access control, and enterprise-grade security. FacilityOS scales from single-building operations to multi-site global portfolios, supporting diverse property types including commercial offices, retail, industrial, and mixed-use developments.
              </p>

              <p>
                With FacilityOS, organizations achieve <strong className="text-foreground">30% reduction in operational costs, 40% faster maintenance response times, and 25% improvement in space utilization</strong> through data-driven decision making and automated workflows.
              </p>
            </div>
          </Card>

          {/* Module Summaries */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Module Overview</h2>
            
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Card key={index} className="p-8 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${module.color} flex-shrink-0`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{module.category}</h3>
                      <p className="text-muted-foreground mb-6 text-lg">{module.description}</p>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {module.features.map((feature, fIndex) => (
                          <div key={fIndex} className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                            <div className="font-semibold text-foreground mb-1">{feature.name}</div>
                            <div className="text-sm text-muted-foreground">{feature.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Technical Highlights */}
          <Card className="p-8 mt-12 bg-gradient-to-br from-muted/50 to-muted/30 border-2">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              Technical Highlights
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Architecture</h4>
                <ul className="space-y-1 text-sm">
                  <li>• React-based responsive web application</li>
                  <li>• Real-time data synchronization</li>
                  <li>• RESTful API integration ready</li>
                  <li>• Progressive Web App (PWA) capable</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Security & Compliance</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Role-based access control (RBAC)</li>
                  <li>• End-to-end encryption</li>
                  <li>• SOC 2 Type II compliant architecture</li>
                  <li>• GDPR and data privacy ready</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Integration</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Open API for third-party integrations</li>
                  <li>• IoT sensor and BMS connectivity</li>
                  <li>• Accounting system integration</li>
                  <li>• Mobile app synchronization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Analytics</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Real-time dashboards and KPIs</li>
                  <li>• Predictive analytics engine</li>
                  <li>• Customizable reporting</li>
                  <li>• Data export and visualization</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-12 text-center text-muted-foreground text-sm">
            <p>© 2025 FacilityOS. Enterprise Property & Facility Management Platform.</p>
            <p className="mt-2">Version 1.0 | Documentation Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      </div>
    </SidebarProvider>
  );
};

export default Documentation;
