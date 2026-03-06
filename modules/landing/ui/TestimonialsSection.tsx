"use client";

const testimonials = [
  {
    quote:
      "I used to check five different apps before heading out. Now I just check my bite score and go.",
    name: "Mike R.",
    detail: "Yellowtail, Dana Point",
  },
  {
    quote:
      "The bite windows are scary accurate. Hit the water at 5:45 AM exactly and limited out by 8.",
    name: "Sarah K.",
    detail: "Bass, Lake Perris",
  },
  {
    quote:
      "Finally, something that actually combines tides, swell, AND moon data in one place.",
    name: "Carlos D.",
    detail: "Bluefin, San Diego Offshore",
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          What Anglers Are <span className="text-primary">Saying</span>
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border bg-card p-6"
            >
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
