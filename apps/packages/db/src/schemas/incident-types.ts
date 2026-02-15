import type { db } from "../../index";
import type { incidentReport, reportAttachment } from "./incident";

export type IncidentReport = typeof incidentReport.$inferSelect;
export type IncidentReportInsert = typeof incidentReport.$inferInsert;

export type ReportAttachment = typeof reportAttachment.$inferSelect;
export type ReportAttachmentInsert = typeof reportAttachment.$inferInsert;

export type IncidentReportFindManyArgs = NonNullable<
    Parameters<typeof db.query.incidentReport.findMany>[0]
>;
export type IncidentReportFindFirstArgs = NonNullable<
    Parameters<typeof db.query.incidentReport.findFirst>[0]
>;
export type IncidentReportWithOptions = NonNullable<IncidentReportFindManyArgs["with"]>;
export type IncidentReportWhereOptions = NonNullable<IncidentReportFindManyArgs["where"]>;

export type IncidentReportQueryResult<
    TConfig extends IncidentReportWithOptions | undefined = undefined,
> = TConfig extends IncidentReportWithOptions
    ? NonNullable<
        Awaited<ReturnType<typeof db.query.incidentReport.findFirst<{ with: TConfig }>>>
    >
    : IncidentReport;
