/** biome-ignore-all lint/suspicious/noConsole: yes */
import type { DBContext } from "@repo/db";
import { locations } from "@repo/db/schema";
import type { CreateLocationInput, Location } from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { v4 as uuid } from "uuid";
import { photonLocationService } from "./photon-location-service";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PHOTON_ID_REGEX = /^[A-Z]-\d+$/;

/**
 * Search locations using Photon geocoder
 */
export async function searchLocations(
  search?: string
): Promise<Omit<Location, "createdAt" | "updatedAt">[]> {
  if (!search || search.trim().length < 2) {
    return [];
  }

  return await photonLocationService.searchLocations(search, 10);
}

/**
 * Reverse geocode coordinates to get location information
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<Omit<Location, "createdAt" | "updatedAt"> | null> {
  return await photonLocationService.reverseGeocode(latitude, longitude);
}

/**
 * Find a stored location by ID, or get location by coordinates from Photon
 */
export async function findOne(
  db: DBContext,
  id: string
): Promise<Omit<Location, "createdAt" | "updatedAt">> {
  // Check if the ID is a valid UUID format
  const isUUID = UUID_REGEX.test(id);

  // If it's a UUID, try to find in our stored locations
  if (isUUID) {
    const storedLocation = await db.query.locations.findFirst({
      // where: eq(locations.id, id),
      where: {
        id,
      },
    });

    if (storedLocation) {
      return storedLocation;
    }
  }

  // If not found in storage, try to parse coordinates from ID and reverse geocode
  if (id.startsWith("coord-")) {
    const coords = id.replace("coord-", "").split("-");
    if (coords.length === 2) {
      const latitude = Number.parseFloat(coords[0]!);
      const longitude = Number.parseFloat(coords[1]!);

      if (!(Number.isNaN(latitude) || Number.isNaN(longitude))) {
        return await photonLocationService.getLocationByCoordinates(
          latitude,
          longitude
        );
      }
    }
  }

  // If it's a Photon-based ID (like "N-9936236600"), we cannot resolve it directly
  // The frontend should use the stored UUID returned by storeLocation
  if (id.match(PHOTON_ID_REGEX)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Photon-based location IDs are not directly retrievable. Please use the stored location UUID instead.",
    });
  }

  // If it's an unrecognized ID format, return not found
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Location not found",
  });
}

/**
 * Store a location when user selects it
 */
export async function storeLocation(
  db: DBContext,
  photonLocation: CreateLocationInput
): Promise<string> {
  // Check if we already have this location stored
  // Use a combination of name and coordinates for better matching
  const existingLocation = await db.query.locations.findFirst({
    where: {
      name: photonLocation.name,
      latitude: photonLocation.latitude.toString(),
      longitude: photonLocation.longitude.toString(),
    },
  });

  if (existingLocation) {
    return existingLocation.id;
  }

  // Store the new location
  const locationId = uuid();
  const [insertedLocation] = await db
    .insert(locations)
    .values({
      id: locationId,
      name: photonLocation.name,
      displayName: photonLocation.displayName,
      latitude: photonLocation.latitude.toString(),
      longitude: photonLocation.longitude.toString(),
      osmType: photonLocation.osmType,
      osmId: photonLocation.osmId,
      osmKey: photonLocation.osmKey,
      osmValue: photonLocation.osmValue,
      country: photonLocation.country,
      countryCode: photonLocation.countryCode,
      state: photonLocation.state,
      city: photonLocation.city,
      postcode: photonLocation.postcode,
      street: photonLocation.street,
      housenumber: photonLocation.housenumber,
      district: photonLocation.district,
      county: photonLocation.county,
      neighbourhood: photonLocation.neighbourhood,
    })
    .returning();

  if (!insertedLocation) {
    console.error("Failed to insert location:", photonLocation);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to insert location",
    });
  }

  return insertedLocation.id;
}

// Legacy methods for backward compatibility
export async function findMany(
  search?: string
): Promise<Omit<Location, "createdAt" | "updatedAt">[]> {
  return await searchLocations(search);
}

export async function locationExists(
  db: DBContext,
  id: string
): Promise<boolean> {
  try {
    const exists = await db.query.locations.findFirst({
      columns: { id: true },
      where: {
        id,
      },
    });
    return !!exists;
  } catch (error) {
    console.error("Error checking location existence:", error);
    return false;
  }
}

export const locationService = {
  searchLocations,
  reverseGeocode,
  findOne,
  storeLocation,
  locationExists,
  findMany,
};
