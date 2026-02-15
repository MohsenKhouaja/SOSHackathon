import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import GenericHeader from "@/components/headers/generic-header";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { format } from "date-fns";
import { useIncidentQuery } from "@/api/queries/incident-queries";
// import {
//   useEvaluations,
//   useActionPlans,
//   useFollowUps,
//   useFormalDecisions,
// } from "@/api/queries/steps-queries";
// import { CreateEvaluationDialog } from "@/components/dialogs/create-evaluation-dialog";
// import { CreateActionPlanDialog } from "@/components/dialogs/create-action-plan-dialog";
// import { CreateFollowUpDialog } from "@/components/dialogs/create-follow-up-dialog";
// import { CreateFormalDecisionDialog } from "@/components/dialogs/create-formal-decision-dialog";
// import { AttachmentsList } from "@/components/attachments/attachments-list";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHeader } = useAppHeaderStore();

  const { data: incident, isLoading, isError, error } = useIncidentQuery(id!);

  // Fetch steps
  // const { data: evaluations } = useEvaluations(id!);
  // const { data: actionPlans } = useActionPlans(id!);
  // const { data: followUps } = useFollowUps(id!);
  // const { data: decisions } = useFormalDecisions(id!);
  const evaluations: {
    id: string;
    createdAt: string;
    evaluationDetails: string;
  }[] = [];
  const actionPlans: {
    id: string;
    targetDate?: string;
    proposedActions: string;
  }[] = [];
  const followUps: {
    id: string;
    createdAt: string;
    isResolved: boolean;
    followUpNotes: string;
  }[] = [];
  const decisions: {
    id: string;
    createdAt: string;
    finalStatus: string;
    decisionDetails: string;
    actionsTaken?: string;
  }[] = [];

  useEffect(() => {
    setHeader({
      variant: "default",
      title: "",
      subtitle: "",
    });
  }, [setHeader]);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">Loading incident...</p>
      </div>
    );
  }

  if (isError || !incident) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-destructive">
          {error?.message ?? "Incident not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <GenericHeader
        actions={
          <Button
            onClick={() => navigate("/incidents")}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
        className="sticky top-0 z-50 border-b bg-background p-3 pt-2"
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        subtitle={`Reported on ${format(new Date(incident.createdAt), "PPP")} `}
        title="Incident Details"
        variant="default"
      />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Overview</CardTitle>
              <Badge>{incident.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block">Type</span>
                  <span className="font-medium">{incident.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Urgency</span>
                  <span className="font-medium">{incident.urgencyLevel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Child</span>
                  <span className="font-medium">
                    {incident.childNameFallback ?? "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    Date of Incident
                  </span>
                  <span className="font-medium">
                    {incident.dateOfIncident
                      ? format(new Date(incident.dateOfIncident), "PPP")
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">
                  Description
                </span>
                <p className="p-3 bg-muted rounded-md">
                  {incident.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="evaluation" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
              <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
              <TabsTrigger value="follow-up">Follow Up</TabsTrigger>
              <TabsTrigger value="decision">Decision</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            <TabsContent value="evaluation">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Psychological Evaluation</CardTitle>
                  {/* <CreateEvaluationDialog reportId={incident.id} /> */}
                </CardHeader>
                <CardContent>
                  {evaluations?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No evaluations yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {evaluations?.map(
                        (e: {
                          id: string;
                          createdAt: string;
                          evaluationDetails: string;
                        }) => (
                          <div key={e.id} className="border p-4 rounded-md">
                            <div className="text-xs text-muted-foreground mb-2">
                              {format(new Date(e.createdAt), "PPP")}
                            </div>
                            <p>{e.evaluationDetails}</p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action-plan">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Action Plan</CardTitle>
                  {/* <CreateActionPlanDialog reportId={incident.id} /> */}
                </CardHeader>
                <CardContent>
                  {actionPlans?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No action plans yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {actionPlans?.map(
                        (a: {
                          id: string;
                          targetDate?: string;
                          proposedActions: string;
                        }) => (
                          <div key={a.id} className="border p-4 rounded-md">
                            <div className="text-xs text-muted-foreground mb-2">
                              Target Date:{" "}
                              {a.targetDate
                                ? format(new Date(a.targetDate), "PPP")
                                : "N/A"}
                            </div>
                            <p>{a.proposedActions}</p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="follow-up">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Follow Up</CardTitle>
                  {/* <CreateFollowUpDialog reportId={incident.id} /> */}
                </CardHeader>
                <CardContent>
                  {followUps?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No follow ups yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {followUps?.map(
                        (f: {
                          id: string;
                          createdAt: string;
                          isResolved: boolean;
                          followUpNotes: string;
                        }) => (
                          <div key={f.id} className="border p-4 rounded-md">
                            <div className="flex justify-between mb-2">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(f.createdAt), "PPP")}
                              </span>
                              <Badge
                                variant={
                                  f.isResolved ? "default" : "destructive"
                                }
                              >
                                {f.isResolved ? "Resolved" : "Unresolved"}
                              </Badge>
                            </div>
                            <p>{f.followUpNotes}</p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decision">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Formal Decision</CardTitle>
                  {/* <CreateFormalDecisionDialog reportId={incident.id} /> */}
                </CardHeader>
                <CardContent>
                  {decisions?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No formal decisions yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {decisions?.map(
                        (d: {
                          id: string;
                          createdAt: string;
                          finalStatus: string;
                          decisionDetails: string;
                          actionsTaken?: string;
                        }) => (
                          <div key={d.id} className="border p-4 rounded-md">
                            <div className="flex justify-between mb-2">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(d.createdAt), "PPP")}
                              </span>
                              <Badge>{d.finalStatus}</Badge>
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold block text-sm">
                                Decision:
                              </span>
                              <p>{d.decisionDetails}</p>
                            </div>
                            {d.actionsTaken && (
                              <div>
                                <span className="font-semibold block text-sm">
                                  Actions Taken:
                                </span>
                                <p>{d.actionsTaken}</p>
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments">
              {/* <AttachmentsList reportId={incident.id} /> */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
