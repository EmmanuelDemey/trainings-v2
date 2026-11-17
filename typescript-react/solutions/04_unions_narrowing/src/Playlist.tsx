// What plays in a post — videos and sounds — and how long it lasts.
import { formatDuration, isPlayable, totalDuration, type Attachment } from './attachments.ts';

export function Playlist({ attachments }: { attachments: readonly Attachment[] }) {
  return (
    <section aria-label="Playlist">
      <ul>
        {attachments.filter(isPlayable).map((attachment) => (
          <li key={attachment.url}>
            {attachment.kind} — {formatDuration(attachment.duration)}
          </li>
        ))}
      </ul>
      <p>Total: {formatDuration(totalDuration(attachments))}</p>
    </section>
  );
}
