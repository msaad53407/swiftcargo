import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { AddEmployeeDialog } from '@/components/employees/AddEmployeeDialog';
import { createEmployee, createOrReactivateEmployee } from '@/utils/employee';

import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [employeeAdded, setEmployeeAdded] = useState(false)
  const { currentUser } = useAuth()
  const handleAddEmployee = async (data: typeof formData) => {
    setIsLoading(true);
    try {
      await createOrReactivateEmployee(data);
      toast.success('Employee account created successfully!.');
      setEmployeeAdded(true)
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

          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-gray-500">Departmental Member's Information Details</p>
        </div>
        <div className="flex  lg:flex-row items-start lg:items-center gap-4 lg:gap-4 lg:justify-end w-full lg:w-auto">
          {/* <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={20} />
            Filter
          </Button> */}
          {currentUser?.userType === 'admin' && (
            <Button

              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus size={20} />
              Add Employee
            </Button>
          )}
        </div>
      </div>



      <EmployeeTable employeeAdded={employeeAdded} setEmployeeAdded={setEmployeeAdded} />

      <AddEmployeeDialog
        isLoading={isLoading}
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddEmployee}
      />
    </div>
  );
}