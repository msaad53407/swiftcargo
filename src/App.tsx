// src/App.tsx
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import SignIn from "@/pages/auth/SignIn";
import EmployeesPage from "@/pages/employees/EmployeesPage";
import { useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ChatLayout from "./components/layout/ChatLayout";
import { ToastProvider } from "./components/providers/ToastProvider";
import Dashboard from "./pages/dashboard/Dashboard";
import ChatPage from "./pages/ecommerce/chat";
import IndividualChatPage from "./pages/ecommerce/chat/IndividualChat";
import EcommerceDashboard from "./pages/ecommerce/dashboard";
import EcommerceNotificationsPage from "./pages/ecommerce/notifications";
import NotificationsPage from "./pages/notifcation/Notification";
import OrdersPage from "./pages/ecommerce/orders";
import PoliciesPage from "./pages/ecommerce/policies";
import ProductsPage from "./pages/ecommerce/products";
import AddProduct from "./pages/ecommerce/products/AddProduct";
import EditProductPage from "./pages/ecommerce/products/UpdateProduct";
import SettingsPage from "./pages/ecommerce/settings";
import PackageManagment from "./pages/package/PackageManagment";
import ProfilePage from "./pages/profile/Profile";
import CreateOrderPage from "./pages/ecommerce/orders/CreateOrder";

function DashboardLayout({ type, children }: { type?: "default" | "ecommerce"; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} type={type} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 ">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<SignIn />} /> */}
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/dashboard"
            element={
              // <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              // <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <DashboardLayout>
                <EmployeesPage />
              </DashboardLayout>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              // <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <DashboardLayout>
                <PackageManagment />
              </DashboardLayout>
              // </ProtectedRoute>
            }
          />
          {/* <Route
            path="/invoices"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <DashboardLayout>
                  <InvoicePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/notifications"
            element={
              // <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <DashboardLayout>
                <NotificationsPage />
              </DashboardLayout>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              // <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/ecommerce/*"
            element={
              <DashboardLayout type="ecommerce">
                <Routes>
                  <Route path="dashboard" element={<EcommerceDashboard />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/add" element={<AddProduct />} />
                  <Route path="products/update/:id" element={<EditProductPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/add" element={<CreateOrderPage />} />
                  <Route path="notifications" element={<EcommerceNotificationsPage />} />
                  <Route
                    path="chat"
                    element={
                      <ChatLayout>
                        <ChatPage />
                      </ChatLayout>
                    }
                  />
                  <Route
                    path="chat/:id"
                    element={
                      <ChatLayout>
                        <IndividualChatPage />
                      </ChatLayout>
                    }
                  />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="policies" element={<PoliciesPage />} />
                  <Route path="" element={<Navigate to="/ecommerce/dashboard" />} />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
      <ToastProvider />
    </AuthProvider>
  );
}

export default App;
