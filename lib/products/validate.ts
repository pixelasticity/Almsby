import { cleanInput, optionalInput } from "@/lib/input";

/**
 * Pure, testable validation for the Phase 1 product creation form (#2).
 * Kept free of DB/auth so it can be unit-tested like lib/gs1/*.
 */

export type ProductStatus = "draft" | "active" | "archived";

export const PRODUCT_STATUSES: readonly ProductStatus[] = [
  "draft",
  "active",
  "archived",
];

/** ProductStatus → i18n key in the `products` namespace (list + detail pages). */
export const STATUS_I18N_KEYS: Record<ProductStatus, string> = {
  draft: "statusDraft",
  active: "statusActive",
  archived: "statusArchived",
};

/** Narrow a DB status string to the ProductStatus union (DB column is raw String). */
export function isProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

/** i18n key for a status string; unknown values fall back to the "draft" copy. */
export function statusI18nKey(status: string): string {
  return isProductStatus(status) ? STATUS_I18N_KEYS[status] : "statusDraft";
}

export type ProductFormInput = {
  name: string;
  brand: string;
  netContent: string;
  countryOfOrigin: string;
  materialComposition: string;
  status: string;
};

export type NormalizedProductInput = {
  name: string;
  brand: string | null;
  netContent: string | null;
  countryOfOrigin: string | null;
  materialComposition: string | null;
  status: ProductStatus;
};

export type ProductValidation =
  | { ok: true; data: NormalizedProductInput }
  | { ok: false; error: string };

/** Validate + normalize the raw product creation form fields. */
export function validateProductInput(input: ProductFormInput): ProductValidation {
  const name = cleanInput(input.name);
  if (!name) {
    return { ok: false, error: "Product name is required." };
  }

  const status: ProductStatus = isProductStatus(input.status)
    ? input.status
    : "draft";

  return {
    ok: true,
    data: {
      name,
      brand: optionalInput(input.brand),
      netContent: optionalInput(input.netContent),
      countryOfOrigin: optionalInput(input.countryOfOrigin),
      materialComposition: optionalInput(input.materialComposition),
      status,
    },
  };
}