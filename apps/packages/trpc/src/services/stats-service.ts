import { db } from "@repo/db";
import { program, home, child, incidentReport } from "@repo/db/tables";
import { user } from "@repo/db/tables";
import { count } from "drizzle-orm";

export const statsService = {
    getStats: async () => {
        const [
            programsCount,
            homesCount,
            childrenCount,
            usersCount,
            incidentsCount,
        ] = await Promise.all([
            db.select({ count: count() }).from(program),
            db.select({ count: count() }).from(home),
            db.select({ count: count() }).from(child),
            db.select({ count: count() }).from(user),
            db.select({ count: count() }).from(incidentReport),
        ]);

        // Group incidents by status
        const incidentsByStatus = await db
            .select({
                status: incidentReport.status,
                count: count(),
            })
            .from(incidentReport)
            .groupBy(incidentReport.status);

        // Group incidents by urgency
        const incidentsByUrgency = await db
            .select({
                urgency: incidentReport.urgencyLevel,
                count: count(),
            })
            .from(incidentReport)
            .groupBy(incidentReport.urgencyLevel);

        return {
            totalPrograms: programsCount[0]?.count ?? 0,
            totalHomes: homesCount[0]?.count ?? 0,
            totalChildren: childrenCount[0]?.count ?? 0,
            totalUsers: usersCount[0]?.count ?? 0,
            totalIncidents: incidentsCount[0]?.count ?? 0,
            incidentsByStatus: incidentsByStatus.reduce((acc, curr) => {
                acc[curr.status] = curr.count;
                return acc;
            }, {} as Record<string, number>),
            incidentsByUrgency: incidentsByUrgency.reduce((acc, curr) => {
                acc[curr.urgency] = curr.count;
                return acc;
            }, {} as Record<string, number>),
        };
    },
};
