import { useSession } from "@/lib/auth-client";
import { Navigate, Outlet } from "react-router";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export default function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is in allowedRoles
  // Assuming session.user has a role property as defined in auth configuration customSession
  const userRole = (session.user as any).role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />; // Or unauthorized page
  }

  return <Outlet />;
}

