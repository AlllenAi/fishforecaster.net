// Utility functions for data transformation and formatting.
// These are small helper functions used throughout the forecast module.

// Format a Date object to "YYYYMMDD" string (used by NOAA API)
export function formatDateForNOAA(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

// Format a Date object to "YYYY-MM-DD" string
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format a Date to "HH:MM" time string
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Parse a time string like "06:23 AM" into hours and minutes
export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return { hours: 0, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
}

// Convert Celsius to Fahrenheit
export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

// Convert meters to feet
export function metersToFeet(m: number): number {
  return m * 3.28084;
}

// Convert meters/second to knots
export function msToKnots(ms: number): number {
  return ms * 1.94384;
}

// Clamp a number between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Linear interpolation: map a value from one range to another
// Example: mapRange(15, 10, 20, 100, 40) maps 15 (halfway between 10-20) to 70 (halfway between 100-40)
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const clamped = clamp(value, inMin, inMax);
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
}

// Get today's date at midnight (useful for cache keys)
export function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Convert wind direction in degrees to compass string (e.g. 225 -> "SW")
export function degreesToCompass(degrees: number): string {
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
