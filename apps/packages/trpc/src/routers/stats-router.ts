import { publicProcedure, router } from "../trpc";
import { statsService } from "../services/stats-service";

export const statsRouter = router({
    get: publicProcedure.query(async () => {
        return statsService.getStats();
    }),
});
