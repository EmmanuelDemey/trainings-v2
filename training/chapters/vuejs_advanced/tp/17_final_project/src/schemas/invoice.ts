import { z } from 'zod';
import type { NewInvoice } from '@/api/fakeApi';

/**
 * STEP 5 — the schema is the specification of the form.
 *
 * The rules the business gave you:
 *  - `number`: `INV-` followed by exactly four digits
 *  - `customer`: 2 to 60 characters, trimmed
 *  - `amount`: strictly positive, at most two decimals, at most 1 000 000
 *  - `dueDate`: a real `YYYY-MM-DD` date, today or later
 *
 * TODO 5.1: write the schema. The input of a form field is a STRING — decide
 *   deliberately whether the schema coerces (`z.coerce.number()`) or whether the
 *   component converts before validating, and be able to defend the choice in
 *   the review.
 *
 * TODO 5.2: keep the inferred type aligned with `NewInvoice`. The assertion
 *   below stops compiling the day the schema and the API stop agreeing (make
 *   `amount` a string and watch `npm run typecheck` fail) — keep it.
 */
export const invoiceSchema = z.object({
  number: z.string(),
  customer: z.string(),
  amount: z.number(),
  dueDate: z.string(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

// Compile-time proof that the schema and the API agree on the payload.
type Extends<T extends U, U> = T;
export type _SchemaMatchesApi = Extends<InvoiceInput, NewInvoice>;

/**
 * Turns a `ZodError` into `{ field: message }`, keeping the FIRST message per
 * field — a field with three messages under it is three times less readable.
 *
 * TODO 5.3: implement it (`error.issues`, `issue.path[0]`, `issue.message`).
 */
export function toFieldErrors(error: z.ZodError): Partial<Record<keyof InvoiceInput, string>> {
  void error;
  return {};
}
