import { useSession } from "@/lib/auth-client";
import { Navigate, Outlet } from "react-router";

export default function PrivateRoutes() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>; // Or a proper spinner
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

