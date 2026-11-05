import { BadRequestException } from '@nestjs/common';
import type { NewIssue } from './issue.model.js';

/** A hand-written validation, to keep the workshop free of class-validator. */
export const CreateIssueDto = {
  parse(body: unknown): NewIssue {
    const { title, priority } = (body ?? {}) as Record<string, unknown>;
    if (typeof title !== 'string' || title.trim() === '') {
      // Expected: the caller sent an invalid form.
      throw new BadRequestException('title is required');
    }
    if (priority !== undefined && priority !== 1 && priority !== 2 && priority !== 3) {
      throw new BadRequestException('priority must be 1, 2 or 3');
    }
    return { title: title.trim(), priority: priority as NewIssue['priority'] };
  },
};
