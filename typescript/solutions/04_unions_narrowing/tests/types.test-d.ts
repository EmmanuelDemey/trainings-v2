import { describe, expectTypeOf, test } from 'vitest';
import { isPlayable } from '../src/attachments.ts';
import type { Attachment, AttachmentKind, Audio, Video } from '../src/attachments.ts';
import { assert } from '../src/parse.ts';
import type { Upload } from '../src/upload.ts';

describe('Attachment', () => {
  test('is discriminated by its kind', () => {
    expectTypeOf<AttachmentKind>().toEqualTypeOf<'image' | 'video' | 'audio'>();
  });

  test('has no field its kind does not need', () => {
    // @ts-expect-error — a sound has no altText
    const _audio: Attachment = { kind: 'audio', url: 'https://x.dev/a.mp3', duration: 1, altText: 'no' };
  });
});

describe('isPlayable', () => {
  test('is a type guard', () => {
    expectTypeOf(isPlayable).guards.toEqualTypeOf<Video | Audio>();
  });
});

describe('assert', () => {
  test('narrows what it checked, for the rest of the block', () => {
    const value: unknown = 'https://x.dev';
    assert(typeof value === 'string', 'not a string');
    expectTypeOf(value).toEqualTypeOf<string>();
  });
});

describe('Upload', () => {
  test('only has a progress while it uploads', () => {
    // @ts-expect-error — a finished upload has no progress
    const _upload: Upload = { status: 'done', progress: 1 };
  });

  test('only has an error when it failed', () => {
    expectTypeOf<Extract<Upload, { error: string }>['status']>().toEqualTypeOf<'failed'>();
  });
});
