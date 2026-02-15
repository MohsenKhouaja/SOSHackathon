import { db } from "@repo/db";
import { auditValidators } from "@repo/validators";
import { loggingMiddleware, protectedProcedure, router } from "../trpc";
import * as auditService from "../services/audit-service";

export const auditRouter = router({
    findMany: protectedProcedure()
        .use(loggingMiddleware("Fetching audit logs"))
        .input(auditValidators.findInput)
        .query(({ input, ctx }) =>
            auditService.findMany(db, ctx.user!, input)
        ),
});
