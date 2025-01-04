import { PaymentTable } from '@/components/invoice/InvoiceTable'
import React from 'react'

function InvoicePage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Client Invoice</h1>
                    <p className="text-gray-500">Manage shipments, clients, and finances.</p>
                </div>

            </div>
            <PaymentTable />

        </div>
    )
}

export default InvoicePage
