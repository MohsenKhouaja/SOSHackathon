import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import type { IncidentRow } from "./incident-data-table-columns";
import { format } from "date-fns";
import type { Table } from "@tanstack/react-table";
import { cn } from "@repo/ui/lib/utils";

interface IncidentMobileCardProps {
  row: { original: IncidentRow; toggleSelected: (value: boolean) => void; getIsSelected: () => boolean };
  isSelected: boolean;
  isSelectionMode: boolean;
  table: Table<IncidentRow>;
}

export function IncidentMobileCard({
  row,
  isSelected,
  isSelectionMode,
  table,
}: IncidentMobileCardProps) {
  const incident = row.original;
  
  return (
    <Card
      className={cn(
        "transition-colors",
        isSelected ? "border-primary bg-muted/50" : "hover:bg-muted/10"
      )}
      onClick={() => {
        if (isSelectionMode) {
          row.toggleSelected(!isSelected);
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {isSelectionMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <CardTitle className="text-sm font-medium">
            {incident.type}
          </CardTitle>
        </div>
        <Badge variant={incident.urgencyLevel === "CRITICAL" ? "destructive" : incident.urgencyLevel === "HIGH" ? "destructive" : "outline"}>
          {incident.urgencyLevel}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          Reported on {format(new Date(incident.createdAt), "PPP")}
        </div>
        <div className="mt-2 flex justify-between items-center">
            <div className="text-sm font-semibold">
            {incident.childNameFallback || "Anonymous"}
            </div>
            <Badge variant="secondary" className="text-[10px] h-5">
                {incident.status}
            </Badge>
        </div>
        <div className="mt-2 text-xs line-clamp-2 text-muted-foreground">
            {incident.description}
        </div>
      </CardContent>
    </Card>
  );
}

