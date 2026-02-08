import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users, Home, UserPlus } from "lucide-react";
import { authApiService } from "@/services/authapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { toast } from "sonner";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const googleData = location.state?.googleData;
  const phoneData = location.state?.phoneData;

  // Pre-fill from Google data, phone data, or empty for direct signup
  const [formData, setFormData] = useState({
    name: googleData?.name || phoneData?.name || "",
    email: googleData?.email || phoneData?.email || "",
    phone: phoneData?.phone || "",
    pictureUrl: googleData?.picture || "",
    accountType: "",
    organizationName: "",
    // Tenant specific fields
    tenantType: "",
    // Location fields for tenant and space_owner
    siteId: "",
    buildingId: "",
    spaceId: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);

  const accountTypes = [
    {
      value: "organization",
      label: "Organization",
      description: "Property owners and facility managers",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      value: "tenant",
      label: "Tenant",
      description: "Renters and occupants of properties",
      icon: <Users className="w-5 h-5" />,
    },
    {
      value: "space_owner",
      label: "Space Owner",
      description: "Owners of individual spaces/units",
      icon: <Home className="w-5 h-5" />,
    },
  ];

  const tenantTypes = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
  ];

  const loadSites = useCallback(async () => {
    try {
      const response = await siteApiService.getMasterSiteLookup();
      if (response?.success) {
        setSiteList(response.data?.sites || response.data || []);
      }
    } catch (error) {
      console.error("Failed to load sites:", error);
    }
  }, []);

  const loadBuildings = useCallback(async (siteId: string) => {
    try {
      const response = await buildingApiService.getMasterBuildingLookup(siteId);
      if (response?.success) {
        setBuildingList(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load buildings:", error);
    }
  }, []);

  const loadSpaces = useCallback(
    async (siteId: string, buildingId?: string) => {
      try {
        const response = await spacesApiService.getMasterSpaceLookup(
          siteId,
          buildingId
        );
        if (response?.success) {
          setSpaceList(response.data || []);
        }
      } catch (error) {
        console.error("Failed to load spaces:", error);
      }
    },
    []
  );

  // Load sites on mount
  useEffect(() => {
    loadSites();
  }, [loadSites]);

  // Load buildings when site changes
  useEffect(() => {
    if (formData.siteId) {
      loadBuildings(formData.siteId);
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [formData.siteId, loadBuildings]);

  // Load spaces when site or building changes
  useEffect(() => {
    if (formData.siteId) {
      loadSpaces(formData.siteId, formData.buildingId);
    } else {
      setSpaceList([]);
    }
  }, [formData.siteId, formData.buildingId, loadSpaces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountType) {
      toast.error("Please select an account type");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, ""); // remove non-digits
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Validation for tenant
    if (formData.accountType === "tenant") {
      if (!formData.tenantType) {
        toast.error("Please select tenant type");
        return;
      }
      if (!formData.siteId) {
        toast.error("Please select a site");
        return;
      }
      if (!formData.spaceId) {
        toast.error("Please select a space");
        return;
      }
    }

    // Validation for space_owner
    if (formData.accountType === "space_owner") {
      if (!formData.siteId) {
        toast.error("Please select a site");
        return;
      }
      if (!formData.spaceId) {
        toast.error("Please select a space");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Prepare registration data
      const registrationData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pictureUrl: formData.pictureUrl,
        accountType: formData.accountType,
      };

      if (formData.accountType === "organization") {
        registrationData.organizationName = formData.organizationName;
      } else if (formData.accountType === "tenant") {
        registrationData.tenantType = formData.tenantType;
        registrationData.siteId = formData.siteId;
        registrationData.buildingId = formData.buildingId || undefined;
        registrationData.spaceId = formData.spaceId;
      } else if (formData.accountType === "space_owner") {
        registrationData.siteId = formData.siteId;
        registrationData.buildingId = formData.buildingId || undefined;
        registrationData.spaceId = formData.spaceId;
      }

      // registration process
      const userResponse = await authApiService.setupUser(registrationData);

      if (userResponse?.success) {
        const user = userResponse.data?.user;

        if (user.status?.toLowerCase() === "pending_approval") {
          navigate("/registration-status", {
            state: {
              userData: {
                email: user.email,
                name: user.full_name,
              },
            },
          });
        } else {
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: user.id,
              email: user.email,
              name: user.name,
              accountType: user.accountType,
              organizationName: user.organizationName,
              isAuthenticated: true,
            })
          );

          navigate("/dashboard");
        }
      } else {
        toast.error(
          userResponse?.message || "Signup failed, please try again."
        );
      }
    } catch (error) {
      toast.error("Signup failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if this is a Google signup, phone signup, or direct signup
  const isGoogleSignup = !!googleData;
  const isPhoneSignup = !!phoneData;

  // Check if location fields should be shown
  const showLocationFields =
    formData.accountType === "tenant" || formData.accountType === "space_owner";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            {isGoogleSignup ? (
              <>
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={googleData.picture} />
                  <AvatarFallback className="bg-gradient-primary text-white text-xl">
                    {googleData.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">Complete Your Profile</h1>
                <p className="text-muted-foreground mt-2">
                  We've pre-filled your information from Google
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                  <UserPlus className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Create Your Account</h1>
                <p className="text-muted-foreground mt-2">
                  {isPhoneSignup
                    ? "Complete your registration"
                    : "Fill in your details to get started"}
                </p>
              </>
            )}
          </div>

          <Card className="shadow-elegant border-0">
            <CardHeader>
              <CardTitle>Account Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter your email address"
                    required
                    disabled={isGoogleSignup}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <PhoneInput
                    country={"in"}
                    value={formData.phone}
                    onChange={(value) =>
                      setFormData({ ...formData, phone: value })
                    }
                    inputProps={{
                      name: "phone",
                      required: true,
                    }}
                    disabled={isPhoneSignup}
                    containerClass="w-full relative"
                    inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                    buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                    dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                    enableSearch={true}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Account Type *</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        accountType: value,
                        // Reset dependent fields when account type changes
                        tenantType: "",
                        siteId: "",
                        buildingId: "",
                        spaceId: "",
                        organizationName: "",
                      })
                    }
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
                              <div className="text-xs text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization specific fields */}
                {formData.accountType === "organization" && (
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">
                      Organization Name *
                    </Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizationName: e.target.value,
                        })
                      }
                      placeholder="Enter your organization name"
                      required
                    />
                  </div>
                )}

                {/* Tenant specific fields */}
                {formData.accountType === "tenant" && (
                  <div className="space-y-2">
                    <Label>Tenant Type *</Label>
                    <Select
                      value={formData.tenantType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tenantType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant type" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenantTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Location fields for tenant and space_owner */}
                {showLocationFields && (
                  <>
                    <div className="space-y-2">
                      <Label>Site *</Label>
                      <Select
                        value={formData.siteId}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            siteId: value,
                            buildingId: "",
                            spaceId: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                          {siteList.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Building</Label>
                      <Select
                        value={formData.buildingId}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            buildingId: value,
                            spaceId: "",
                          })
                        }
                        disabled={!formData.siteId}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !formData.siteId
                                ? "Select site first"
                                : "Select building (optional)"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {buildingList.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Space *</Label>
                      <Select
                        value={formData.spaceId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, spaceId: value })
                        }
                        disabled={!formData.siteId}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !formData.siteId
                                ? "Select site first"
                                : "Select space"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {spaceList.map((space) => (
                            <SelectItem key={space.id} value={space.id}>
                              {space.name || space.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
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

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </Button>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
