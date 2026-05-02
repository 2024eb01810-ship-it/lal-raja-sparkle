import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteLayout from "@/components/layout/SiteLayout";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Collections from "./pages/Collections";
import Product from "./pages/Product";
import Bridal from "./pages/Bridal";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Store from "./pages/Store";
import Contact from "./pages/Contact";
import Certifications from "./pages/Certifications";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import AdminLayout from "@/components/admin/AdminLayout";
import { RequireStaff } from "@/components/admin/RequireStaff";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCollections from "./pages/admin/AdminCollections";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminStoreInfo from "./pages/admin/AdminStoreInfo";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminEnquiries from "./pages/admin/AdminEnquiries";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:category" element={<Collections />} />
              <Route path="/product/:slug" element={<Product />} />
              <Route path="/bridal" element={<Bridal />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/about" element={<About />} />
              <Route path="/store" element={<Store />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/certifications" element={<Certifications />} />
            </Route>
            <Route path="/auth" element={<Auth />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <RequireStaff>
                  <AdminLayout />
                </RequireStaff>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="collections" element={<AdminCollections />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="offers" element={<AdminOffers />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="store-info" element={<AdminStoreInfo />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route
                path="users"
                element={
                  <RequireStaff requireAdmin>
                    <AdminUsers />
                  </RequireStaff>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
