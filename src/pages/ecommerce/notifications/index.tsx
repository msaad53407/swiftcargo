import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEcommerceNotifications, type Notification } from "@/hooks/useEcommerceNotifications";
import { Timestamp } from "firebase/firestore";
import { Bell, Check, Eye, PackagePlus, Pencil, RefreshCw, ShoppingCart, Trash2, X, XCircle } from "lucide-react";
import { useState } from "react";

type TabValue = "all" | "unread" | "read";

export default function NotificationsPage() {
  const { notifications, unreadCount, readCount, handleMarkAllAsRead, handleMarkAsRead, handleDelete } =
    useEcommerceNotifications();
  const [activeTab, setActiveTab] = useState<TabValue>("unread");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ECOMMERCE_PRODUCT_ADDED":
        return <PackagePlus className="h-5 w-5 text-green-500" />;
      case "ECOMMERCE_PRODUCT_UPDATED":
        return <Pencil className="h-5 w-5 text-blue-500" />;
      case "ECOMMERCE_PRODUCT_DELETED":
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case "ECOMMERCE_PRODUCT_VISIBILITY_UPDATED":
        return <Eye className="h-5 w-5 text-purple-500" />;
      case "ECOMMERCE_ORDER_PLACED":
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case "ECOMMERCE_ORDER_STATUS_UPDATED":
        return <RefreshCw className="h-5 w-5 text-orange-500" />;
      case "ECOMMERCE_ORDER_CANCELLED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (activeTab) {
      case "unread":
        return !notification.read;
      case "read":
        return notification.read;
      default:
        return true;
    }
  });

  const NotificationList = ({ notifications }: { notifications: Notification[] }) => (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`group flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-gray-50 ${
            !notification.read ? "bg-blue-50/50" : "bg-white"
          }`}
        >
          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
          <div className="flex-grow">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 truncate">{notification.title}</h3>
              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log(notification.id);
                      handleMarkAsRead(notification.id);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Mark as read</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(notification.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Delete notification</span>
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{notification.description}</p>
            <span className="text-xs text-gray-400 mt-1 block">{formatDate(notification.createdAt)}</span>
          </div>
        </div>
      ))}
      {notifications.length === 0 && (
        <div className="text-center py-8 text-gray-500">No notifications in this category</div>
      )}
    </div>
  );

  return (
    <div className="p-2 sm:p-6 h-full">
      <div className="mx-auto h-full flex flex-col">
        <Card className="w-full bg-white shadow-lg flex-grow flex flex-col">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread, {readCount} read
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabValue)}
              className="h-full flex flex-col"
            >
              <TabsList className="grid w-full sm:w-[40%] grid-cols-3 mb-4">
                <TabsTrigger value="all" className="relative">
                  All
                  <span className="ml-1 text-xs text-muted-foreground">({notifications.length})</span>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  <span className="ml-1 text-xs text-muted-foreground">({unreadCount})</span>
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read
                  <span className="ml-1 text-xs text-muted-foreground">({readCount})</span>
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto relative">
                <TabsContent value="all" className="mt-0 absolute inset-0">
                  <NotificationList notifications={filteredNotifications} />
                </TabsContent>
                <TabsContent value="unread" className="mt-0 absolute inset-0">
                  <NotificationList notifications={filteredNotifications} />
                </TabsContent>
                <TabsContent value="read" className="mt-0 absolute inset-0">
                  <NotificationList notifications={filteredNotifications} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
