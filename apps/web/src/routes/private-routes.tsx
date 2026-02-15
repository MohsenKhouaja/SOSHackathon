import LanciSpinner from "@repo/ui/components/spinner";
import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/api/queries/auth-queries";

const PrivateRoutes = () => {
  const { data, isPending, isError } = useCurrentUser();
  if (isPending) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LanciSpinner />
      </div>
    );
  }
  if (!data || isError) {
    // Redirect unauthenticated users to login
    return <Navigate replace to="/login" />;
  }
  return <Outlet />;
};

export default PrivateRoutes;
