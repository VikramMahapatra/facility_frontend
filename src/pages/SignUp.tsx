import { useEffect, useState } from "react";
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
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { toast } from "sonner";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    pictureUrl: userData?.picture || "",
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
    //   value: "tenant",
    //   label: "Tenant",
    //   description: "Renters and occupants of properties",
    //   icon: <Users className="w-5 h-5" />
    // },
    // {
    //   value: "vendor",
    //   label: "Vendor",
    //   description: "Service providers and contractors",
    //   icon: <Truck className="w-5 h-5" />
    // },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountType) return;

    const phoneDigits = formData.phone.replace(/\D/g, ''); // remove non-digits
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    // registration process
    const userResponse = await authApiService.setupUser(formData);

    if (userResponse?.success) {
      const user = userResponse.data?.user;

      if (user.status.lower() === 'pending_approval') {
        navigate('/registration-status', {
          state: {
            userData: {
              email: user.email,
              name: user.full_name
            }
          }
        });
      } else {

        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          accountType: user.accountType,
          organizationName: user.organizationName,
          isAuthenticated: true
        }));

        navigate('/dashboard');
      }
    } else {
      toast.error('Signup failed, please try again.');
    }
  };

  useEffect(() => {
    if (!userData) {
      navigate("/login");
    }
  }, [userData, navigate]); // run when isLoggedIn changes


  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={userData?.picture} />
              <AvatarFallback className="bg-gradient-primary text-white text-xl">
                {userData && userData.name ? userData.name.charAt(0) : "F"}
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
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <PhoneInput
                    country={'in'}
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    inputProps={{
                      name: 'phone',
                      required: true,
                    }}
                    containerClass="w-full relative"
                    inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                    buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                    dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                    enableSearch={true}
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

                {formData.accountType === "organization" && (
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