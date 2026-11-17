// Validation that works with any library implementing Standard Schema: Zod, Valibot, ArkType…
import type { StandardSchemaV1 } from '@standard-schema/spec';

export class ValidationError extends Error {
  readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;

  constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    super(issues.map((issue) => issue.message).join(', '));
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

/** The output of `schema` for `input` — or a ValidationError holding its issues. */
export async function validate<S extends StandardSchemaV1>(
  schema: S,
  input: unknown,
): Promise<StandardSchemaV1.InferOutput<S>> {
  const result = await schema['~standard'].validate(input);
  if (result.issues) throw new ValidationError(result.issues);
  return result.value;
}
