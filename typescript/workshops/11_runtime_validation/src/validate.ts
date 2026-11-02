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

/**
 * TODO 5: the output of `schema` for `input` — or a ValidationError holding
 * its issues. Any Standard Schema will do, and its output type is the one
 * returned.
 */
export async function validate(schema: StandardSchemaV1, input: unknown): Promise<unknown> {
  throw new ValidationError([{ message: 'TODO 5' }]);
}
