"use client";

import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase/config.ts";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { notifyPackageStatusUpdated } from "@/utils/notificaiton.js";
import Loader from "../Loader.js";
import { useAuth } from "@/contexts/AuthContext.js";
import { Input } from "../ui/input.js";
import PackagePrintButton from "./PackagePrintButton.js";

interface Sender {
  name: string;
  // address: string;
  phone: string;
}

interface Receiver {
  name: string;
  address: string;
  phone: string;
}

interface Amount {
  total: number;
  pending: number;
  cargoFee: number;
  shippingFee: number;
}

interface Package {
  id: string;
  sender: Sender;
  receiver: Receiver;
  invoiceNo: string;
  dateOfAcceptance: string;
  packageWeight: string;
  contentDetail: string;
  paymentStatus: string;
  amount: Amount;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: {
    name: string;
    email: string;
  };
}

interface PackageDetailsProps {
  packageId: string;
}

export function PackageDetails({ packageId }: { packageId: string }) {
  const { currentUser } = useAuth();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Package | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPackageData();
  }, [packageId]);

  useEffect(() => {
    if (packageData) {
      setEditedData(packageData);
    }
  }, [packageData]);

  const fetchPackageData = async () => {
    try {
      const packagesCollectionRef = collection(db, "packages");
      const q = query(packagesCollectionRef, where("id", "==", packageId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        setPackageData(data);
      }
    } catch (error) {
      toast.error("Error fetching package data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (!editedData) return;

    if (section) {
      setEditedData({
        ...editedData,
        [section]: {
          ...editedData[section],
          [field]: value,
        },
      });
    } else {
      setEditedData({
        ...editedData,
        [field]: value,
      });
    }
  };

  const calculatePaymentStatus = (total, pending) => {
    if (pending === 0) return "Paid";
    if (pending === total) return "Unpaid";
    return "Partially Paid";
  };

  const handleSave = async () => {
    if (!editedData) return;
    setIsSaving(true);

    try {
      const packagesCollectionRef = collection(db, "packages");
      const q = query(packagesCollectionRef, where("id", "==", packageId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const docRef = doc.ref;

        // Calculate the paymentStatus based on amount values
        const { total, pending } = editedData.amount;
        const paymentStatus = calculatePaymentStatus(total, pending);

        await updateDoc(docRef, {
          ...editedData,
          paymentStatus, // Set the dynamically calculated paymentStatus
          updatedAt: new Date().toISOString(),
          updatedBy: {
            name: currentUser?.name || "",
            email: currentUser?.email || "",
          },
        });

        if (editedData.status !== packageData?.status) {
          await notifyPackageStatusUpdated(
            packageId,
            editedData.invoiceNo,
            editedData.status || "",
            currentUser?.name || "",
          );
        }

        toast.success("Package updated successfully");
        setIsEditing(false);
        fetchPackageData();
      }
    } catch (error) {
      toast.error("Error updating package");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) return <Loader />;
  if (!packageData || !editedData) return <div>No package data found</div>;

  const renderField = (label: string, value: string, field: string, section?: string) => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Label className="text-muted-foreground">{label}</Label>
          <Input
            value={section ? editedData[section][field] : editedData[field]}
            onChange={(e) => handleInputChange(field, e.target.value, section)}
          />
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <Label className="text-muted-foreground">{label}</Label>
        <p className="font-medium">{value}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))} disabled={isSaving}>
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Saving...</span>
            </div>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Edit"
          )}
        </Button>
        {isEditing && (
          <Button variant="outline" className="ml-2" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
        <PackagePrintButton pkg={packageData} />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Package Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {renderField("Invoice No", packageData.invoiceNo, "invoiceNo")}
              {renderField("Sender Name", packageData.sender.name, "name", "sender")}
              {renderField("Sender Mobile Number", packageData.sender.phone, "phone", "sender")}
            </div>
            <div className="space-y-6">
              {renderField("Receiver Name", packageData.receiver.name, "name", "receiver")}
              {renderField("Receiver Mobile Number", packageData.receiver.phone, "phone", "receiver")}
              {renderField("Address To", packageData.receiver.address, "address", "receiver")}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {renderField("Date of Acceptance", packageData.dateOfAcceptance, "dateOfAcceptance")}
              {renderField("Package Weight", packageData.packageWeight, "packageWeight")}
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Cargo Fee</Label>
                    <Input
                      type="number"
                      value={editedData.amount.cargoFee}
                      onChange={(e) => handleInputChange("cargoFee", parseFloat(e.target.value), "amount")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Shipping Fee</Label>
                    <Input
                      type="number"
                      value={editedData.amount.shippingFee}
                      onChange={(e) => handleInputChange("shippingFee", parseFloat(e.target.value), "amount")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <Input
                      type="number"
                      value={editedData.amount.total}
                      onChange={(e) => handleInputChange("total", parseFloat(e.target.value), "amount")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Pending Amount</Label>
                    <Input
                      type="number"
                      value={editedData.amount.pending}
                      onChange={(e) => handleInputChange("pending", parseFloat(e.target.value), "amount")}
                    />
                  </div>
                </>
              ) : (
                <>
                  {!isEditing && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Payment Status</Label>
                      <p className="font-medium">{packageData.paymentStatus}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Cargo Fee</Label>
                    <p className="font-medium">${packageData.amount.cargoFee}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Shipping Fee</Label>
                    <p className="font-medium">${packageData.amount.shippingFee}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-medium">${packageData.amount.total}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Pending Amount</Label>
                    <p className="font-medium">${packageData.amount.pending}</p>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-4">
              {renderField("Content Detail", packageData.contentDetail, "contentDetail")}

              {/* {renderField("Payment Status", packageData.paymentStatus, "paymentStatus")} */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Delivery Status</Label>
                <Select
                  value={editedData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="arrived-at-tash-airport">Arrived at Tash Airport</SelectItem>
                    <SelectItem value="departed-from-tash-airport">Departed from Tash Airport</SelectItem>
                    <SelectItem value="arrived-at-jfk-airport">Arrived at JFK Airport</SelectItem>
                    <SelectItem value="picked-up-from-jfk-airport">Picked up from JFK Airport</SelectItem>
                    <SelectItem value="available-for-pick-up">Available for pick up</SelectItem>
                    <SelectItem value="shipped-to-receivers-destination">Shipped to Receiver's destination</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4 md:col-span-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Updated By</Label>
                  <p className="font-medium">
                    {packageData.updatedBy?.name} ({packageData.updatedBy?.email})
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="font-medium">
                    {packageData.updatedAt ? new Date(packageData.updatedAt).toLocaleString() : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
