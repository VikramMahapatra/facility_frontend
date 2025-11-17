import { useState, useEffect } from "react";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Bell, AlertTriangle, CheckCircle, Clock, Settings, Trash2, Search } from "lucide-react";
import { notificationsApiService } from "@/services/system/notificationsapi";
import { notificationSettingsApiService } from "@/services/system/notificationsettingsapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { Pagination } from "@/components/Pagination";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";

/*const notificationSettings = [
  { id: "system_alerts", label: "System Alerts", description: "Critical system failures and issues", enabled: true},
  { id: "maintenance", label: "Maintenance Reminders", description: "Scheduled and preventive maintenance notifications", enabled: true },
  { id: "lease_updates", label: "Lease Updates", description: "Lease renewals, expirations, and changes", enabled: true },
  { id: "financial", label: "Financial Notifications", description: "Payment confirmations and financial alerts", enabled: false },
  { id: "visitor_alerts", label: "Visitor Management", description: "VIP visits and security notifications", enabled: true },
  { id: "ai_predictions", label: "AI Predictions", description: "AI-generated insights and predictions", enabled: true },
  { id: "email_digest", label: "Daily Email Digest", description: "Summary of daily activities and alerts", enabled: false },
  { id: "mobile_push", label: "Mobile Push Notifications", description: "Real-time notifications on mobile devices", enabled: true }
];*/

export default function Notifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const { withLoader } = useLoader();

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  useSkipFirstEffect(() => {
    loadNotifications();
  }, [page]);

  useEffect(() => {
    updateNotificationsPage();
  }, [searchTerm]);

  const updateNotificationsPage = () => {
    if (page === 1) {
      loadNotifications();
    } else {
      setPage(1);
    }
  };

  const loadNotifications = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    const requestData: { search?: string; skip: number; limit: number } = { skip, limit };
    if (searchTerm) requestData.search = searchTerm;

    const response = await withLoader(async () => {
      return await notificationsApiService.getNotifications(requestData);
    });
    if (response?.success) {
      setNotifications(response.data?.notifications || response.data || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const markAsRead = async (id: number | string) => {
    const data = await notificationsApiService.markAsRead(String(id));
    if (data?.success) {
      await loadNotifications();
      toast({ title: "Marked as read", description: "Notification updated successfully." });
    }
  };

  const deleteNotification = async (id: number | string) => {
    const response = await notificationsApiService.deleteNotification(String(id));
    if (response?.success) {
      await loadNotifications();
      toast({ title: "Notification Deleted", description: "Notification has been removed successfully." });
    }
  };

  const markAllAsRead = async () => {
    const data = await notificationsApiService.markAllAsRead();
    if (data?.success) {
      await loadNotifications();
      toast({ title: "All Marked as Read", description: "All notifications have been marked as read." });
    }
  };

  const clearAllNotifications = async () => {
    const data = await notificationsApiService.clearAllNotifications();
    if (data?.success) {
      await loadNotifications();
      toast({ title: "All Notifications Cleared", description: "All notifications have been cleared." });
    }
  };

  const loadNotificationSettings = async () => {
    const response = await withLoader(async () => {
      return await notificationSettingsApiService.getNotificationSettings();
    });
    if (response?.success) {
      setSettings(response.data?.settings || response.data || []);
    }
  };

  const toggleSetting = async (id: string) => {
    const setting = settings.find(s => s.id === id);
    if (!setting) return;

    const updatedEnabled = !setting.enabled;
    const response = await notificationSettingsApiService.updateNotificationSetting(id, { enabled: updatedEnabled });
    
    if (response?.success) {
      setSettings(prev =>
        prev.map(s => s.id === id ? { ...s, enabled: updatedEnabled } : s)
      );
      toast({ 
        title: "Setting Updated", 
        description: `${setting.label || 'Setting'} has been ${updatedEnabled ? 'enabled' : 'disabled'}.` 
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "maintenance": return <Settings className="h-5 w-5 text-blue-500" />;
      case "lease": return <Clock className="h-5 w-5 text-yellow-500" />;
      case "financial": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "system": return <Bell className="h-5 w-5 text-purple-500" />;
      case "visitor": return <Bell className="h-5 w-5 text-indigo-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return <Badge variant="destructive">High</Badge>;
      case "medium": return <Badge variant="secondary">Medium</Badge>;
      case "low": return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">Normal</Badge>;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        
        <main className="flex-1 p-6 bg-background">
          <div className="max-w-6xl mx-auto space-y-6">
            <ContentContainer>
              <LoaderOverlay />
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                    <p className="text-muted-foreground mt-2">
                      Manage your system notifications and preferences
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="mr-2">
                        {unreadCount} unread
                      </Badge>
                    )}
                    <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
                      Mark All Read
                    </Button>
                    <Button variant="destructive" onClick={clearAllNotifications} disabled={notifications.length === 0}>
                      Clear All
                    </Button>
                  </div>
                </div>

            <Tabs defaultValue="notifications" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {notifications.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
                      <p className="text-muted-foreground text-center max-w-sm">
                        You're all caught up! New notifications will appear here when they arrive.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <Card key={notification.id} className={`transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-l-primary bg-muted/30' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h4>
                                {getPriorityBadge(notification.priority)}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              
                              <p className="text-xs text-muted-foreground">
                                {notification.timestamp}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs"
                                >
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {notifications.length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose which notifications you want to receive and how you want to receive them.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{setting.label}</h4>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <Switch
                          checked={setting.enabled}
                          onCheckedChange={() => toggleSetting(setting.id)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
              </div>
            </ContentContainer>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}