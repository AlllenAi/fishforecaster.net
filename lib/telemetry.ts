export function trackAuthEvent(event: string, payload?: Record<string, unknown>) {
  // Platform-instrumentation placeholder (swap for Segment/Snowplow/GA in prod)
  console.log(`[Telemetry] auth event: ${event}`, payload);
}

export function setSentryBreadcrumb(message: string, data?: Record<string, unknown>) {
  // Synthesizes a breadcrumb; if Sentry is installed this can be wired up.
  console.log(`[Sentry] breadcrumb: ${message}`, data);
}
