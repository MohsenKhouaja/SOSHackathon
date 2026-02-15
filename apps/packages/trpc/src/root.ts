import { router } from "./trpc";
import { programsRouter } from "./routers/program-router";
import { homesRouter } from "./routers/home-router";
import { childrenRouter } from "./routers/child-router";
import { usersRouter } from "./routers/user-router";
import { incidentsRouter } from "./routers/incident-router";
import { stepsRouter } from "./routers/steps-router";
import { statsRouter } from "./routers/stats-router";
import { notificationsRouter } from "./routers/notifications-router";
import { auditRouter } from "./routers/audit-router";
import { authRouter } from "./delivery/routers/auth-router";

export const appRouter = router({
  programs: programsRouter,
  homes: homesRouter,
  children: childrenRouter,
  users: usersRouter,
  incidents: incidentsRouter,
  steps: stepsRouter,
  stats: statsRouter,
  notifications: notificationsRouter,
  audit: auditRouter,
  delivery: router({
    auth: authRouter,
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
