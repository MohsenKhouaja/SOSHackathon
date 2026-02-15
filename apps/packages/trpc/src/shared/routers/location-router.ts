import { db } from "@repo/db";
import { loggingMiddleware, protectedProcedure, router } from "@repo/trpc/trpc";
import { locationValidators } from "@repo/validators";
import z from "zod";
import { locationService } from "../services/location-service";

export const locationRouter = router({
  // Search locations using Photon geocoder
  searchLocations: protectedProcedure()
    .use(loggingMiddleware("Search locations via Photon"))
    .input(
      z.object({
        search: z.string().min(1, "Search query is required"),
      })
    )
    .output(locationValidators.searchLocations)
    .query(async ({ input }) => locationService.searchLocations(input.search)),

  // Reverse geocode coordinates to get location
  reverseGeocode: protectedProcedure()
    .use(loggingMiddleware("Reverse geocode location"))
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .output(
      locationValidators.findOneOutput
        .omit({
          createdAt: true,
          updatedAt: true,
        })
        .nullable()
    )
    .query(async ({ input }) =>
      locationService.reverseGeocode(input.latitude, input.longitude)
    ),

  // Get a specific location (either stored or from Photon)
  findOne: protectedProcedure()
    .use(loggingMiddleware("Get location"))
    .input(
      z.object({
        id: z.string().min(1, "Location ID is required"),
      })
    )
    .output(
      locationValidators.findOneOutput.omit({
        createdAt: true,
        updatedAt: true,
      })
    )
    .query(async ({ input }) => locationService.findOne(db, input.id)),

  // Store a selected location for future reference
  storeLocation: protectedProcedure()
    .use(loggingMiddleware("Store selected location"))
    .input(locationValidators.createInput)
    .output(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const storedId = await locationService.storeLocation(db, input);
      return { id: storedId };
    }),

  // Legacy route for backward compatibility - now just calls searchLocations
  findMany: protectedProcedure()
    .use(loggingMiddleware("Search locations (legacy)"))
    .input(
      z.object({
        search: z.string().optional(),
      })
    )
    .output(
      z.array(
        locationValidators.findOneOutput.omit({
          createdAt: true,
          updatedAt: true,
        })
      )
    )
    .query(async ({ input }) => locationService.findMany(input.search)),
});
