// src/App.tsx
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";

import { useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ChatLayout from "./components/layout/ChatLayout";
import { ToastProvider } from "./components/providers/ToastProvider";
import {
  AddColor,
  AddProduct,
  Dashboard,
  EcommerceDashboard,
  EmployeesPage,
  NotificationsPage,
  PackageManagment,
  ProductsPage,
  ProfilePage,
  SignIn,
  ChatPage,
  CreateOrderPage,
  UpdateOrderPage,
  EcommerceNotificationsPage,
  EditProductPage,
  IndividualChatPage,
  OrdersPage,
  PoliciesPage,
  SettingsPage,
} from "./pages";

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
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <DashboardLayout>
                  <EmployeesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <DashboardLayout>
                  <PackageManagment />
                </DashboardLayout>
              </ProtectedRoute>
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
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ecommerce/*"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <DashboardLayout type="ecommerce">
                  <Routes>
                    <Route path="dashboard" element={<EcommerceDashboard />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="colors/add" element={<AddColor />} />
                    <Route path="products/update/:id" element={<EditProductPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/add" element={<CreateOrderPage />} />
                    <Route path="orders/update/:id" element={<UpdateOrderPage />} />
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
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastProvider />
    </AuthProvider>
  );
}

export default App;
