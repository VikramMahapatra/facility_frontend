import { useState } from "react";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Bell, AlertTriangle, CheckCircle, Clock, Settings, Trash2 } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    type: "alert",
    title: "Critical: HVAC System Failure",
    message: "Building A - Floor 3 HVAC system has stopped working. Temperature rising.",
    timestamp: "2 minutes ago",
    read: false,
    priority: "high"
  },
  {
    id: 2,
    type: "maintenance",
    title: "Scheduled Maintenance Reminder",
    message: "Fire safety system inspection due in Building B tomorrow at 10:00 AM.",
    timestamp: "1 hour ago",
    read: false,
    priority: "medium"
  },
  {
    id: 3,
    type: "lease",
    title: "Lease Renewal Due",
    message: "Tenant ABC Corp lease expires in 30 days. Renewal documentation required.",
    timestamp: "3 hours ago",
    read: true,
    priority: "medium"
  },
  {
    id: 4,
    type: "financial",
    title: "Payment Received",
    message: "Monthly rent payment of $15,000 received from XYZ Industries.",
    timestamp: "1 day ago",
    read: true,
    priority: "low"
  },
  {
    id: 5,
    type: "system",
    title: "AI Prediction Alert",
    message: "Energy consumption predicted to increase by 25% next month. Review optimization strategies.",
    timestamp: "2 days ago",
    read: false,
    priority: "medium"
  },
  {
    id: 6,
    type: "visitor",
    title: "VIP Visitor Scheduled",
    message: "Board member visit scheduled for tomorrow 2:00 PM. Security clearance approved.",
    timestamp: "3 days ago",
    read: true,
    priority: "high"
  }
];

const notificationSettings = [
  { id: "system_alerts", label: "System Alerts", description: "Critical system failures and issues", enabled: true },
  { id: "maintenance", label: "Maintenance Reminders", description: "Scheduled and preventive maintenance notifications", enabled: true },
  { id: "lease_updates", label: "Lease Updates", description: "Lease renewals, expirations, and changes", enabled: true },
  { id: "financial", label: "Financial Notifications", description: "Payment confirmations and financial alerts", enabled: false },
  { id: "visitor_alerts", label: "Visitor Management", description: "VIP visits and security notifications", enabled: true },
  { id: "ai_predictions", label: "AI Predictions", description: "AI-generated insights and predictions", enabled: true },
  { id: "email_digest", label: "Daily Email Digest", description: "Summary of daily activities and alerts", enabled: false },
  { id: "mobile_push", label: "Mobile Push Notifications", description: "Real-time notifications on mobile devices", enabled: true }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [settings, setSettings] = useState(notificationSettings);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(setting => setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)
    );
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
        </main>
      </div>
    </SidebarProvider>
  );
}