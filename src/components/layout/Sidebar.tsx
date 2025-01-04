import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Bell,
  Users,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomToast } from '../ui/custom-toast';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Packages Management', path: '/packages' },
  // { icon: CreditCard, label: 'Payment Management', path: '/payments' },
  { icon: Bell, label: 'Notification', path: '/notifications' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: FileText, label: 'Invoice Management', path: '/invoices' },
  { icon: Settings, label: 'Setting', path: '/settings' },
];

export function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useCustomToast();
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout successfully!");

      // Error toast

      navigate("/");
    } catch (error) {

      toast.error(`Logout Failed: ${error}`);
    }
  };
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          Swift<span className="text-[#40B093]">cargo</span>.
        </h1>
      </div>

      <nav className="flex-1 px-4">
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
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
          <LogOut size={20} />
          Log out
        </button>
      </div>
    </div>
  );
}