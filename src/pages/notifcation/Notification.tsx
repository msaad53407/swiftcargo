'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Bell, Package, UserPlus, Trash2, RefreshCw, Check, X } from 'lucide-react'
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../utils/notificaiton'

interface Notification {
    id: string
    type: string
    title: string
    description: string
    createdAt: any
    read: boolean
    metadata: Record<string, any>
}

type TabValue = 'all' | 'unread' | 'read'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [activeTab, setActiveTab] = useState<TabValue>('unread')

    useEffect(() => {
        const q = query(
            collection(db, 'notifications'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[]
            setNotifications(newNotifications)
        })

        return () => unsubscribe()
    }, [])

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'EMPLOYEE_ADDED':
                return <UserPlus className="h-5 w-5 text-green-500" />
            case 'PACKAGE_ADDED':
                return <Package className="h-5 w-5 text-blue-500" />
            case 'PACKAGE_DELETED':
                return <Trash2 className="h-5 w-5 text-red-500" />
            case 'PACKAGE_STATUS_UPDATED':
                return <RefreshCw className="h-5 w-5 text-orange-500" />
            default:
                return <Bell className="h-5 w-5 text-gray-500" />
        }
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return ''
        const date = timestamp.toDate()
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead()
    }

    const handleMarkAsRead = async (notificationId: string) => {
        await markNotificationAsRead(notificationId)
    }

    const handleDelete = async (notificationId: string) => {
        await deleteNotification(notificationId)
    }

    const filteredNotifications = notifications.filter(notification => {
        switch (activeTab) {
            case 'unread':
                return !notification.read
            case 'read':
                return notification.read
            default:
                return true
        }
    })

    const unreadCount = notifications.filter(n => !n.read).length
    const readCount = notifications.filter(n => n.read).length

    const NotificationList = ({ notifications }: { notifications: Notification[] }) => (
        <div className="space-y-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`group flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : 'bg-white'
                        }`}
                >
                    <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-gray-900 truncate">
                                {notification.title}
                            </h3>
                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkAsRead(notification.id)}
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
                        <p className="text-sm text-gray-500 mt-1">
                            {notification.description}
                        </p>
                        <span className="text-xs text-gray-400 mt-1 block">
                            {formatDate(notification.createdAt)}
                        </span>
                    </div>
                </div>
            ))}
            {notifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No notifications in this category
                </div>
            )}
        </div>
    )

    return (
        <div className="p-2 sm:p-6 h-full overflow-hidden">
            <div className="mx-auto h-full flex flex-col">
                <Card className="w-full bg-white shadow-lg flex-grow overflow-hidden flex flex-col">
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
                        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="h-full flex flex-col">
                            <TabsList className="grid w-full sm:w-[40%] grid-cols-3 mb-4">
                                <TabsTrigger value="all" className="relative">
                                    All
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        ({notifications.length})
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="unread">
                                    Unread
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        ({unreadCount})
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="read">
                                    Read
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        ({readCount})
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="h-full overflow-y-auto">
                                <TabsContent value="all" className="mt-0 h-full ">
                                    <NotificationList notifications={filteredNotifications} />
                                </TabsContent>
                                <TabsContent value="unread" className="mt-0 h-full">
                                    <NotificationList notifications={filteredNotifications} />
                                </TabsContent>
                                <TabsContent value="read" className="mt-0 h-full">
                                    <NotificationList notifications={filteredNotifications} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

