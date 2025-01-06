"use client"

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'

interface AddPackageDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => void
    isLoading: boolean
}

export function AddPackageDialog({ isOpen, onClose, onSubmit, isLoading }: AddPackageDialogProps) {
    const [formData, setFormData] = useState({
        senderName: '',
        // senderAddress: '',
        senderPhone: '',
        receiverName: '',
        receiverAddress: '',
        receiverPhone: '',
        dateOfAcceptance: new Date(),
        packageWeight: '',
        invoice: '',
        totalAmount: '',
        dueAmount: '',
        notes: ''
    })

    const [notesCount, setNotesCount] = useState(0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
        if (!isLoading) {
            onClose()
            setFormData({
                senderName: '',
                // senderAddress: '',
                senderPhone: '',
                receiverName: '',
                receiverAddress: '',
                receiverPhone: '',
                dateOfAcceptance: new Date(),
                packageWeight: '',
                invoice: '',
                totalAmount: '',
                dueAmount: '',
                notes: ''
            })
        }
    }

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        if (text.length <= 250) {
            setFormData({ ...formData, notes: text })
            setNotesCount(text.length)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Add Package</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Sender Information */}
                        <div className="space-y-2">
                            <Label htmlFor="senderName">Sender Name</Label>
                            <Input
                                id="senderName"
                                value={formData.senderName}
                                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                                placeholder="John Martin"
                                required
                            />
                        </div>
                        {/* <div className="space-y-2">
                            <Label htmlFor="senderAddress">Sender Address</Label>
                            <Input
                                id="senderAddress"
                                value={formData.senderAddress}
                                onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                                placeholder="Enter address"
                                required
                            />
                        </div> */}
                        <div className="space-y-2">
                            <Label htmlFor="senderPhone">Sender Phone</Label>
                            <Input
                                id="senderPhone"
                                value={formData.senderPhone}
                                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                                placeholder="+345 3388 55443"
                                required
                            />
                        </div>

                        {/* Receiver Information */}
                        <div className="space-y-2">
                            <Label htmlFor="receiverName">Receiver Name</Label>
                            <Input
                                id="receiverName"
                                value={formData.receiverName}
                                onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                                placeholder="Maria Decosova"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="receiverAddress">Receiver Address</Label>
                            <Input
                                id="receiverAddress"
                                value={formData.receiverAddress}
                                onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
                                placeholder="ST. Martin LA"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="receiverPhone">Receiver Phone</Label>
                            <Input
                                id="receiverPhone"
                                value={formData.receiverPhone}
                                onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                                placeholder="+345 3388 55443"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="receiverPhone">Invoice</Label>
                            <Input
                                id="invoice"
                                value={formData.invoice}
                                onChange={(e) => setFormData({ ...formData, invoice: e.target.value })}
                                placeholder="13131231"
                                required
                            />
                        </div>

                        {/* Package Details */}
                        <div className="space-y-2">
                            <Label htmlFor="dateOfAcceptance">Date of Acceptance</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.dateOfAcceptance ? (
                                            format(formData.dateOfAcceptance, "dd/MM/yyyy")
                                        ) : (
                                            <span>DD/MM/YYYY</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.dateOfAcceptance}
                                        onSelect={(date) => setFormData({ ...formData, dateOfAcceptance: date || new Date() })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="packageWeight">Package Weight</Label>
                            <Input
                                id="packageWeight"
                                value={formData.packageWeight}
                                onChange={(e) => setFormData({ ...formData, packageWeight: e.target.value })}
                                placeholder="e.g. 18kg"
                                required
                            />
                        </div>

                        {/* Amount Information */}
                        <div className="space-y-2">
                            <Label htmlFor="totalAmount">Total Amount</Label>
                            <Input
                                id="totalAmount"
                                value={formData.totalAmount}
                                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                                placeholder="$ 100"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueAmount">Due Amount</Label>
                            <Input
                                id="dueAmount"
                                value={formData.dueAmount}
                                onChange={(e) => setFormData({ ...formData, dueAmount: e.target.value })}
                                placeholder="$ 0"
                                required
                            />
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Enter Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={handleNotesChange}
                            className="min-h-[100px]"
                            placeholder="Enter package notes here..."
                        />
                        <div className="text-sm text-muted-foreground text-right">
                            {notesCount} / 250 max
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    <span>Adding...</span>
                                </div>
                            ) : (
                                "Submit Package"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

