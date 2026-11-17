// What the user reads under the upload button.
import type { Upload } from './upload.ts';

/**
 * TODO 6: `Choose a file`, `Uploading… 42%` (after a `<progress>`),
 * `Uploaded: image`, and `Failed: Too big` in a `<p role="alert">`.
 */
export function UploadStatus({ upload }: { upload: Upload }) {
  return <p>{upload.status}</p>;
}
