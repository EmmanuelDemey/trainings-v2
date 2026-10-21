// An attachment as the upload service sends it: JSON, so `unknown` until checked.
import type { Attachment } from './attachments.ts';

export class InvalidAttachmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAttachmentError';
  }
}

/**
 * TODO 4: throws an InvalidAttachmentError with `message` unless `condition`
 * holds — and tells the checker it does, for the rest of the block.
 */
export function assert(condition: unknown, message: string): void {}

/**
 * TODO 4: check every field the kind needs, and build the attachment from them
 * — never return `input` itself. Read tests/parse.spec.ts for the messages.
 */
export function parseAttachment(input: unknown): Attachment {
  throw new InvalidAttachmentError('TODO 4');
}
