"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListFilter } from "lucide-react";
import { useState } from "react";

interface Package {
  id: string;
  sender: {
    name: string;
    address: string;
    phone: string;
  };
  receiver: {
    name: string;
    address: string;
    phone: string;
  };
  invoiceNo: string;
  dateOfAcceptance: string;
  packageWeight: string;
  contentDetail: string;
  paymentStatus: "Paid" | "Pending";
  amount: {
    total: number;
    pending: number;
  };
  status: string;
}

export interface FilterValues {
  paymentStatus: {
    paid: boolean;
    pending: boolean;
  };
  status: string;
}

interface FilterPopoverProps {
  filters: FilterValues;
  onApplyFilter: (filters: FilterValues) => void;
  onResetFilter: () => void;
}

export function FilterPopover({ filters, onApplyFilter, onResetFilter }: FilterPopoverProps) {
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters);

  const handleApplyFilter = () => {
    onApplyFilter(localFilters);
  };

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
            <h4 className="font-medium leading-none">Filter Packages</h4>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="paid"
                  checked={localFilters.paymentStatus.paid}
                  onCheckedChange={(checked) =>
                    setLocalFilters({
                      ...localFilters,
                      paymentStatus: {
                        ...localFilters.paymentStatus,
                        paid: checked as boolean,
                      },
                    })
                  }
                />
                <label
                  htmlFor="paid"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Paid
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pending"
                  checked={localFilters.paymentStatus.pending}
                  onCheckedChange={(checked) =>
                    setLocalFilters({
                      ...localFilters,
                      paymentStatus: {
                        ...localFilters.paymentStatus,
                        pending: checked as boolean,
                      },
                    })
                  }
                />
                <label
                  htmlFor="pending"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Payment Pending
                </label>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <label className="text-sm">Package Status</label>
                <Select
                  value={localFilters.status}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="arrived-at-tash-airport">Arrived at Tash Airport</SelectItem>
                    <SelectItem value="departed-from-tash-airport">Departed from Tash Airport</SelectItem>
                    <SelectItem value="arrived-at-jfk-airport">Arrived at JFK Airport</SelectItem>
                    <SelectItem value="picked-up-from-jfk-airport">Picked up from JFK Airport</SelectItem>
                    <SelectItem value="available-for-pickup">Available for pick up</SelectItem>
                    <SelectItem value="shipped-to-receivers-destination">Shipped to Receiver’s destination</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleApplyFilter} className="w-full">
              Apply Filters
            </Button>
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={onResetFilter}>
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default FilterPopover;
