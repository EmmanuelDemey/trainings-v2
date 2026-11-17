// One attachment of a post, as the reader sees it.
import { assertNever, type Attachment } from './attachments.ts';

export function AttachmentView({ attachment }: { attachment: Attachment }) {
  switch (attachment.kind) {
    case 'image':
      return <img src={attachment.url} alt={attachment.altText} width={attachment.width} height={attachment.height} />;
    case 'video':
      return (
        <video
          src={attachment.url}
          poster={attachment.thumbnailUrl}
          autoPlay={attachment.autoplay}
          muted={attachment.autoplay}
          controls
        />
      );
    case 'audio':
      return <audio src={attachment.url} controls />;
    default:
      return assertNever(attachment);
  }
}
