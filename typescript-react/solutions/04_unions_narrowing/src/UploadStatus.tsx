// What the user reads under the upload button.
import { assertNever } from './attachments.ts';
import type { Upload } from './upload.ts';

export function UploadStatus({ upload }: { upload: Upload }) {
  switch (upload.status) {
    case 'idle':
      return <p>Choose a file</p>;
    case 'uploading':
      return (
        <p>
          <progress value={upload.progress} /> Uploading… {Math.round(upload.progress * 100)}%
        </p>
      );
    case 'done':
      return <p>Uploaded: {upload.attachment.kind}</p>;
    case 'failed':
      return <p role="alert">Failed: {upload.error}</p>;
    default:
      return assertNever(upload);
  }
}
