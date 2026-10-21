// The state of an upload. Each state carries exactly what makes sense in it: no
// `progress` once it is done, no `error` unless it failed.
import { assertNever } from './attachments.ts';
import type { Attachment } from './attachments.ts';

export type Upload =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'done'; attachment: Attachment }
  | { status: 'failed'; error: string };

export type UploadEvent =
  | { type: 'start' }
  | { type: 'progress'; progress: number }
  | { type: 'success'; attachment: Attachment }
  | { type: 'failure'; error: string }
  | { type: 'retry' };

/** The next state. An event that makes no sense in the current state leaves it as it is. */
export function next(upload: Upload, event: UploadEvent): Upload {
  switch (event.type) {
    case 'start':
      return upload.status === 'idle' ? { status: 'uploading', progress: 0 } : upload;
    case 'progress':
      return upload.status === 'uploading' ? { status: 'uploading', progress: event.progress } : upload;
    case 'success':
      return upload.status === 'uploading' ? { status: 'done', attachment: event.attachment } : upload;
    case 'failure':
      return upload.status === 'uploading' ? { status: 'failed', error: event.error } : upload;
    case 'retry':
      return upload.status === 'failed' ? { status: 'uploading', progress: 0 } : upload;
    default:
      return assertNever(event);
  }
}

/** What the user reads under the upload button. */
export function describe(upload: Upload): string {
  switch (upload.status) {
    case 'idle':
      return 'Choose a file';
    case 'uploading':
      return `Uploading… ${Math.round(upload.progress * 100)}%`;
    case 'done':
      return `Uploaded: ${upload.attachment.kind}`;
    case 'failed':
      return `Failed: ${upload.error}`;
    default:
      return assertNever(upload);
  }
}
