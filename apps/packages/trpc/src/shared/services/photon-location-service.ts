/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import { logger } from "@repo/logger";
import { env } from "@repo/trpc/env";
import type { Location } from "@repo/validators";
import { TRPCError } from "@trpc/server";

type PhotonFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name?: string;
    country?: string;
    countrycode?: string;
    state?: string;
    city?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    county?: string;
    neighbourhood?: string;
    osm_type?: string;
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
    extent?: [number, number, number, number];
  };
};

type PhotonResponse = {
  type: "FeatureCollection";
  features: PhotonFeature[];
};

export class PhotonLocationService {
  private readonly photonBaseUrl: string;

  constructor() {
    // Use environment variable or default to your photon container URL
    this.photonBaseUrl = env.PHOTON_BASE_URL || "http://localhost:2322";
  }

  /**
   * Search for locations using Photon geocoder
   */
  async searchLocations(
    query: string,
    limit = 10
  ): Promise<Omit<Location, "createdAt" | "updatedAt">[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const searchParams = new URLSearchParams({
        q: query.trim(),
        limit: limit.toString(),
        lang: "fr", // You can make this configurable
      });

      const response = await fetch(`${this.photonBaseUrl}/api?${searchParams}`);

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Photon geocoder error: ${response.status} ${response.statusText}`,
        });
      }

      const data: PhotonResponse = (await response.json()) as PhotonResponse;

      return data.features.map((feature) =>
        this.transformPhotonFeature(feature)
      );
    } catch (error) {
      logger.error("Photon search error:", error);
      console.error("Photon search error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to search locations",
      });
    }
  }

  /**
   * Reverse geocode coordinates to get location information
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<Omit<Location, "createdAt" | "updatedAt"> | null> {
    try {
      const searchParams = new URLSearchParams({
        lon: longitude.toString(),
        lat: latitude.toString(),
        radius: "1", // 1km radius
      });

      const response = await fetch(
        `${this.photonBaseUrl}/reverse?${searchParams}`
      );

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Photon reverse geocoding error: ${response.status} ${response.statusText}`,
        });
      }

      const data: PhotonResponse = (await response.json()) as PhotonResponse;

      if (data.features.length === 0) {
        return null;
      }

      return this.transformPhotonFeature(data.features[0]!);
    } catch (error) {
      console.error("Photon reverse geocode error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to reverse geocode location",
      });
    }
  }

  /**
   * Get location by its coordinates (used for "findOne" when we have stored coordinates)
   */
  async getLocationByCoordinates(
    latitude: number,
    longitude: number
  ): Promise<Omit<Location, "createdAt" | "updatedAt">> {
    const location = await this.reverseGeocode(latitude, longitude);

    if (!location) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Location not found",
      });
    }

    return location;
  }

  /**
   * Transform Photon feature to our location format
   */
  private transformPhotonFeature(
    feature: PhotonFeature
  ): Omit<Location, "createdAt" | "updatedAt"> {
    const { properties, geometry } = feature;
    const [longitude, latitude] = geometry.coordinates;

    // Create a unique ID based on OSM data or coordinates
    const id = properties.osm_id
      ? `${properties.osm_type}-${properties.osm_id}`
      : `coord-${latitude}-${longitude}`;

    // Create a display name that's more descriptive than just the name
    const displayName = this.createDisplayName(properties);

    return {
      id,
      name: properties.name || displayName,
      displayName,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      deletedAt: null,
      osmType: properties.osm_type || null,
      osmId: properties.osm_id || null,
      osmKey: properties.osm_key || null,
      osmValue: properties.osm_value || null,
      country: properties.country || null,
      countryCode: properties.countrycode?.toLowerCase() || null,
      state: properties.state || null,
      city: properties.city || null,
      postcode: properties.postcode || null,
      street: properties.street || null,
      housenumber: properties.housenumber || null,
      district: properties.district || null,
      county: properties.county || null,
      neighbourhood: properties.neighbourhood || null,
    };
  }

  /**
   * Create a human-readable display name for the location
   */
  private createDisplayName(properties: PhotonFeature["properties"]): string {
    const parts: string[] = [];

    if (properties.name) {
      parts.push(properties.name);
    }

    if (properties.street && properties.housenumber) {
      parts.push(`${properties.housenumber} ${properties.street}`);
    } else if (properties.street) {
      parts.push(properties.street);
    }

    if (properties.city && properties.city !== properties.name) {
      parts.push(properties.city);
    }

    if (
      properties.state &&
      properties.state !== properties.city &&
      properties.state !== properties.name
    ) {
      parts.push(properties.state);
    }

    if (properties.country && properties.country !== properties.state) {
      parts.push(properties.country);
    }

    return parts.length > 0 ? parts.join(", ") : "Unknown location";
  }
}

export const photonLocationService = new PhotonLocationService();
