import { AddPackageDialog } from "@/components/package/AddPackageDialog";
import { PackageTable } from "@/components/package/PackageManagmentTable";
import { Button } from "@/components/ui/button"
import { createPackageWithInvoice } from "@/utils/addPackage";
import { Download, Filter, Plus } from "lucide-react"
import { useState } from "react";
import { auth, db } from "../../firebase/config.js";

import { useAuth } from "@/contexts/AuthContext.js";
import { toast } from "sonner";
function PackageManagment() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [download, setDownload] = useState(false)
    const { currentUser, loading } = useAuth();
    const [packageAdded, setPackageAdded] = useState(false)
    const handleAddPackage = async (data: typeof formData) => {

        setIsLoading(true);
        try {
            await createPackageWithInvoice(data, db);
            toast.success('Package added successfully! ');
            setPackageAdded(true)
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to create employee account');
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start lg:items-center justify-between">
                <div className="mb-4 lg:mb-0">
                    <h1 className="text-2xl font-semibold">Package Management</h1>
                    <p className="text-gray-500">Manage shipments, clients, and finances.</p>
                </div>
                <div className="flex  lg:flex-row items-start lg:items-center gap-4 lg:gap-4 lg:justify-end w-full lg:w-auto">
                    <Button
                        variant="outline"
                        className="gap-2 w-full lg:w-auto"
                        onClick={() => setDownload(!download)}
                    >
                        <Download size={20} />
                        Export
                    </Button>
                    {currentUser?.userType === 'admin' && (
                        <Button
                            className="w-full lg:w-auto"
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <Plus size={20} />
                            Add Package
                        </Button>
                    )}
                </div>
            </div>


            <PackageTable packageAdded={packageAdded} setPackageAdded={setPackageAdded} download={download} setDownload={setDownload} />
            <AddPackageDialog onClose={() => setIsAddDialogOpen(false)} isLoading={isLoading} isOpen={isAddDialogOpen} onSubmit={handleAddPackage} />

        </div>
    )
}

export default PackageManagment
