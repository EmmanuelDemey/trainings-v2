// What a post of the blog can carry: an image, a video, or a sound.

/**
 * TODO 1: one type for every attachment — every field optional, and `kind` any
 * string. `{ kind: 'audio', altText: 'no' }` compiles. Split it into `Image`,
 * `Video` and `Audio`, each with a literal `kind` and the fields it needs —
 * read tests/fixtures.ts — and make `Attachment` their union.
 */
export interface Attachment {
  kind: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  /** In seconds. */
  duration?: number;
  autoplay?: boolean;
}

export type Image = Attachment;
export type Video = Attachment;
export type Audio = Attachment;

/** TODO 1: `'image' | 'video' | 'audio'` — derived from Attachment, never written by hand. */
export type AttachmentKind = string;

/** TODO 2: stops the build when a case is forgotten: nothing but `never` gets here. */
export function assertNever(value: unknown): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

/**
 * TODO 2: the HTML of an attachment —
 *   <img src="…" alt="…" width="…" height="…">
 *   <video src="…" poster="…"></video>      (` autoplay muted` when it autoplays)
 *   <audio src="…" controls></audio>
 */
export function render(attachment: Attachment): string {
  return '';
}

/** TODO 3: true for what plays over time — a video or a sound. Make it a type guard. */
export function isPlayable(attachment: Attachment): boolean {
  return false;
}

/** TODO 3: how long the playable attachments of a post last, in seconds. */
export function totalDuration(attachments: readonly Attachment[]): number {
  return 0;
}

/** TODO 3: `3:07` — or `1:02:05` past an hour. */
export function formatDuration(seconds: number): string {
  return '';
}
