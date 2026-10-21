// An attachment as the upload service sends it: JSON, so `unknown` until checked.
import type { Attachment } from './attachments.ts';

export class InvalidAttachmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAttachmentError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Throws unless `condition` holds — and tells the checker it does, after the call. */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new InvalidAttachmentError(message);
}

export function parseAttachment(input: unknown): Attachment {
  assert(isRecord(input), 'An attachment is an object');
  const { kind, url } = input;
  assert(typeof url === 'string' && url.startsWith('https://'), 'url must be an https URL');

  if (kind === 'image') {
    const { altText, width, height } = input;
    assert(typeof altText === 'string' && altText.trim() !== '', 'An image needs an altText');
    assert(typeof width === 'number' && typeof height === 'number', 'An image needs a width and a height');
    return { kind, url, altText, width, height };
  }

  if (kind === 'video' || kind === 'audio') {
    const { duration } = input;
    assert(typeof duration === 'number' && duration > 0, `A ${kind} needs a positive duration`);
    if (kind === 'audio') return { kind, url, duration };
    const { thumbnailUrl, autoplay = false } = input;
    assert(typeof thumbnailUrl === 'string', 'A video needs a thumbnailUrl');
    assert(typeof autoplay === 'boolean', 'autoplay must be a boolean');
    return { kind, url, duration, thumbnailUrl, autoplay };
  }

  throw new InvalidAttachmentError(`Unknown kind: ${String(kind)}`);
}
