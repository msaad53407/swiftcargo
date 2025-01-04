import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Bell, Users, FileText, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Packages Management', path: '/packages' },
  { icon: Bell, label: 'Notification', path: '/notifications' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: FileText, label: 'Invoice Management', path: '/invoices' },
  { icon: Settings, label: 'Setting', path: '/settings' },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout successfully!");
      navigate("/");
    } catch (error) {
      toast.error(`Logout Failed: ${error}`);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden transition-opacity duration-300 ease-in-out ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${open ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold">
              Swift<span className="text-[#40B093]">cargo</span>.
            </h1>
            <button onClick={() => setOpen(false)} className="lg:hidden">
              <X size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      onClick={() => setOpen(false)}
                    >
                      <Icon size={20} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut size={20} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
