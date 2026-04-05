import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ──────────────────────────────────────────
const { mockActivateSubscription, mockConstructEvent } = vi.hoisted(() => ({
  mockActivateSubscription: vi.fn(),
  mockConstructEvent: vi.fn(),
}));

vi.mock("@/modules/subscription/services/subscriptionService", () => ({
  activateSubscription: mockActivateSubscription,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  },
}));

import { POST } from "@/app/api/webhooks/stripe/route";
import { NextRequest } from "next/server";

// ─── Helpers ────────────────────────────────────────────────

function makeRequest(body: string, signature: string | null): NextRequest {
  const headers = new Headers();
  if (signature) headers.set("stripe-signature", signature);
  return new NextRequest("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    body,
    headers,
  });
}

function makeCheckoutEvent(
  metadata: Record<string, string>,
  overrides?: Record<string, string>
) {
  return {
    id: "evt_test_123",
    type: "checkout.session.completed",
    data: {
      object: {
        metadata,
        customer: overrides?.customer ?? "cus_abc",
        payment_intent: overrides?.payment_intent ?? "pi_abc",
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
});

// ─── Tests ──────────────────────────────────────────────────

describe("Stripe Webhook POST", () => {
  it("returns 400 when signature header is missing", async () => {
    const res = await POST(makeRequest("body", null));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Missing signature");
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await POST(makeRequest("body", "bad_sig"));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Invalid signature");
  });

  it("activates subscription on checkout.session.completed", async () => {
    const event = makeCheckoutEvent({
      userId: "user_123",
      plan: "ALL_ACCESS",
    });
    mockConstructEvent.mockReturnValue(event);
    mockActivateSubscription.mockResolvedValue(undefined);

    const res = await POST(makeRequest("body", "valid_sig"));
    expect(res.status).toBe(200);

    expect(mockActivateSubscription).toHaveBeenCalledWith(
      "user_123",
      "ALL_ACCESS",
      "pi_abc",
      "cus_abc"
    );
  });

  it("returns 400 when metadata is missing userId", async () => {
    const event = makeCheckoutEvent({ plan: "FRESHWATER" });
    mockConstructEvent.mockReturnValue(event);

    const res = await POST(makeRequest("body", "valid_sig"));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Missing metadata");
  });

  it("returns 400 when metadata is missing plan", async () => {
    const event = makeCheckoutEvent({ userId: "user_123" });
    mockConstructEvent.mockReturnValue(event);

    const res = await POST(makeRequest("body", "valid_sig"));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Missing metadata");
  });

  it("returns 200 for unhandled event types", async () => {
    mockConstructEvent.mockReturnValue({
      id: "evt_test_456",
      type: "payment_intent.created",
      data: { object: {} },
    });

    const res = await POST(makeRequest("body", "valid_sig"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it("returns 200 when activateSubscription throws to prevent Stripe retries", async () => {
    const event = makeCheckoutEvent({
      userId: "user_123",
      plan: "SALTWATER",
    });
    mockConstructEvent.mockReturnValue(event);
    mockActivateSubscription.mockRejectedValue(new Error("DB down"));

    const res = await POST(makeRequest("body", "valid_sig"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it("handles non-string customer and payment_intent gracefully", async () => {
    const event = {
      id: "evt_test_789",
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user_123", plan: "FRESHWATER" },
          customer: { id: "cus_expanded" },
          payment_intent: null,
        },
      },
    };
    mockConstructEvent.mockReturnValue(event);
    mockActivateSubscription.mockResolvedValue(undefined);

    const res = await POST(makeRequest("body", "valid_sig"));
    expect(res.status).toBe(200);

    expect(mockActivateSubscription).toHaveBeenCalledWith(
      "user_123",
      "FRESHWATER",
      "",
      ""
    );
  });
});
