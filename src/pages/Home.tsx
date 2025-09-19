import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Building2, Users, FileText, BarChart3, Shield, Globe } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Asset Management",
      description: "Comprehensive tracking and management of all your facilities and assets",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-Tenant Support",
      description: "Manage multiple organizations, tenants, and vendors in one platform",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Compliance Tracking",
      description: "Stay compliant with automated tracking and reporting capabilities",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics & Reporting",
      description: "Powerful insights and dashboards to drive informed decisions",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with role-based access controls",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Site Operations",
      description: "Seamlessly manage operations across multiple locations",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Enterprise Facility & Property Management, unified.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Manage assets, leases, tenants, work orders, invoices, and compliance 
              across multi-org and multi-site operations—securely and at scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button variant="hero" size="lg" className="min-w-48">
                  Go to Login
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg" className="min-w-48">
                  Explore Features
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Palette: primary blue, neutrals, accent green. WCAG AA compliant.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern Facilities</h2>
            <p className="text-xl text-muted-foreground">Everything you need to manage your properties efficiently</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Facility Management?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of organizations already using FacilityOS to streamline their operations.
            </p>
            <Link to="/login">
              <Button variant="hero" size="lg">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;