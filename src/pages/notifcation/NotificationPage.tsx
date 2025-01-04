import React from 'react'
import NotificationsPage from './Notification'

function NoPge() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start lg:items-center justify-between">
                <div className="mb-4 lg:mb-0">
                    <h1 className="text-2xl font-semibold">Package Management</h1>
                    <p className="text-gray-500">Manage shipments, clients, and finances.</p>
                </div>

            </div>

            <NotificationsPage />
        </div>
    )
}

export default NoPge
