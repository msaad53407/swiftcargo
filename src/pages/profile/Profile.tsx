"use client";

import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Mail, Phone, MapPin, Building, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.js";

interface Manager {
  name: string;
  email: string;
  department: string;
  designation: string;
  phone: string;
  address: string;
  emailVerified: boolean;
  kycVerified: boolean;
  userType: "manager";
  uid: string;
  createdAt: Date;
  suspended: boolean;
}

export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [managerData, setManagerData] = useState<Manager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchManagerData() {
      if (currentUser && currentUser.userType === "manager") {
        try {
          const managerDoc = await getDoc(doc(db, "managers", currentUser.uid));
          if (managerDoc.exists()) {
            setManagerData(managerDoc.data() as Manager);
          } else {
            setError("Manager data not found");
          }
        } catch (err) {
          setError("Failed to fetch manager data");
        }
      }
      setIsLoading(false);
    }

    if (!authLoading) {
      fetchManagerData();
    }
  }, [currentUser, authLoading]);

  if (authLoading || isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!currentUser) {
    return <ErrorMessage message="No user found. Please log in." />;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className=" mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{currentUser.name}</h2>
                <p className="text-muted-foreground">{currentUser.email}</p>
              </div>
              <Badge variant={currentUser.userType === "admin" ? "default" : "secondary"}>
                {currentUser.userType === "admin" ? "Admin" : "Manager"}
              </Badge>
              {currentUser.userType === "manager" && managerData && <ManagerDetails manager={managerData} />}
              {currentUser.userType === "admin" && <AdminDetails admin={currentUser} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ManagerDetails({ manager }: { manager: Manager }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DetailItem icon={Building} label="Department" value={manager.department} />
      <DetailItem icon={Briefcase} label="Designation" value={manager.designation} />
      <DetailItem icon={Phone} label="Phone" value={manager.phone} />
      <DetailItem icon={MapPin} label="Address" value={manager.address} />

      <DetailItem
        icon={AlertCircle}
        label="Account Status"
        value={manager.suspended ? "Suspended" : "Active"}
        valueColor={manager.suspended ? "text-red-600" : "text-green-600"}
      />
    </div>
  );
}

function AdminDetails({ admin }: { admin: any }) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground">As an admin, you have full access to the system.</p>
      <p className="font-semibold">Responsibilities:</p>
      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
        <li>Manage user accounts</li>
        <li>Add Employees to System</li>
        <li>Add and Update Packages</li>
        <li>Generate and analyze reports</li>
      </ul>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  valueColor = "text-foreground",
}: {
  icon: any;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className={valueColor}>{value}</span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-6 w-24" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
