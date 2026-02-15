import LanciSpinner from "@repo/ui/components/spinner";
import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/api/queries/auth-queries";

const PublicRoutes = () => {
  const { data, isPending } = useCurrentUser();
  if (isPending) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LanciSpinner />
      </div>
    );
  }
  if (data) {
    // Check if user has completed onboarding (has session)
    const hasCompletedOnboarding = Boolean(data.session);

    // Redirect authenticated users to onboarding or dashboard based on status
    return (
      <Navigate replace to={hasCompletedOnboarding ? "/" : "/onboarding"} />
    );
  }
  return <Outlet />;
};

export default PublicRoutes;
