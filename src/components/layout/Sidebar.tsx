import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquareTextIcon,
  NotebookTabs,
  Package,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "Packages Management", path: "/" },
  { icon: Bell, label: "Notification", path: "/notifications" },
  { icon: Users, label: "Employees", path: "/employees" },
  // { icon: FileText, label: 'Invoice Management', path: '/invoices' },
  { icon: Settings, label: "Setting", path: "/settings" },
];

const ECommerceMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/ecommerce/dashboard" },
  { icon: Package, label: "Product Management", path: "/ecommerce/products" },
  { icon: Plus, label: "Add Product", path: "/ecommerce/products/add" },
  { icon: CreditCard, label: "Order Management", path: "/ecommerce/orders" },
  { icon: Bell, label: "Notification", path: "/ecommerce/notifications" },
  {
    icon: MessageSquareTextIcon,
    label: "Chat",
    path: "/ecommerce/chat",
  },
  { icon: NotebookTabs, label: "Policies", path: "/ecommerce/policies" },
  { icon: Settings, label: "Setting", path: "/ecommerce/settings" },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  type?: "default" | "ecommerce";
}

export function Sidebar({ open, setOpen, type = "default" }: SidebarProps) {
  const { logout, currentUser } = useAuth();
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

  const handleViewToggle = () => {
    if (location.pathname.includes("ecommerce")) {
      navigate("/dashboard");
      return;
    }
    navigate("/ecommerce/dashboard");
  };

  const itemsToRender = type === "default" ? menuItems : ECommerceMenuItems;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden transition-opacity duration-300 ease-in-out ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col gap-y-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sticky top-0 bg-white z-10 border-b">
            <h1 className="text-2xl font-bold">
              Ummah<span className="text-[#40B093]"> Cargo</span>
            </h1>
            <button onClick={() => setOpen(false)} className="lg:hidden">
              <X size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 overflow-y-auto w-full">
            <Button onClick={handleViewToggle} className="my-4 w-fit mx-auto">
              {location.pathname.includes("ecommerce") ? "Switch to Management" : "Switch to E-Commerce"}
            </Button>
            <ul className="space-y-1">
              {itemsToRender.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                if (currentUser && currentUser.userType === "manager" && item.path === "/ecommerce/products/add") {
                  return null;
                }
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
                        isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
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
          <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white z-10">
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
