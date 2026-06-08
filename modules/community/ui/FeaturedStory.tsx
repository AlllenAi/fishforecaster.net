"use client";

export function FeaturedStory() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          Featured Story
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 items-start">
        <div className="space-y-3">
          <blockquote className="text-base leading-relaxed text-foreground">
            &ldquo;The Fish Forecaster is the only app I use now that I can find all my
            favorite spots to fish. Finally an app that works well and gives up to
            the minute information on all of the details necessary to make my
            decision as to when and where to fish. Thanks Fish Forecaster.&rdquo;
          </blockquote>
          <p className="text-sm font-semibold text-muted-foreground">
            — Capt. Ron, San Diego
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border bg-black">
          <video
            src="/capt-ron-story.mov"
            controls
            playsInline
            className="w-full max-h-64 object-contain"
          />
        </div>
      </div>
    </div>
  );
}
