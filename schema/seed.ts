// ─── Database Seed Script ───────────────────────────────────
//
// Run this with: yarn db:seed
//
// This loads all fishing zones (saltwater + freshwater) into
// your MongoDB database. It uses "upsert" which means:
//   - If the zone doesn't exist → create it
//   - If it already exists (same slug) → update it
// So it's safe to run multiple times without creating duplicates.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ZONES = [
  // ─── Saltwater Zones ────────────────────────────────────
  {
    name: "San Diego Offshore",
    slug: "san-diego-offshore",
    waterType: "SALT" as const,
    lat: 32.65,
    lon: -117.3,
    radiusMiles: 20,
    tideStationId: "9410170",
    ndbcBuoyId: "46232",
    species: ["Bluefin Tuna", "Yellowfin Tuna", "Yellowtail", "Calico Bass"],
  },
  {
    name: "Oceanside",
    slug: "oceanside",
    waterType: "SALT" as const,
    lat: 33.22,
    lon: -117.5,
    radiusMiles: 15,
    tideStationId: "9410580",
    ndbcBuoyId: "46224",
    species: ["Yellowtail", "Calico Bass", "White Seabass", "Halibut"],
  },
  {
    name: "Dana Point",
    slug: "dana-point",
    waterType: "SALT" as const,
    lat: 33.46,
    lon: -117.72,
    radiusMiles: 15,
    tideStationId: "9410580",
    ndbcBuoyId: "46223",
    species: ["Yellowtail", "Calico Bass", "White Seabass", "Halibut"],
  },
  {
    name: "Catalina Channel",
    slug: "catalina-channel",
    waterType: "SALT" as const,
    lat: 33.38,
    lon: -118.42,
    radiusMiles: 25,
    tideStationId: "9410079",
    ndbcBuoyId: "46223",
    species: ["Bluefin Tuna", "Yellowfin Tuna", "Yellowtail", "White Seabass"],
  },
  {
    name: "San Clemente Basin",
    slug: "san-clemente-basin",
    waterType: "SALT" as const,
    lat: 32.7,
    lon: -118.4,
    radiusMiles: 25,
    tideStationId: "9410079",
    ndbcBuoyId: "46086",
    species: ["Bluefin Tuna", "Yellowfin Tuna", "Albacore", "Yellowtail"],
  },
  {
    name: "Channel Islands",
    slug: "channel-islands",
    waterType: "SALT" as const,
    lat: 34.02,
    lon: -119.5,
    radiusMiles: 20,
    tideStationId: "9411399",
    ndbcBuoyId: "46053",
    species: ["White Seabass", "Yellowtail", "Calico Bass", "Halibut"],
  },
  {
    name: "Ventura Offshore",
    slug: "ventura-offshore",
    waterType: "SALT" as const,
    lat: 34.25,
    lon: -119.35,
    radiusMiles: 15,
    tideStationId: "9411399",
    ndbcBuoyId: "46053",
    species: ["White Seabass", "Yellowtail", "Halibut"],
  },
  {
    name: "Santa Barbara Offshore",
    slug: "santa-barbara-offshore",
    waterType: "SALT" as const,
    lat: 34.45,
    lon: -119.85,
    radiusMiles: 15,
    tideStationId: "9411340",
    ndbcBuoyId: "46054",
    species: ["White Seabass", "Halibut", "Calico Bass"],
  },

  // ─── Central California Saltwater ──────────────────────
  {
    name: "Morro Bay",
    slug: "morro-bay",
    waterType: "SALT" as const,
    lat: 35.37,
    lon: -120.87,
    radiusMiles: 15,
    tideStationId: "9412110",
    ndbcBuoyId: "46215",
    species: ["Rockfish", "Lingcod", "Halibut", "White Seabass"],
  },
  {
    name: "Monterey Bay",
    slug: "monterey-bay",
    waterType: "SALT" as const,
    lat: 36.6,
    lon: -122.0,
    radiusMiles: 20,
    tideStationId: "9413450",
    ndbcBuoyId: "46042",
    species: ["Chinook Salmon", "Rockfish", "Lingcod", "Halibut", "Albacore"],
  },
  {
    name: "Santa Cruz",
    slug: "santa-cruz",
    waterType: "SALT" as const,
    lat: 36.95,
    lon: -122.02,
    radiusMiles: 15,
    tideStationId: "9413745",
    ndbcBuoyId: "46240",
    species: ["Rockfish", "Lingcod", "Chinook Salmon", "Pacific Mackerel"],
  },

  // ─── Northern California Saltwater ────────────────────
  {
    name: "San Francisco Bay",
    slug: "san-francisco-bay",
    waterType: "SALT" as const,
    lat: 37.78,
    lon: -122.48,
    radiusMiles: 15,
    tideStationId: "9414290",
    ndbcBuoyId: "46026",
    species: ["Striped Bass", "Halibut", "Chinook Salmon", "Rockfish"],
  },
  {
    name: "Bodega Bay",
    slug: "bodega-bay",
    waterType: "SALT" as const,
    lat: 38.33,
    lon: -123.05,
    radiusMiles: 15,
    tideStationId: "9415020",
    ndbcBuoyId: "46013",
    species: ["Chinook Salmon", "Rockfish", "Lingcod", "Dungeness Crab"],
  },
  {
    name: "Fort Bragg Offshore",
    slug: "fort-bragg-offshore",
    waterType: "SALT" as const,
    lat: 39.45,
    lon: -123.82,
    radiusMiles: 20,
    tideStationId: "9416841",
    ndbcBuoyId: "46014",
    species: ["Chinook Salmon", "Rockfish", "Lingcod", "Albacore"],
  },
  {
    name: "Eureka Offshore",
    slug: "eureka-offshore",
    waterType: "SALT" as const,
    lat: 40.77,
    lon: -124.25,
    radiusMiles: 20,
    tideStationId: "9418767",
    ndbcBuoyId: "46022",
    species: ["Chinook Salmon", "Rockfish", "Lingcod", "Dungeness Crab"],
  },

  // ─── Baja Mexico Saltwater ────────────────────────────
  // (No NOAA tide/buoy data — weather-only forecasts, lower confidence)
  {
    name: "Ensenada",
    slug: "ensenada",
    waterType: "SALT" as const,
    lat: 31.85,
    lon: -116.63,
    radiusMiles: 20,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Yellowtail", "Calico Bass", "White Seabass", "Halibut"],
  },
  {
    name: "Cabo San Lucas",
    slug: "cabo-san-lucas",
    waterType: "SALT" as const,
    lat: 22.89,
    lon: -109.92,
    radiusMiles: 25,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Dorado", "Yellowfin Tuna", "Wahoo", "Roosterfish"],
  },
  {
    name: "East Cape Baja",
    slug: "east-cape-baja",
    waterType: "SALT" as const,
    lat: 23.38,
    lon: -109.43,
    radiusMiles: 20,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Dorado", "Roosterfish", "Yellowfin Tuna", "Wahoo"],
  },

  // ─── Freshwater Zones — Southern California ───────────
  {
    name: "Lake Hodges",
    slug: "lake-hodges",
    waterType: "FRESH" as const,
    lat: 33.083,
    lon: -117.11,
    radiusMiles: 5,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Largemouth Bass", "Catfish", "Crappie", "Bluegill", "Carp"],
  },
  {
    name: "Lake Cuyamaca",
    slug: "lake-cuyamaca",
    waterType: "FRESH" as const,
    lat: 32.978,
    lon: -116.578,
    radiusMiles: 5,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Rainbow Trout", "Largemouth Bass", "Catfish", "Bluegill"],
  },
  {
    name: "Lake Hemet",
    slug: "lake-hemet",
    waterType: "FRESH" as const,
    lat: 33.655,
    lon: -116.71,
    radiusMiles: 5,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Largemouth Bass", "Catfish", "Crappie", "Bluegill"],
  },
  {
    name: "Lake Perris",
    slug: "lake-perris",
    waterType: "FRESH" as const,
    lat: 33.85,
    lon: -117.17,
    radiusMiles: 5,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Bass", "Trout", "Catfish", "Bluegill", "Carp"],
  },
  {
    name: "Diamond Valley Lake",
    slug: "diamond-valley-lake",
    waterType: "FRESH" as const,
    lat: 33.69,
    lon: -117.0,
    radiusMiles: 5,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Bass", "Trout", "Catfish", "Bluegill"],
  },
  {
    name: "Lake Skinner",
    slug: "lake-skinner",
    waterType: "FRESH" as const,
    lat: 33.6,
    lon: -117.04,
    radiusMiles: 5,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Bass", "Trout", "Catfish", "Crappie", "Bluegill"],
  },
  {
    name: "Castaic Lake",
    slug: "castaic-lake",
    waterType: "FRESH" as const,
    lat: 34.54,
    lon: -118.63,
    radiusMiles: 5,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Bass", "Trout", "Catfish", "Bluegill", "Crappie"],
  },
  {
    name: "Silverwood Lake",
    slug: "silverwood-lake",
    waterType: "FRESH" as const,
    lat: 34.3,
    lon: -117.33,
    radiusMiles: 5,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Trout", "Bass", "Catfish", "Crappie", "Bluegill"],
  },

  // ─── Freshwater Zones — Central/Northern California ───
  {
    name: "Clear Lake",
    slug: "clear-lake",
    waterType: "FRESH" as const,
    lat: 39.02,
    lon: -122.78,
    radiusMiles: 10,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Largemouth Bass", "Catfish", "Crappie", "Bluegill", "Carp"],
  },
  {
    name: "Lake Berryessa",
    slug: "lake-berryessa",
    waterType: "FRESH" as const,
    lat: 38.6,
    lon: -122.23,
    radiusMiles: 8,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Largemouth Bass", "Smallmouth Bass", "Rainbow Trout", "Catfish", "Kokanee"],
  },
  {
    name: "Lake Shasta",
    slug: "lake-shasta",
    waterType: "FRESH" as const,
    lat: 40.78,
    lon: -122.35,
    radiusMiles: 15,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Rainbow Trout", "Largemouth Bass", "Smallmouth Bass", "Catfish", "Crappie"],
  },
  {
    name: "Lake Oroville",
    slug: "lake-oroville",
    waterType: "FRESH" as const,
    lat: 39.55,
    lon: -121.47,
    radiusMiles: 10,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Largemouth Bass", "Smallmouth Bass", "Rainbow Trout", "Chinook Salmon", "Catfish"],
  },
  {
    name: "Don Pedro Reservoir",
    slug: "don-pedro-reservoir",
    waterType: "FRESH" as const,
    lat: 37.71,
    lon: -120.42,
    radiusMiles: 8,
    tideStationId: null,
    ndbcBuoyId: null,
    species: ["Largemouth Bass", "Kokanee", "Rainbow Trout", "Catfish", "Crappie"],
  },
];

async function seed() {
  // eslint-disable-next-line no-console
  console.log("Seeding zones...\n");

  for (const zone of ZONES) {
    const result = await prisma.zone.upsert({
      where: { slug: zone.slug },
      update: {
        name: zone.name,
        waterType: zone.waterType,
        lat: zone.lat,
        lon: zone.lon,
        radiusMiles: zone.radiusMiles,
        tideStationId: zone.tideStationId,
        ndbcBuoyId: zone.ndbcBuoyId,
        species: zone.species,
        isActive: true,
      },
      create: {
        name: zone.name,
        slug: zone.slug,
        waterType: zone.waterType,
        lat: zone.lat,
        lon: zone.lon,
        radiusMiles: zone.radiusMiles,
        tideStationId: zone.tideStationId,
        ndbcBuoyId: zone.ndbcBuoyId,
        species: zone.species,
        isActive: true,
      },
    });

    // eslint-disable-next-line no-console
    console.log(`  ✓ ${result.name} (${result.waterType})`);
  }

  // eslint-disable-next-line no-console
  console.log(`\nDone! Seeded ${ZONES.length} zones.`);
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
