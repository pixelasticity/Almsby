"use server";

import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import {
  validatePrefix,
  nextSequentialGtin,
  hasValidCheckDigit,
} from "@/lib/gs1/allocate";
import { coerceFormString } from "@/lib/input";

export type ConciergeState =
  | { error?: string }
  | { ok: true; gtin: string; message?: string };

const MAX_ATTEMPTS = 25;

/**
 * Concierge flow (Option B): the maker has no GTIN yet, enters a GS1 company
 * prefix (obtained via GS1 US), and Almsby sequences the next product number
 * under that prefix. Writes the GTIN with `source: "almsby_assisted"` and
 * records `gs1Prefix` + `membershipStatus: "in_progress"` on the Business.
 *
 * Sequencing state is a monotonic counter on Business (`gtinSequenceLastUsed`);
 * never derived from scanning existing GTIN rows (deletion/archival would
 * corrupt it, and GS1 numbers are never reused).
 *
 * No live GS1 API (Phase-1 guardrail) — GS1 US registration is guidance-only.
 */
export async function conciergeAction(
  _prev: ConciergeState | undefined,
  formData: FormData
): Promise<ConciergeState> {
  const productId = coerceFormString(formData, "productId");
  const prefix = coerceFormString(formData, "gs1Prefix").trim();

  if (!productId) return { error: "missingProduct" };

  const prefixResult = validatePrefix(prefix);
  if (!prefixResult.ok) {
    switch (prefixResult.code) {
      case "empty":
        return { error: "prefixEmpty" };
      case "nonNumeric":
        return { error: "prefixNonNumeric" };
      default:
        return { error: "prefixInvalid" };
    }
  }

    // Auth guard: an expired session redirects to /sign-in mid-submit (#83).
  const user = await requireAuth();

  try {
    const db = getDb();

    // Ownership + concurrency-safe single unit below.
    let result: { ok: true; gtin: string } | { ok: false; error: string } =
      { ok: false, error: "saveFailed" };

    await db.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, business: { ownerId: user.id } },
        include: { business: true },
      });
      if (!product) {
        result = { ok: false, error: "productNotFound" };
        return;
      }

      // Attempt the write with bounded collision retries (P2002 on gtinValue).
      let lastUsed = product.business.gtinSequenceLastUsed;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const gtin = nextSequentialGtin(prefix, lastUsed);
        // Defensive: if the computed number isn't check-digit-valid, treat as
        // exhausted (shouldn't happen if compose is correct).
        if (!gtin || !hasValidCheckDigit(gtin)) break;

        try {
          await tx.gTIN.create({
            data: {
              productId,
              gtinValue: gtin,
              source: "almsby_assisted",
            },
          });
          await tx.business.update({
            where: { id: product.businessId },
            data: {
              gs1Prefix: prefix,
              membershipStatus: "in_progress",
              gtinSequenceLastUsed: lastUsed + 1,
            },
          });
          result = { ok: true, gtin };
          return;
        } catch (e) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
          ) {
            // Number already taken (collision) — advance and retry.
            lastUsed += 1;
            continue;
          }
          throw e;
        }
      }

      // Bounded budget exhausted: either the prefix is near capacity (real
      // business problem) or something is generating collisions abnormally
      // (bug). LOG LOUDLY — don't let this signal die in a generic message.
      console.error(
        `[concierge] exhausted ${MAX_ATTEMPTS} allocation attempts for prefix=${prefix} business=${product.businessId} lastUsed=${product.business.gtinSequenceLastUsed}`
      );
      result = { ok: false, error: "prefixExhausted" };
    });

    if (result.ok) return result;
    return { error: result.error };
  } catch (error) {
    console.error("conciergeAction failed:", user.id, productId, error);
    return { error: "saveFailed" };
  }
}