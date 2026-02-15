import LanciSpinner from "@repo/ui/components/spinner";
import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "@/api/queries/auth-queries";
import { toast } from "sonner";
import { useEffect } from "react";

interface RoleProtectedRouteProps {
    allowedRoles: string[];
}

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
    const { data: user, isPending, isError } = useCurrentUser();

    useEffect(() => {
        if (user && !allowedRoles.includes(user.role)) {
            toast.error("You do not have permission to access this page.");
        }
    }, [user, allowedRoles]);

    if (isPending) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <LanciSpinner />
            </div>
        );
    }

    if (isError || !user) {
        return <Navigate replace to="/login" />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate replace to="/dashboard" />;
    }

    return <Outlet />;
};

export default RoleProtectedRoute;
