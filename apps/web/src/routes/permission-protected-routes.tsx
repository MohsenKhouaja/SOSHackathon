import { Outlet } from "react-router";

// import { useSession } from '@/utils/auth/client';

// interface RoleProtectedRouteProps {
//   role?: number;
// }

const RoleProtectedRoute = () => {
  //   const { data, isPending, error } = useSession();

  //   if (role) {
  //     const hasRequiredRole = data && data.user.role <= role;

  //     if (!hasRequiredRole) {
  //       return <NotFound />;
  //     }
  //   }

  return <Outlet />;
};

export default RoleProtectedRoute;
