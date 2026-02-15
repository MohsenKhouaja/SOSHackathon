import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import GenericHeader from "@/components/headers/generic-header";
import { Baby, ArrowLeft } from "lucide-react";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { format } from "date-fns";
import { useChild } from "@/api/queries/child-queries";

export default function ChildDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHeader } = useAppHeaderStore();

  const { data: child, isLoading, isError, error } = useChild(id!);

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
        <p className="text-muted-foreground">Loading child...</p>
      </div>
    );
  }

  if (isError || !child) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-destructive">
          {error?.message ?? "Child not found"}
        </p>
      </div>
    );
  }

  const incidentReports = child.incidentReports ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <GenericHeader
        actions={
          <Button
            onClick={() => navigate("/children")}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
        className="sticky top-0 z-50 border-b bg-background p-3 pt-2"
        icon={<Baby className="h-5 w-5 text-primary" />}
        subtitle={`${child.firstName} ${child.lastName}`}
        title="Child Details"
        variant="details"
      />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>
                  {child.firstName} {child.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date of Birth</span>
                <span>
                  {child.dateOfBirth
                    ? format(new Date(child.dateOfBirth), "PP")
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender</span>
                <span>{child.gender ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admission Date</span>
                <span>
                  {child.admissionDate
                    ? format(new Date(child.admissionDate), "PP")
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Home</span>
                <span>{child.home?.name ?? "N/A"}</span>
              </div>
              {child.medicalNotes && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Medical Notes</span>
                  <p className="text-sm">{child.medicalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complaints History</CardTitle>
            </CardHeader>
            <CardContent>
              {incidentReports.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No incident reports for this child
                </p>
              ) : (
                <ul className="space-y-2">
                  {incidentReports.map((report: { id: string; description: string; createdAt: Date }) => (
                    <li
                      key={report.id}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <p className="line-clamp-2">{report.description}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {report.createdAt
                          ? format(new Date(report.createdAt), "PPp")
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
