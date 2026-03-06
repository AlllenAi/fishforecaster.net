// ─── Database Seed Script ───────────────────────────────────
//
// Run this with: yarn db:seed
//
// This loads all 13 fishing zones (8 saltwater, 5 freshwater) into
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

  // ─── Freshwater Zones ───────────────────────────────────
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
];

async function seed() {
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

    console.log(`  ✓ ${result.name} (${result.waterType})`);
  }

  console.log(`\nDone! Seeded ${ZONES.length} zones.`);
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
