import { z } from 'zod';

export const HAIR_COLORS = ['black', 'brown', 'blond', 'auburn', 'grey', 'white', 'none'] as const;
export const GENDERS = ['female', 'male', 'n/a'] as const;

/**
 * The ONE description of a valid person, shared by both forms: the React 19
 * action parses `FormData` with it, React Hook Form validates with it through
 * `zodResolver`. A rule changes here, and both forms follow.
 */
export const personSchema = z.object({
  // `.trim()` first: "   " is not a name.
  name: z.string().trim().min(1, { error: 'Name is required' }),
  // A number: React Hook Form reads it with `valueAsNumber`, the action converts
  // it the same way. An empty field becomes NaN, which `z.number()` refuses.
  height: z
    .number({ error: 'Height must be a number' })
    .int({ error: 'Height must be a whole number' })
    .min(0, { error: 'Height must be between 0 and 250' })
    .max(250, { error: 'Height must be between 0 and 250' }),
  // An empty `<select>` sends "", which is not in the list.
  hairColor: z.enum(HAIR_COLORS, { error: 'Pick a hair color' }),
  // No radio checked: the field is missing from `FormData`, or `null` in React Hook Form.
  gender: z.enum(GENDERS, { error: 'Pick a gender' }),
  birthYear: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?(BBY|ABY)$/, { error: 'Use the galactic calendar, e.g. 19BBY' }),
});

/** What the form gives the schema. */
export type PersonFormValues = z.input<typeof personSchema>;
/** What a successful parse gives: the enums are narrowed, the strings trimmed. */
export type PersonInput = z.output<typeof personSchema>;
