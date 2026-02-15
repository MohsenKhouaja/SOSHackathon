import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Users,
  Home,
  Building2,
  AlertTriangle,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { PageContainer } from "@/components/layouts/page-container";
import GenericHeader from "@/components/headers/generic-header";

export default function Dashboard() {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery(trpc.stats.get.queryOptions());

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="flex h-full items-center justify-center">
          <p className="text-destructive">Failed to load dashboard data.</p>
        </div>
      </PageContainer>
    );
  }

  const {
    totalPrograms,
    totalHomes,
    totalChildren,
    totalUsers,
    totalIncidents,
    incidentsByStatus,
    incidentsByUrgency,
  } = stats || {};

  return (
    <PageContainer>
      <GenericHeader
        title="Dashboard"
        subtitle="Overview of your organization"
        icon={<Activity className="h-5 w-5" />}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Programs"
          value={totalPrograms}
          icon={Building2}
          description="Active programs"
        />
        <StatsCard
          title="Total Homes"
          value={totalHomes}
          icon={Home}
          description="Registered homes"
        />
        <StatsCard
          title="Total Children"
          value={totalChildren}
          icon={Users} // Or Child icon if available
          description="Children in care"
        />
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          description="Platform users"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Incidents Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                <span className="text-3xl font-bold">{totalIncidents}</span>
                <span className="text-sm text-muted-foreground">
                  Total Incidents
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-destructive/10">
                <span className="text-3xl font-bold text-destructive">
                  {incidentsByUrgency?.CRITICAL || 0}
                </span>
                <span className="text-sm text-muted-foreground">Critical</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-orange-100 dark:bg-orange-900/20">
                <span className="text-3xl font-bold text-orange-600">
                  {incidentsByUrgency?.HIGH || 0}
                </span>
                <span className="text-sm text-muted-foreground">
                  High Urgency
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-4">By Status</h4>
              <div className="space-y-2">
                <StatusRow
                  label="Reported"
                  count={incidentsByStatus?.REPORTED}
                  icon={AlertTriangle}
                  color="text-yellow-500"
                />
                <StatusRow
                  label="Evaluation"
                  count={incidentsByStatus?.EVALUATION}
                  icon={Activity}
                  color="text-blue-500"
                />
                <StatusRow
                  label="Action Plan"
                  count={incidentsByStatus?.ACTION_PLAN}
                  icon={Clock}
                  color="text-purple-500"
                />
                <StatusRow
                  label="Follow Up"
                  count={incidentsByStatus?.FOLLOW_UP}
                  icon={Clock}
                  color="text-indigo-500"
                />
                <StatusRow
                  label="Formal Decision"
                  count={incidentsByStatus?.FORMAL_DECISION}
                  icon={CheckCircle}
                  color="text-green-500"
                />
                <StatusRow
                  label="Closed"
                  count={incidentsByStatus?.CLOSED}
                  icon={CheckCircle}
                  color="text-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity log coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value?: number;
  icon: any;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value ?? 0}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  count?: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Icon className={`h-4 w-4 mr-2 ${color}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium">{count ?? 0}</span>
    </div>
  );
}
