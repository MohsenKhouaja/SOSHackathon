import { Navigate, Outlet } from "react-router";
import { useIsDeliveryCompany } from "@/api/queries/auth-queries";

/**
 * Route wrapper that only allows delivery company users to access routes
 * Business users will be redirected to home page
 */
export default function DeliveryCompanyProtectedRoute() {
  const isDeliveryCompany = useIsDeliveryCompany();

  if (!isDeliveryCompany) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}
