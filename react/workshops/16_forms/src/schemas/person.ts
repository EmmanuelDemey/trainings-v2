import { z } from 'zod';

export const HAIR_COLORS = ['black', 'brown', 'blond', 'auburn', 'grey', 'white', 'none'] as const;
export const GENDERS = ['female', 'male', 'n/a'] as const;

/**
 * The ONE description of a valid person, shared by both forms: the React 19
 * action parses `FormData` with it (step 2), React Hook Form validates with it
 * through `zodResolver` (step 3).

 */
export const personSchema = z.object({
  // Done for you — the model for the others: `.trim()` first, "   " is not a name.
  name: z.string().trim().min(1, { error: 'Name is required' }),
  // TODO 1.1: a number ('Height must be a number' — NaN, what an empty number field
  // gives, must be refused too), whole ('Height must be a whole number') and
  // between 0 and 250 ('Height must be between 0 and 250').
  height: z.number(),
  // TODO 1.2: one of HAIR_COLORS ('Pick a hair color').
  hairColor: z.string(),
  // TODO 1.2: one of GENDERS ('Pick a gender') — even when the field is missing.
  gender: z.string(),
  // TODO 1.3: the galactic calendar — 19BBY, 41.9BBY, 4ABY
  // ('Use the galactic calendar, e.g. 19BBY').
  birthYear: z.string(),
});

/** What the form gives the schema. */
export type PersonFormValues = z.input<typeof personSchema>;
/** What a successful parse gives — once step 1 is done, the enums are narrowed. */
export type PersonInput = z.output<typeof personSchema>;
