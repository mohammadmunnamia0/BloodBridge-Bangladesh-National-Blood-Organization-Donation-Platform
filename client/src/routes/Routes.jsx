import { createBrowserRouter } from "react-router-dom";
import Root from "../layouts/Root";
import AdminLayout from "../layouts/AdminLayout";
import BloodPurchaseDashboard from "../pages/BloodPurchaseDashboard";
import BloodRequestDashboard from "../pages/BloodRequestDashboard";
import BuyBlood from "../pages/BuyBlood";
import Home from "../pages/Home";
import Hospitals from "../pages/Hospitals";
import Login from "../pages/Login";
import Organizations from "../pages/Organizations";
import PriceComparison from "../pages/PriceComparison";
import RegisterDonor from "../pages/RegisterDonor";
import RequestBlood from "../pages/RequestBlood";
import Profile from "../pages/Profile";
import AdminLogin from "../pages/AdminLogin";
import UnifiedAdminDashboard from "../pages/UnifiedAdminDashboard";
import AdminDashboardMain from "../pages/AdminDashboardMain";
import AdminDashboard from "../pages/AdminDashboard";
import AdminPurchases from "../pages/AdminPurchases";
import AdminAnalytics from "../pages/AdminAnalytics";
import AdminInventory from "../pages/AdminInventory";
import AdminPricing from "../pages/AdminPricing";
import PurchaseBlood from "../pages/PurchaseBlood";
import PurchaseSuccess from "../pages/PurchaseSuccess";
import RegisterOrganization from "../pages/RegisterOrganization";
import RegisterHospital from "../pages/RegisterHospital";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/blood-requests",
        element: <BloodRequestDashboard />,
      },
      {
        path: "/request-blood",
        element: <RequestBlood />,
      },
      {
        path: "/register-donor",
        element: <RegisterDonor />,
      },
      {
        path: "/hospitals",
        element: <Hospitals />,
      },
      {
        path: "/organizations",
        element: <Organizations />,
      },
      {
        path: "/buy-blood",
        element: <BuyBlood />,
      },
      {
        path: "/purchase-blood",
        element: <PurchaseBlood />,
      },
      {
        path: "/purchase-success",
        element: <PurchaseSuccess />,
      },
      {
        path: "/price-comparison",
        element: <PriceComparison />,
      },
      {
        path: "/purchase-dashboard",
        element: <BloodPurchaseDashboard />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/register-organization",
    element: <RegisterOrganization />,
  },
  {
    path: "/register-hospital",
    element: <RegisterHospital />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "/admin",
        element: <AdminLogin />,
      },
      {
        path: "/admin/dashboard",
        element: <UnifiedAdminDashboard />,
      },
      {
        path: "/admin/old-main",
        element: <AdminDashboardMain />,
      },
      {
        path: "/admin/old-dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/admin/purchases",
        element: <AdminPurchases />,
      },
      {
        path: "/admin/analytics",
        element: <AdminAnalytics />,
      },
      {
        path: "/admin/inventory",
        element: <AdminInventory />,
      },
      {
        path: "/admin/pricing",
        element: <AdminPricing />,
      },
    ],
  },
]);

export default router;
