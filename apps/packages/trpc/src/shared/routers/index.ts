import { router } from "@repo/trpc/trpc";
import { locationRouter } from "./location-router";

export const sharedRouters = router({
  locations: locationRouter,
});
