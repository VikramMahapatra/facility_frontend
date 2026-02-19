import { useState, useEffect } from "react";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building,
  Shield,
  Database,
  Zap,
  Bell,
  Palette,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  Key,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/components/ui/app-toast";
import { settingsApiService } from "@/services/system/settingsapi";
import { any } from "zod";
import { useLoader } from "@/context/LoaderContext";
import { useSettings } from "@/context/SettingsContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";

{
  /*const systemSettings = {
  general: {
    systemName: "FacilityOS Pro",
    timeZone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    language: "English",
    autoBackup: true,
    maintenanceMode: false,
  },
  security: {
    passwordExpiry: "90",
    sessionTimeout: "30",
    twoFactorAuth: true,
    auditLogging: true,
    dataEncryption: true,
    apiRateLimit: "1000",
  },
  integrations: {
    emailService: "enabled",
    smsService: "disabled",
    weatherApi: "enabled",
    energyMonitoring: "enabled",
    accounting: "disabled",
    hrms: "disabled",
  },
  appearance: {
    theme: "system",
    primaryColor: "blue",
    compactMode: false,
    showAnimations: true,
    fontSize: "medium",
  },
};
*/
}
const integrationStatus = [
  {
    name: "Email Service",
    status: "connected",
    lastSync: "2 minutes ago",
    health: "excellent",
  },
  {
    name: "Weather API",
    status: "connected",
    lastSync: "15 minutes ago",
    health: "good",
  },
  {
    name: "Energy Monitoring",
    status: "connected",
    lastSync: "1 hour ago",
    health: "good",
  },
  {
    name: "SMS Service",
    status: "disconnected",
    lastSync: "Never",
    health: "none",
  },
  {
    name: "Accounting System",
    status: "error",
    lastSync: "3 days ago",
    health: "poor",
  },
  {
    name: "HRMS Integration",
    status: "disconnected",
    lastSync: "Never",
    health: "none",
  },
];

export default function Settings() {
  const [settings, setSettings] = useState<any>({
    general: {
      systemName: "",
      timeZone: "",
      dateFormat: "",
      currency: "",
      language: "",
      autoBackup: false,
      maintenanceMode: false,
    },
    security: {
      passwordExpiry: "",
      sessionTimeout: "",
      twoFactorAuth: false,
      auditLogging: false,
      dataEncryption: false,
      apiRateLimit: "",
    },
    integrations: {},
    appearance: {
      theme: "",
      primaryColor: "",
      fontSize: "",
      compactMode: false,
      showAnimations: false,
    },
  });
  const [settingId, setSettingId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const { withLoader } = useLoader();
  const { refreshSettings } = useSettings();

  const loadSettings = async () => {
    const response = await withLoader(async () => {
      return await settingsApiService.getSettings();
    });
    if (response?.success && response.data) {
      setSettingId(response.data.id || "");
      setSettings({
        general: {
          systemName: response.data.general?.system_name || "",
          timeZone: response.data.general?.time_zone || "",
          dateFormat: response.data.general?.date_format || "",
          currency: response.data.general?.currency || "",
          language: "",
          autoBackup: response.data.general?.auto_backup ?? false,
          maintenanceMode: response.data.general?.maintenance_mode ?? false,
        },
        security: {
          passwordExpiry:
            response.data.security?.password_expiry_days?.toString() || "",
          sessionTimeout:
            response.data.security?.session_timeout_minutes?.toString() || "",
          twoFactorAuth:
            response.data.security?.two_factor_auth_enabled ?? false,
          auditLogging: response.data.security?.audit_logging_enabled ?? false,
          dataEncryption:
            response.data.security?.data_encryption_enabled ?? false,
          apiRateLimit:
            response.data.security?.api_rate_limit_per_hour?.toString() || "",
        },
        integrations: {},
        appearance: {},
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settingId) {
      toast.error("Settings ID not found. Please reload the page.");
      return;
    }

    setIsSaving(true);

    const updateData = {
      general: {
        system_name: settings.general?.systemName || "",
        time_zone: settings.general?.timeZone || "",
        date_format: settings.general?.dateFormat || "",
        currency: settings.general?.currency || "",
        auto_backup: settings.general?.autoBackup ?? false,
        maintenance_mode: settings.general?.maintenanceMode ?? false,
      },
      security: {
        password_expiry_days: parseInt(
          settings.security?.passwordExpiry || "0",
        ),
        session_timeout_minutes: parseInt(
          settings.security?.sessionTimeout || "0",
        ),
        api_rate_limit_per_hour: parseInt(
          settings.security?.apiRateLimit || "0",
        ),
        two_factor_auth_enabled: settings.security?.twoFactorAuth ?? false,
        audit_logging_enabled: settings.security?.auditLogging ?? false,
        data_encryption_enabled: settings.security?.dataEncryption ?? false,
      },
    };

    const response = await withLoader(async () => {
      return await settingsApiService.updateSettings(settingId, updateData);
    });

    setIsSaving(false);

    if (response?.success) {
      toast.success("Settings saved successfully.");
      loadSettings();
      await refreshSettings();
    } else {
      toast.error("Failed to save settings. Please try again.");
    }
  };

  const handleReset = () => {
    loadSettings();
    toast.success("Settings reset successfully.");
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "facilityos-settings.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Settings exported successfully.");
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const getStatusBadge = (status: string, health: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Connected
          </Badge>
        );
      case "disconnected":
        return <Badge variant="secondary">Disconnected</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "excellent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "good":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "poor":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />

        <main className="flex-1 p-6 bg-background">
          <div className="max-w-6xl mx-auto space-y-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  System Settings
                </h1>
                <p className="text-muted-foreground mt-2">
                  Configure system preferences, security, and integrations
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportSettings}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">
                  <Building className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="integrations">
                  <Zap className="h-4 w-4 mr-2" />
                  Integrations
                </TabsTrigger>
                {/*
                <TabsTrigger value="appearance">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="backup">
                  <Database className="h-4 w-4 mr-2" />
                  Backup
                </TabsTrigger>
                */}
              </TabsList>

              <div className="relative rounded-md">
                <ContentContainer>
                  <LoaderOverlay />
                  <TabsContent value="general" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>System Information</CardTitle>
                        <CardDescription>
                          Basic system configuration and regional settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="systemName">System Name</Label>
                            <Input
                              id="systemName"
                              value={settings.general.systemName}
                              onChange={(e) =>
                                updateSetting(
                                  "general",
                                  "systemName",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="timezone">Time Zone</Label>
                            <Select
                              value={settings.general.timeZone}
                              onValueChange={(value) =>
                                updateSetting("general", "timeZone", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="America/New_York">
                                  Eastern Time
                                </SelectItem>
                                <SelectItem value="America/Chicago">
                                  Central Time
                                </SelectItem>
                                <SelectItem value="America/Denver">
                                  Mountain Time
                                </SelectItem>
                                <SelectItem value="America/Los_Angeles">
                                  Pacific Time
                                </SelectItem>
                                <SelectItem value="UTC">UTC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dateFormat">Date Format</Label>
                            <Select
                              value={settings.general.dateFormat}
                              onValueChange={(value) =>
                                updateSetting("general", "dateFormat", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MM/DD/YYYY">
                                  MM/DD/YYYY
                                </SelectItem>
                                <SelectItem value="DD/MM/YYYY">
                                  DD/MM/YYYY
                                </SelectItem>
                                <SelectItem value="YYYY-MM-DD">
                                  YYYY-MM-DD
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                              value={settings.general.currency}
                              onValueChange={(value) =>
                                updateSetting("general", "currency", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">
                                  USD - US Dollar
                                </SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                <SelectItem value="GBP">
                                  GBP - British Pound
                                </SelectItem>
                                <SelectItem value="CAD">
                                  CAD - Canadian Dollar
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Auto Backup</Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically backup system data daily
                              </p>
                            </div>
                            <Switch
                              checked={settings.general.autoBackup}
                              onCheckedChange={(checked) =>
                                updateSetting("general", "autoBackup", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">
                                Maintenance Mode
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Enable maintenance mode for system updates
                              </p>
                            </div>
                            <Switch
                              checked={settings.general.maintenanceMode}
                              onCheckedChange={(checked) =>
                                updateSetting(
                                  "general",
                                  "maintenanceMode",
                                  checked,
                                )
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>
                          Configure authentication and security policies
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="passwordExpiry">
                              Password Expiry (days)
                            </Label>
                            <Input
                              id="passwordExpiry"
                              type="number"
                              value={settings.security.passwordExpiry}
                              onChange={(e) =>
                                updateSetting(
                                  "security",
                                  "passwordExpiry",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sessionTimeout">
                              Session Timeout (minutes)
                            </Label>
                            <Input
                              id="sessionTimeout"
                              type="number"
                              value={settings.security.sessionTimeout}
                              onChange={(e) =>
                                updateSetting(
                                  "security",
                                  "sessionTimeout",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="apiRateLimit">
                              API Rate Limit (requests/hour)
                            </Label>
                            <Input
                              id="apiRateLimit"
                              type="number"
                              value={settings.security.apiRateLimit}
                              onChange={(e) =>
                                updateSetting(
                                  "security",
                                  "apiRateLimit",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">
                                Two-Factor Authentication
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Require 2FA for all admin accounts
                              </p>
                            </div>
                            <Switch
                              checked={settings.security.twoFactorAuth}
                              onCheckedChange={(checked) =>
                                updateSetting(
                                  "security",
                                  "twoFactorAuth",
                                  checked,
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Audit Logging</Label>
                              <p className="text-sm text-muted-foreground">
                                Log all user actions and system changes
                              </p>
                            </div>
                            <Switch
                              checked={settings.security.auditLogging}
                              onCheckedChange={(checked) =>
                                updateSetting(
                                  "security",
                                  "auditLogging",
                                  checked,
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">
                                Data Encryption
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Encrypt sensitive data at rest
                              </p>
                            </div>
                            <Switch
                              checked={settings.security.dataEncryption}
                              onCheckedChange={(checked) =>
                                updateSetting(
                                  "security",
                                  "dataEncryption",
                                  checked,
                                )
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="integrations" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Third-Party Integrations</CardTitle>
                        <CardDescription>
                          Manage external service connections and API
                          integrations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {integrationStatus.map((integration) => (
                          <div
                            key={integration.name}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              {getHealthIcon(integration.health)}
                              <div>
                                <h4 className="font-medium">
                                  {integration.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Last sync: {integration.lastSync}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {getStatusBadge(
                                integration.status,
                                integration.health,
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={integration.status === "connected"}
                              >
                                {integration.status === "connected"
                                  ? "Configure"
                                  : "Connect"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  {/*

                  <TabsContent value="appearance" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>UI Appearance</CardTitle>
                        <CardDescription>
                          Customize the look and feel of your interface
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select
                              value={settings.appearance.theme}
                              onValueChange={(value) =>
                                updateSetting("appearance", "theme", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <Select
                              value={settings.appearance.primaryColor}
                              onValueChange={(value) =>
                                updateSetting(
                                  "appearance",
                                  "primaryColor",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blue">Blue</SelectItem>
                                <SelectItem value="green">Green</SelectItem>
                                <SelectItem value="purple">Purple</SelectItem>
                                <SelectItem value="red">Red</SelectItem>
                                <SelectItem value="orange">Orange</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fontSize">Font Size</Label>
                            <Select
                              value={settings.appearance.fontSize}
                              onValueChange={(value) =>
                                updateSetting("appearance", "fontSize", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Compact Mode</Label>
                              <p className="text-sm text-muted-foreground">
                                Reduce spacing and padding in the interface
                              </p>
                            </div>
                            <Switch
                              checked={settings.appearance.compactMode}
                              onCheckedChange={(checked) =>
                                updateSetting(
                                  "appearance",
                                  "compactMode",
                                  checked
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">
                                Show Animations
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Enable smooth transitions and animations
                              </p>
                            </div>
                            <Switch
                              checked={settings.appearance.showAnimations}
                              onCheckedChange={(checked) =>
                                updateSetting(
                                  "appearance",
                                  "showAnimations",
                                  checked
                                )
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="backup" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Backup & Recovery</CardTitle>
                        <CardDescription>
                          Manage system backups and data recovery options
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <div className="text-center">
                              <Database className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                              <h3 className="font-medium">Last Backup</h3>
                              <p className="text-sm text-muted-foreground">
                                2 hours ago
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                View Details
                              </Button>
                            </div>
                          </Card>

                          <Card className="p-4">
                            <div className="text-center">
                              <Download className="h-8 w-8 mx-auto text-green-500 mb-2" />
                              <h3 className="font-medium">Backup Size</h3>
                              <p className="text-sm text-muted-foreground">
                                2.4 GB
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Download
                              </Button>
                            </div>
                          </Card>

                          <Card className="p-4">
                            <div className="text-center">
                              <RefreshCw className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                              <h3 className="font-medium">Auto Backup</h3>
                              <p className="text-sm text-muted-foreground">
                                Daily at 2:00 AM
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Configure
                              </Button>
                            </div>
                          </Card>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Button>
                              <Download className="h-4 w-4 mr-2" />
                              Create Manual Backup
                            </Button>
                            <Button variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Restore from Backup
                            </Button>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-2">
                              Backup Schedule
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Automated backups are scheduled daily at 2:00 AM.
                              Backups are stored for 30 days and then archived.
                              Critical data is backed up in real-time to ensure
                              zero data loss.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                */}
                </ContentContainer>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
