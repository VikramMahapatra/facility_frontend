import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, FileText, BarChart3, Shield, Globe, Wrench, DollarSign, Calendar, MapPin, Bell, Zap } from "lucide-react";

const Features = () => {
  const featureCategories = [
    {
      title: "Asset & Property Management",
      features: [
        {
          icon: <Building2 className="w-6 h-6" />,
          title: "Property Portfolio",
          description: "Centralized management of all your properties with detailed profiles, documentation, and performance metrics."
        },
        {
          icon: <MapPin className="w-6 h-6" />,
          title: "Space Management",
          description: "Interactive floor plans, space utilization tracking, and occupancy optimization tools."
        },
        {
          icon: <Wrench className="w-6 h-6" />,
          title: "Maintenance Tracking",
          description: "Preventive maintenance scheduling, work order management, and vendor coordination."
        }
      ]
    },
    {
      title: "Tenant & Vendor Relations",
      features: [
        {
          icon: <Users className="w-6 h-6" />,
          title: "Tenant Portal",
          description: "Self-service portal for tenants to submit requests, view lease information, and make payments."
        },
        {
          icon: <DollarSign className="w-6 h-6" />,
          title: "Lease Management",
          description: "Automated lease tracking, renewal notifications, and rent collection management."
        },
        {
          icon: <Bell className="w-6 h-6" />,
          title: "Communication Hub",
          description: "Centralized messaging system for seamless communication between all stakeholders."
        }
      ]
    },
    {
      title: "Analytics & Compliance",
      features: [
        {
          icon: <BarChart3 className="w-6 h-6" />,
          title: "Performance Analytics",
          description: "Real-time dashboards and custom reports to track KPIs and operational efficiency."
        },
        {
          icon: <FileText className="w-6 h-6" />,
          title: "Compliance Management",
          description: "Automated compliance tracking, document management, and regulatory reporting."
        },
        {
          icon: <Calendar className="w-6 h-6" />,
          title: "Audit Trails",
          description: "Complete audit trails for all transactions, changes, and maintenance activities."
        }
      ]
    },
    {
      title: "Enterprise Features",
      features: [
        {
          icon: <Globe className="w-6 h-6" />,
          title: "Multi-Site Operations",
          description: "Manage multiple locations with centralized oversight and local autonomy."
        },
        {
          icon: <Shield className="w-6 h-6" />,
          title: "Enterprise Security",
          description: "Role-based access controls, SSO integration, and SOC 2 Type II compliance."
        },
        {
          icon: <Zap className="w-6 h-6" />,
          title: "API Integration",
          description: "Robust APIs for seamless integration with your existing business systems."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Comprehensive Features for Modern <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Facility Management</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Every tool you need to manage your properties efficiently, from asset tracking to tenant relations and regulatory compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Features Sections */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {featureCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{category.title}</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.features.map((feature, index) => (
                  <Card key={index} className="border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Built for Integration</h2>
            <p className="text-xl text-muted-foreground mb-8">
              FacilityOS integrates seamlessly with your existing tools and workflows, 
              ensuring a smooth transition and enhanced productivity.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2">Accounting Systems</h3>
                <p className="text-sm text-muted-foreground">QuickBooks, SAP, Oracle, and more</p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2">Communication Tools</h3>
                <p className="text-sm text-muted-foreground">Slack, Microsoft Teams, Email</p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2">IoT & Smart Systems</h3>
                <p className="text-sm text-muted-foreground">Building automation, sensors, HVAC</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;