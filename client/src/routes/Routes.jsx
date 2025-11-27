import { createBrowserRouter } from "react-router-dom";
import Root from "../layouts/Root";
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
import AdminDashboard from "../pages/AdminDashboard";
import AdminPurchases from "../pages/AdminPurchases";
import AdminAnalytics from "../pages/AdminAnalytics";
import AdminInventory from "../pages/AdminInventory";
import AdminPricing from "../pages/AdminPricing";
import PurchaseBlood from "../pages/PurchaseBlood";
import PurchaseSuccess from "../pages/PurchaseSuccess";

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
      {
        path: "/admin",
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
