import SubmitReport from "./pages/submit-report";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { queryClient } from "./lib/trpc";
import Layout from "./layout";
import PrivateRoutes from "./routes/private-routes";
import ProgramsList from "./pages/programs/programs-list";
import HomesList from "./pages/homes/homes-list";
import UsersList from "./pages/users/users-list";
import ChildrenList from "./pages/children/children-list";
import ChildDetails from "./pages/children/child-details";
import RoleProtectedRoute from "./routes/role-protected-route";
import Dashboard from "./pages/dashboard";

const router = createBrowserRouter([
  {
    path: "/login",
    lazy: () => import("./pages/login").then((m) => ({ Component: m.default })),
  },
  {
    path: "/",
    element: <PrivateRoutes />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "programs",
            element: <ProgramsList />,
          },
          {
            path: "homes",
            element: <HomesList />,
          },
          {
            element: (
              <RoleProtectedRoute
                allowedRoles={["NATIONAL_DIRECTOR", "PROGRAM_DIRECTOR"]}
              />
            ),
            children: [
              {
                path: "users",
                element: <UsersList />,
              },
            ],
          },
          {
            path: "children",
            children: [
              { index: true, element: <ChildrenList /> },
              { path: ":id", element: <ChildDetails /> },
            ],
          },
          {
            path: "incidents",
            children: [
              {
                index: true,
                lazy: () =>
                  import("./pages/incidents/incidents-list").then((m) => ({
                    Component: m.default,
                  })),
              },
              {
                path: ":id",
                lazy: () =>
                  import("./pages/incidents/incident-details").then((m) => ({
                    Component: m.default,
                  })),
              },
            ],
          },
          {
            path: "notifications",
            lazy: () =>
              import("./pages/notifications/notifications-list").then((m) => ({
                Component: m.default,
              })),
          },
          {
            element: (
              <RoleProtectedRoute
                allowedRoles={["NATIONAL_DIRECTOR", "PROGRAM_DIRECTOR"]}
              />
            ),
            children: [
              {
                path: "audit",
                lazy: () =>
                  import("./pages/audit/audit-logs-list").then((m) => ({
                    Component: m.default,
                  })),
              },
            ],
          },
          {
            path: "submit-report",
            element: <SubmitReport />,
          },
        ],
      },
    ],
  },
]);

// App component
const App = () => {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </NuqsAdapter>
  );
};

export default App;
