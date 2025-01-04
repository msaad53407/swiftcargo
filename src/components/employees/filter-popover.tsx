"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ListFilter } from 'lucide-react'
import { useState } from "react"

interface FilterPopoverProps {
    filters: FilterValues
    onApplyFilter: (filters: FilterValues) => void
    onResetFilter: () => void
    onSaveFilter: () => void
}

export interface FilterValues {
    emailVerified: boolean
    kycVerified: boolean
    department: string
    designation: string
}

export function FilterPopover({
    filters,
    onApplyFilter,
    onResetFilter,
    onSaveFilter,
}: FilterPopoverProps) {
    const [localFilters, setLocalFilters] = useState<FilterValues>(filters)

    const handleApplyFilter = () => {
        onApplyFilter(localFilters)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <ListFilter className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Filter Members</h4>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="email"
                                    checked={localFilters.emailVerified}
                                    onCheckedChange={(checked) =>
                                        setLocalFilters({ ...localFilters, emailVerified: checked as boolean })
                                    }
                                />
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Email Verified
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="kyc"
                                    checked={localFilters.kycVerified}
                                    onCheckedChange={(checked) =>
                                        setLocalFilters({ ...localFilters, kycVerified: checked as boolean })
                                    }
                                />
                                <label
                                    htmlFor="kyc"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    KYC Verified
                                </label>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <div className="grid gap-1">
                                <label className="text-sm">Department</label>
                                <Select
                                    value={localFilters.department}
                                    onValueChange={(value) =>
                                        setLocalFilters({ ...localFilters, department: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                        <SelectItem value="Human Resource">Human Resource</SelectItem>
                                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleApplyFilter} className="w-full">
                            Filter
                        </Button>
                        <div className="flex justify-between">
                            <Button variant="outline" size="sm" onClick={onResetFilter}>
                                Reset Filter
                            </Button>

                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default FilterPopover