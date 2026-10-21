// What a post of the blog can carry: an image, a video, or a sound. Each kind
// has the fields it needs — and only those.

export interface Image {
  kind: 'image';
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface Video {
  kind: 'video';
  url: string;
  thumbnailUrl: string;
  /** In seconds. */
  duration: number;
  autoplay: boolean;
}

export interface Audio {
  kind: 'audio';
  url: string;
  /** In seconds. */
  duration: number;
}

export type Attachment = Image | Video | Audio;

export type AttachmentKind = Attachment['kind'];

/** Stops the build when a case is forgotten: nothing but `never` gets here. */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

/** The HTML of an attachment. */
export function render(attachment: Attachment): string {
  switch (attachment.kind) {
    case 'image':
      return `<img src="${attachment.url}" alt="${attachment.altText}" width="${attachment.width}" height="${attachment.height}">`;
    case 'video':
      return `<video src="${attachment.url}" poster="${attachment.thumbnailUrl}"${attachment.autoplay ? ' autoplay muted' : ''}></video>`;
    case 'audio':
      return `<audio src="${attachment.url}" controls></audio>`;
    default:
      return assertNever(attachment);
  }
}

/** True for what plays over time: a video or a sound. */
export function isPlayable(attachment: Attachment): attachment is Video | Audio {
  return 'duration' in attachment;
}

/** How long the playable attachments of a post last, in seconds. */
export function totalDuration(attachments: readonly Attachment[]): number {
  return attachments.filter(isPlayable).reduce((total, attachment) => total + attachment.duration, 0);
}

/** `3:07` — or `1:02:05` past an hour. */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
