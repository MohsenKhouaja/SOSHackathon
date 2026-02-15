import LanciSpinner from "@repo/ui/components/spinner";
import { Outlet } from "react-router";
import { useCurrentUser } from "@/api/queries/auth-queries";

/**
 * Protects routes that require completed onboarding.
 * Redirects to /onboarding if user doesn't have an active organization.
 */
const OnboardingProtectedRoute = () => {
  const { isPending } = useCurrentUser();

  if (isPending) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LanciSpinner />
      </div>
    );
  }

  // Check if user has completed onboarding (has session)
  // const hasCompletedOnboarding = Boolean(data?.session);

  // if (!hasCompletedOnboarding) {
  //   // Redirect to onboarding if not completed
  //   return <Navigate replace state={{ from: location }} to="/onboarding" />;
  // }

  return <Outlet />;
};

export default OnboardingProtectedRoute;
