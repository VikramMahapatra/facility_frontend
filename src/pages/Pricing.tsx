import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "per month",
      description: "Perfect for small property managers",
      features: [
        "Up to 5 properties",
        "Basic tenant portal",
        "Work order management",
        "Email support",
        "Mobile app access"
      ]
    },
    {
      name: "Professional",
      price: "$299",
      period: "per month",
      description: "For growing property portfolios",
      popular: true,
      features: [
        "Up to 25 properties",
        "Advanced analytics",
        "Custom reporting",
        "API access",
        "Priority support",
        "Multi-user accounts",
        "Compliance tracking"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations",
      features: [
        "Unlimited properties",
        "White-label solution",
        "Advanced integrations",
        "Dedicated support",
        "Custom development",
        "SSO integration",
        "SLA guarantee"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Choose the plan that fits your needs. All plans include our core features with no hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 relative ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && (
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6">
                    <Link to="/login" className="w-full">
                      <Button
                        variant={plan.popular ? "hero" : "outline"}
                        size="lg"
                        className="w-full"
                      >
                        {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Can I change plans later?</h3>
                <p className="text-muted-foreground text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground text-sm">We offer a 14-day free trial for all plans. No credit card required to get started.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground text-sm">We accept all major credit cards and can invoice for annual Enterprise plans.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer discounts for annual plans?</h3>
                <p className="text-muted-foreground text-sm">Yes, save 20% when you choose annual billing on any plan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;