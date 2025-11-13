import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users, Truck } from "lucide-react";
import { authApiService } from "@/services/authapi";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const googleData = location.state?.googleData;

  const [formData, setFormData] = useState({
    name: googleData?.name || "",
    email: googleData?.email || "",
    pictureUrl: googleData?.picture || "",
    accountType: "",
    organizationName: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const accountTypes = [
    {
      value: "organization",
      label: "Organization",
      description: "Property owners and facility managers",
      icon: <Building2 className="w-5 h-5" />
    },
    // {
    //   value: "Tenant",
    //   label: "Tenant",
    //   description: "Renters and occupants of properties",
    //   icon: <Users className="w-5 h-5" />
    // },
    // {
    //   value: "Vendor",
    //   label: "Vendor",
    //   description: "Service providers and contractors",
    //   icon: <Truck className="w-5 h-5" />
    // },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountType) return;

    setIsLoading(true);

    // registration process
    const userResponse = await authApiService.setupUser(formData);

    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({
        id: userResponse.user.id,
        email: userResponse.user.email,
        name: userResponse.user.name,
        accountType: userResponse.user.accountType,
        organizationName: userResponse.user.organizationName,
        isAuthenticated: true
      }));

      // Redirect based on account type
      if (formData.accountType === 'organization') {
        navigate('/dashboard');
      } else {
        // For demo purposes, all account types go to dashboard
        navigate('/dashboard');
      }
    }, 1500);
  };

  if (!googleData) {
    // Redirect back if no Google data
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={googleData.picture} />
              <AvatarFallback className="bg-gradient-primary text-white text-xl">
                {googleData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">Complete Your Profile</h1>
            <p className="text-muted-foreground mt-2">We've pre-filled your information from Google</p>
          </div>

          <Card className="shadow-elegant border-0">
            <CardHeader>
              <CardTitle>Account Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-3">
                            {type.icon}
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.accountType === "Organization" && (
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      placeholder="Enter your organization name"
                      required
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !formData.accountType}
                >
                  {isLoading ? "Creating Account..." : "Complete Setup"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;