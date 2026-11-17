// One attachment of a post, as the reader sees it.
import type { Attachment } from './attachments.ts';

/**
 * TODO 2: a `switch` on `attachment.kind`, ending on `assertNever` —
 *   <img src alt width height />
 *   <video src poster controls />   (`autoPlay` and `muted` when it autoplays)
 *   <audio src controls />
 */
export function AttachmentView({ attachment }: { attachment: Attachment }) {
  return null;
}
