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

const clean = (value: string | null | undefined): string =>
  value?.trim() ?? "";

const optionalString = (value: string | null | undefined): string | null => {
  const v = clean(value);
  return v.length > 0 ? v : null;
};

/** Validate + normalize the raw product creation form fields. */
export function validateProductInput(input: ProductFormInput): ProductValidation {
  const name = clean(input.name);
  if (!name) {
    return { ok: false, error: "Product name is required." };
  }

  const status: ProductStatus = PRODUCT_STATUSES.some(
    (s) => s === input.status
  )
    ? (input.status as ProductStatus)
    : "draft";

  return {
    ok: true,
    data: {
      name,
      brand: optionalString(input.brand),
      netContent: optionalString(input.netContent),
      countryOfOrigin: optionalString(input.countryOfOrigin),
      materialComposition: optionalString(input.materialComposition),
      status,
    },
  };
}