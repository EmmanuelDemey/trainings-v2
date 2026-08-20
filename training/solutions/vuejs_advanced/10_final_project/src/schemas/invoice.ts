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
 * The `string` → `number` decision, and why it is made HERE:
 *
 * An `<input>` always holds a string. Two places can convert it: the component
 * (`Number(form.amount)` before validating) or the schema (`z.coerce.number()`).
 * This schema coerces, for one reason — it keeps the conversion rule in the same
 * file as the validation rule. If `amount` ever becomes "accept a comma as a
 * decimal separator", that lives next to "at most two decimals" rather than in a
 * component nobody thinks to look at. The cost is that `z.input` and `z.output`
 * differ, so `safeParse(form)` takes strings and `result.data` hands back a
 * number — which is exactly what the API wants, and exactly why the submit must
 * send `result.data` and never `form`.
 */
export const invoiceSchema = z.object({
  number: z.string().regex(/^INV-\d{4}$/, 'Expected the format INV-1234'),

  customer: z
    .string()
    .trim()
    .min(2, 'At least 2 characters')
    .max(60, 'At most 60 characters'),

  amount: z
    .string()
    .min(1, 'An amount is required')
    .pipe(
      z.coerce
        .number({ message: 'Enter a number' })
        .positive('The amount must be greater than 0')
        .max(1_000_000, 'At most 1 000 000 €')
        .refine((value) => Number.isInteger(Math.round(value * 100)) && (value * 100) % 1 === 0, {
          message: 'At most two decimals',
        }),
    ),

  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected the format YYYY-MM-DD')
    // A regex is not a calendar: `2026-02-31` matches it. Round-tripping through
    // `Date` is what rejects the days that do not exist.
    .refine((value) => {
      const parsed = new Date(`${value}T00:00:00`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }, 'This date does not exist')
    .refine((value) => value >= new Date().toISOString().slice(0, 10), 'The due date is in the past'),
});

/** What the form holds: `amount` is still the string the input gave us. */
export type InvoiceFormValues = z.input<typeof invoiceSchema>;

/** What the parse produced — this is what you send to the API. */
export type InvoiceInput = z.output<typeof invoiceSchema>;

// Compile-time proof that the schema and the API agree on the payload. Make
// `amount` a string and `npm run typecheck` fails — keep it.
type Extends<T extends U, U> = T;
export type _SchemaMatchesApi = Extends<InvoiceInput, NewInvoice>;

/**
 * Turns a `ZodError` into `{ field: message }`, keeping the FIRST message per
 * field — a field with three messages under it is three times less readable,
 * and the user can only fix one thing at a time anyway.
 */
export function toFieldErrors(error: z.ZodError): Partial<Record<keyof InvoiceInput, string>> {
  const fieldErrors: Partial<Record<keyof InvoiceInput, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as keyof InvoiceInput | undefined;
    // An issue with an empty path came from an object-level `.refine()`: it
    // belongs to the form, not to a field. Dropping it here means the caller
    // must handle it — hence the `serverError`-style banner in the view.
    if (field === undefined) continue;
    if (fieldErrors[field] === undefined) fieldErrors[field] = issue.message;
  }

  return fieldErrors;
}
