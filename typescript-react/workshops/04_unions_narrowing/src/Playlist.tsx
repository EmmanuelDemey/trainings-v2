// What plays in a post — videos and sounds — and how long it lasts.
import { formatDuration, isPlayable, totalDuration, type Attachment } from './attachments.ts';

/**
 * TODO 3: one `<li>` per video or sound — `video — 30:00` — then
 * `Total: 1:02:05`. Reading `attachment.duration` needs no `!` once
 * `isPlayable` is a type guard.
 */
export function Playlist({ attachments }: { attachments: readonly Attachment[] }) {
  return (
    <section aria-label="Playlist">
      <ul>
        {attachments.filter(isPlayable).map((attachment) => (
          <li key={attachment.url}>{attachment.kind}</li>
        ))}
      </ul>
      <p>Total: {formatDuration(totalDuration(attachments))}</p>
    </section>
  );
}
